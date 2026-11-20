<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\UpsertAvailabilityRequest;
use App\Models\Service;
use App\Models\ServiceAvailability;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ServiceAvailabilityController extends Controller
{
    /**
     * GET /api/v1/provider/services/{serviceId}/availability
     * Lấy lịch phục vụ theo khoảng ngày (mặc định 30 ngày kể từ hôm nay).
     */
    public function index(Request $request, int $serviceId): JsonResponse
    {
        $service = $this->findOwnedService($request, $serviceId);
        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ thuộc quyền sở hữu của bạn.',
            ], 404);
        }

        $fromDate = $request->filled('from')
            ? Carbon::parse($request->string('from')->toString())->toDateString()
            : Carbon::today()->toDateString();

        $toDate = $request->filled('to')
            ? Carbon::parse($request->string('to')->toString())->toDateString()
            : Carbon::parse($fromDate)->addDays(29)->toDateString();

        $records = $service->availability()
            ->whereBetween('available_date', [$fromDate, $toDate])
            ->orderBy('available_date')
            ->get()
            ->map(function (ServiceAvailability $item) use ($service) {
                $remaining = max(0, $item->total_slots - $item->booked_slots);
                $effectivePrice = $item->price_override ?? $service->base_price;

                return [
                    'id' => $item->id,
                    'service_id' => $item->service_id,
                    'available_date' => $item->available_date?->format('Y-m-d'),
                    'total_slots' => $item->total_slots,
                    'booked_slots' => $item->booked_slots,
                    'remaining_slots' => $remaining,
                    'price_override' => $item->price_override,
                    'effective_price' => (string) number_format((float) $effectivePrice, 2, '.', ''),
                    'is_blocked' => $item->is_blocked,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'service' => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'type' => $service->type,
                    'base_price' => $service->base_price,
                    'price_unit' => $service->price_unit,
                ],
                'availabilities' => $records,
            ],
        ]);
    }

    /**
     * PUT /api/v1/provider/services/{serviceId}/availability
     * Cấu hình hàng loạt (bulk upsert) theo ngày hoặc khoảng ngày.
     */
    public function upsert(UpsertAvailabilityRequest $request, int $serviceId): JsonResponse
    {
        $service = $this->findOwnedService($request, $serviceId);
        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ thuộc quyền sở hữu của bạn.',
            ], 404);
        }

        $validated = $request->validated();
        $targetDates = $this->resolveTargetDates($validated);

        if (empty($targetDates)) {
            throw ValidationException::withMessages([
                'dates' => ['Không có ngày nào khớp với bộ lọc đã chọn.'],
            ]);
        }

        $totalSlots = (int) $validated['total_slots'];
        $priceOverride = array_key_exists('price_override', $validated) && $validated['price_override'] !== null
            ? $validated['price_override']
            : null;
        $isBlocked = (bool) $validated['is_blocked'];

        $updatedRecords = DB::transaction(function () use ($service, $targetDates, $totalSlots, $priceOverride, $isBlocked) {
            $results = [];

            foreach ($targetDates as $date) {
                /** @var ServiceAvailability|null $existing */
                $existing = $service->availability()
                    ->whereDate('available_date', $date)
                    ->first();

                if ($existing && $totalSlots < $existing->booked_slots) {
                    throw ValidationException::withMessages([
                        'total_slots' => [
                            "Ngày {$date} đã có {$existing->booked_slots} khách đặt, không thể giảm số lượng chỗ xuống {$totalSlots}.",
                        ],
                    ]);
                }

                $record = $service->availability()->updateOrCreate(
                    ['available_date' => $date],
                    [
                        'total_slots' => $totalSlots,
                        'booked_slots' => $existing?->booked_slots ?? 0,
                        'price_override' => $priceOverride,
                        'is_blocked' => $isBlocked,
                    ]
                );

                $results[] = [
                    'id' => $record->id,
                    'service_id' => $record->service_id,
                    'available_date' => $record->available_date?->format('Y-m-d'),
                    'total_slots' => $record->total_slots,
                    'booked_slots' => $record->booked_slots,
                    'remaining_slots' => max(0, $record->total_slots - $record->booked_slots),
                    'price_override' => $record->price_override,
                    'effective_price' => (string) number_format((float) ($record->price_override ?? $service->base_price), 2, '.', ''),
                    'is_blocked' => $record->is_blocked,
                ];
            }

            return $results;
        });

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật lịch phục vụ & giá thành công.',
            'data' => $updatedRecords,
        ]);
    }

    protected function findOwnedService(Request $request, int $serviceId): ?Service
    {
        $provider = $request->user()?->providerProfile;
        if (! $provider) {
            return null;
        }

        return Service::where('provider_id', $provider->id)->find($serviceId);
    }

    /**
     * @return array<int, string>
     */
    protected function resolveTargetDates(array $validated): array
    {
        if (! empty($validated['dates'])) {
            return collect($validated['dates'])
                ->map(fn (string $d) => Carbon::parse($d)->toDateString())
                ->unique()
                ->values()
                ->all();
        }

        $start = Carbon::parse($validated['start_date']);
        $end = ! empty($validated['end_date']) ? Carbon::parse($validated['end_date']) : $start->copy();
        $daysOfWeek = isset($validated['days_of_week']) ? array_map('intval', $validated['days_of_week']) : null;

        $dates = [];
        foreach (CarbonPeriod::create($start, $end) as $day) {
            if ($daysOfWeek !== null && ! in_array($day->dayOfWeek, $daysOfWeek, true)) {
                continue;
            }
            $dates[] = $day->toDateString();
        }

        return $dates;
    }
}
