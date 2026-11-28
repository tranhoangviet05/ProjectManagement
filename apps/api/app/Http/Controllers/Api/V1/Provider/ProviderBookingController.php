<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderBookingController extends Controller
{
    /**
     * GET /api/v1/provider/bookings
     * Danh sách đơn đặt chỗ thuộc các dịch vụ của Nhà cung cấp hiện tại.
     */
    public function index(Request $request): JsonResponse
    {
        $provider = $request->user()?->providerProfile;
        if (! $provider) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản chưa có hồ sơ Nhà cung cấp.',
            ], 403);
        }

        if (class_exists(BookingService::class)) {
            app(BookingService::class)->expireStaleHolds();
        }

        $status = trim((string) $request->query('status', 'all'));
        $search = trim((string) $request->query('q', ''));
        $perPage = min(max((int) $request->query('per_page', 15), 1), 50);

        $baseQuery = Booking::query()->where('provider_id', $provider->id);

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $baseQuery->where(function ($sub) use ($like) {
                $sub->where('booking_code', 'ilike', $like)
                    ->orWhere('contact_name', 'ilike', $like)
                    ->orWhere('contact_phone', 'ilike', $like)
                    ->orWhereHas('service', fn ($s) => $s->where('name', 'ilike', $like));
            });
        }

        $countsRaw = (clone $baseQuery)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        $counts = [
            'all' => array_sum(array_map('intval', $countsRaw)),
            'pending_payment' => (int) ($countsRaw['pending_payment'] ?? 0),
            'confirmed' => (int) ($countsRaw['confirmed'] ?? 0),
            'checked_in' => (int) ($countsRaw['checked_in'] ?? 0),
            'completed' => (int) ($countsRaw['completed'] ?? 0),
            'cancelled' => (int) ($countsRaw['cancelled'] ?? 0),
            'refunded' => (int) ($countsRaw['refunded'] ?? 0),
        ];

        $listQuery = (clone $baseQuery)
            ->with([
                'service:id,name,type,price_unit',
                'roomType:id,name,rank',
                'latestPayment:id,booking_id,payment_method,amount,status,paid_at',
            ])
            ->orderByDesc('created_at');

        if ($status !== '' && $status !== 'all') {
            $listQuery->where('status', $status);
        }

        $paginated = $listQuery->paginate($perPage);

        $items = $paginated->getCollection()->map(function (Booking $b) {
            $startDate = $b->start_date ?? $b->check_in_date;
            $endDate = $b->end_date ?? $b->check_out_date;
            $quantity = (int) ($b->quantity ?? (($b->num_adults ?? 1) + ($b->num_children ?? 0)));
            $depositRate = (int) ($b->deposit_rate ?? 100);
            $depositAmount = (float) ($b->deposit_amount ?? $b->total_amount);
            $remainingAmount = (float) ($b->remaining_amount ?? 0);

            return [
                'id' => $b->id,
                'booking_code' => $b->booking_code,
                'status' => $b->status,
                'checked_in_at' => $b->checked_in_at?->toIso8601String(),
                'payment_expires_at' => $b->payment_expires_at?->toIso8601String(),
                'start_date' => $startDate?->format('Y-m-d'),
                'end_date' => $endDate?->format('Y-m-d'),
                'quantity' => $quantity,
                'duration_units' => (int) ($b->duration_units ?? 1),
                'total_amount' => (float) $b->total_amount,
                'deposit_rate' => $depositRate,
                'deposit_amount' => $depositAmount,
                'remaining_amount' => $remainingAmount,
                'contact_name' => $b->contact_name,
                'contact_phone' => $b->contact_phone,
                'contact_email' => $b->contact_email,
                'created_at' => $b->created_at?->toIso8601String(),
                'service' => $b->service ? [
                    'id' => $b->service->id,
                    'name' => $b->service->name,
                    'type' => $b->service->type,
                ] : null,
                'room_type' => $b->roomType ? [
                    'id' => $b->roomType->id,
                    'name' => $b->roomType->name,
                ] : null,
                'latest_payment' => $b->latestPayment,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'counts' => $counts,
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * GET /api/v1/provider/bookings/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $provider = $request->user()?->providerProfile;
        if (! $provider) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản chưa có hồ sơ Nhà cung cấp.',
            ], 403);
        }

        if (class_exists(BookingService::class)) {
            app(BookingService::class)->expireStaleHolds();
        }

        $relations = [
            'service:id,name,type,address,price_unit',
            'roomType:id,name,rank',
            'coupon:id,code',
            'payments',
        ];

        if (method_exists(Booking::class, 'servicePromotion')) {
            $relations[] = 'servicePromotion.holidayCampaign:id,name';
        }

        $booking = Booking::query()
            ->where('id', $id)
            ->where('provider_id', $provider->id)
            ->with($relations)
            ->first();

        if (! $booking) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn đặt chỗ.',
            ], 404);
        }

        $booking->makeHidden(['qr_checkin_token']);

        $payload = $booking->toArray();
        $payload['start_date'] = $payload['start_date'] ?? ($booking->check_in_date?->format('Y-m-d'));
        $payload['end_date'] = $payload['end_date'] ?? ($booking->check_out_date?->format('Y-m-d'));
        $payload['quantity'] = $payload['quantity'] ?? (($booking->num_adults ?? 1) + ($booking->num_children ?? 0));
        $payload['duration_units'] = $payload['duration_units'] ?? 1;
        $payload['deposit_rate'] = $payload['deposit_rate'] ?? 100;
        $payload['deposit_amount'] = $payload['deposit_amount'] ?? (float) $booking->total_amount;
        $payload['remaining_amount'] = $payload['remaining_amount'] ?? 0;

        return response()->json([
            'success' => true,
            'data' => $payload,
        ]);
    }
}
