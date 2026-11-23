<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Enums\ServiceType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\StoreServiceRequest;
use App\Http\Requests\Provider\UpdateServiceRequest;
use App\Http\Requests\Provider\UploadServiceMediaRequest;
use App\Models\BusinessType;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServiceAvailability;
use App\Models\ServiceMedia;
use App\Services\MediaService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ServiceController extends Controller
{
    public function __construct(
        protected MediaService $mediaService
    ) {}

    /**
     * Danh sách dịch vụ thuộc sở hữu của Provider hiện tại.
     */
    public function index(Request $request): JsonResponse
    {
        $provider = $this->resolveProviderProfile($request);
        if (! $provider) {
            return $this->forbiddenProviderResponse();
        }

        $query = Service::query()
            ->where('provider_id', $provider->id)
            ->with(['category', 'location', 'media', 'roomTypes', 'availability'])
            ->withSum(['bookings as sold_quantity' => fn ($b) => $b->whereNotIn('status', ['cancelled', 'refunded'])], 'quantity')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }

        if ($request->filled('q')) {
            $keyword = trim($request->string('q')->toString());
            $query->where('name', 'like', '%'.$keyword.'%');
        }

        $perPage = min(max((int) $request->integer('per_page', 15), 1), 50);
        $paginated = $query->paginate($perPage);

        $items = collect($paginated->items())->map(fn (Service $service) => $this->formatServiceSummary($service));

        return response()->json([
            'success' => true,
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
     * Tạo mới dịch vụ (tự động ánh xạ type & price_unit theo business_type của Provider).
     */
    public function store(StoreServiceRequest $request): JsonResponse
    {
        $provider = $this->resolveProviderProfile($request);
        if (! $provider) {
            return $this->forbiddenProviderResponse();
        }

        $mapping = $this->resolveServiceTypeMapping($provider);
        $validated = $request->validated();
        $targetStatus = $validated['status'] ?? ServiceStatus::Draft->value;

        if ($targetStatus === ServiceStatus::PendingReview->value && $provider->status !== ProviderStatus::Approved->value) {
            return response()->json([
                'success' => false,
                'message' => 'Hồ sơ đối tác cần được Admin phê duyệt KYC trước khi gửi duyệt dịch vụ.',
            ], 403);
        }

        if ($mapping['group'] === 'accommodation' && empty($validated['room_types'])) {
            throw ValidationException::withMessages([
                'room_types' => ['Dịch vụ Chỗ ở phải có ít nhất 1 loại phòng.'],
            ]);
        }

        $service = DB::transaction(function () use ($provider, $validated, $targetStatus, $mapping) {
            $service = Service::create([
                'provider_id' => $provider->id,
                'category_id' => $validated['category_id'],
                'location_id' => $validated['location_id'],
                'name' => $validated['name'],
                'slug' => $this->generateUniqueSlug($validated['name']),
                'description' => $validated['description'],
                'type' => $mapping['type'],
                'status' => $targetStatus,
                'base_price' => $validated['base_price'],
                'price_unit' => $mapping['price_unit'],
                'address' => $validated['address'],
                'amenities' => $validated['amenities'] ?? [],
                'includes' => $validated['includes'] ?? [],
                'excludes' => $validated['excludes'] ?? [],
            ]);

            if (array_key_exists('policy_ids', $validated)) {
                $service->policies()->sync($validated['policy_ids'] ?? []);
            }

            if ($mapping['group'] === 'accommodation' && ! empty($validated['room_types'])) {
                $this->syncRoomTypes($service, $validated['room_types']);
            }

            if ($mapping['group'] === 'tour') {
                $availabilities = ! empty($validated['availabilities'])
                    ? $validated['availabilities']
                    : $this->buildDefault15DaysAvailability((int) ($validated['daily_slots'] ?? 15));

                $this->syncAvailabilities($service, $availabilities);

                if (! empty($validated['schedules'])) {
                    $this->syncSchedules($service, $validated['schedules']);
                }
            }

            return $service;
        });

        $service->load(['category', 'location', 'media', 'schedules', 'roomTypes', 'availability', 'policies']);

        return response()->json([
            'success' => true,
            'message' => 'Tạo dịch vụ thành công.',
            'data' => $this->formatServiceDetail($service),
        ], 201);
    }

    /**
     * Xem chi tiết một dịch vụ của Provider.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $provider = $this->resolveProviderProfile($request);
        if (! $provider) {
            return $this->forbiddenProviderResponse();
        }

        $service = Service::query()
            ->where('provider_id', $provider->id)
            ->with(['category', 'location', 'media', 'schedules', 'roomTypes', 'availability', 'policies'])
            ->find($id);

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ yêu cầu.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatServiceDetail($service),
        ]);
    }

    /**
     * Cập nhật thông tin dịch vụ, loại phòng / lịch 15 ngày / lịch trình.
     */
    public function update(UpdateServiceRequest $request, int $id): JsonResponse
    {
        $provider = $this->resolveProviderProfile($request);
        if (! $provider) {
            return $this->forbiddenProviderResponse();
        }

        $service = Service::where('provider_id', $provider->id)->find($id);
        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ yêu cầu.',
            ], 404);
        }

        $mapping = $this->resolveServiceTypeMapping($provider);
        $validated = $request->validated();

        if (
            isset($validated['status'])
            && $validated['status'] === ServiceStatus::PendingReview->value
            && $provider->status !== ProviderStatus::Approved->value
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Hồ sơ đối tác cần được Admin phê duyệt KYC trước khi gửi duyệt dịch vụ.',
            ], 403);
        }

        DB::transaction(function () use ($service, $validated, $mapping) {
            $updateData = collect($validated)
                ->except(['schedules', 'room_types', 'availabilities', 'policy_ids'])
                ->toArray();

            $updateData['type'] = $mapping['type'];
            $updateData['price_unit'] = $mapping['price_unit'];

            if (isset($updateData['name']) && $updateData['name'] !== $service->name) {
                $updateData['slug'] = $this->generateUniqueSlug($updateData['name'], $service->id);
            }

            if (isset($updateData['status']) && $updateData['status'] === ServiceStatus::PendingReview->value) {
                $updateData['rejection_reason'] = null;
            }

            $service->update($updateData);

            if (array_key_exists('policy_ids', $validated)) {
                $service->policies()->sync($validated['policy_ids'] ?? []);
            }

            if ($mapping['group'] === 'accommodation' && array_key_exists('room_types', $validated)) {
                $this->syncRoomTypes($service, $validated['room_types'] ?? []);
            }

            if ($mapping['group'] === 'tour') {
                if (array_key_exists('availabilities', $validated) && ! empty($validated['availabilities'])) {
                    $this->syncAvailabilities($service, $validated['availabilities']);
                }

                if (array_key_exists('schedules', $validated)) {
                    $this->syncSchedules($service, $validated['schedules'] ?? []);
                }
            }
        });

        $service->load(['category', 'location', 'media', 'schedules', 'roomTypes', 'availability', 'policies']);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật dịch vụ thành công.',
            'data' => $this->formatServiceDetail($service),
        ]);
    }

    /**
     * Xóa mềm dịch vụ (Soft Delete) để bảo toàn lịch sử đơn hàng.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $provider = $this->resolveProviderProfile($request);
        if (! $provider) {
            return $this->forbiddenProviderResponse();
        }

        $service = Service::where('provider_id', $provider->id)->find($id);
        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ yêu cầu.',
            ], 404);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa dịch vụ thành công.',
        ]);
    }

    /**
     * Upload nhiều ảnh/video vào album của dịch vụ.
     */
    public function uploadMedia(UploadServiceMediaRequest $request, int $id): JsonResponse
    {
        $provider = $this->resolveProviderProfile($request);
        if (! $provider) {
            return $this->forbiddenProviderResponse();
        }

        $service = Service::where('provider_id', $provider->id)->find($id);
        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ yêu cầu.',
            ], 404);
        }

        $files = $request->file('files', []);
        $coverIndex = $request->has('cover_index') ? (int) $request->input('cover_index') : null;
        $hasExistingCover = $service->media()->where('is_cover', true)->exists();
        $nextSortOrder = ((int) $service->media()->max('sort_order')) + 1;

        $createdMedia = DB::transaction(function () use ($service, $files, $coverIndex, $hasExistingCover, $nextSortOrder) {
            if ($coverIndex !== null) {
                $service->media()->update(['is_cover' => false]);
            }

            $records = [];
            foreach ($files as $index => $file) {
                $isCover = $coverIndex !== null
                    ? ($index === $coverIndex)
                    : (! $hasExistingCover && $index === 0);

                $uploadType = $isCover ? 'service_cover' : 'service_gallery';
                $uploaded = $this->mediaService->uploadPublicFile($file, $uploadType);
                $mediaType = str_starts_with($uploaded['mime_type'], 'video/') ? 'video' : 'image';

                $records[] = $service->media()->create([
                    'url' => $uploaded['url'],
                    'type' => $mediaType,
                    'is_cover' => $isCover,
                    'sort_order' => $nextSortOrder + $index,
                ]);
            }

            return $records;
        });

        return response()->json([
            'success' => true,
            'message' => 'Tải lên album ảnh dịch vụ thành công.',
            'data' => $createdMedia,
        ], 201);
    }

    /**
     * Đặt một ảnh trong album làm ảnh bìa (is_cover = true).
     */
    public function setCoverMedia(Request $request, int $id, int $mediaId): JsonResponse
    {
        $provider = $this->resolveProviderProfile($request);
        if (! $provider) {
            return $this->forbiddenProviderResponse();
        }

        $service = Service::where('provider_id', $provider->id)->find($id);
        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ yêu cầu.',
            ], 404);
        }

        /** @var ServiceMedia|null $targetMedia */
        $targetMedia = $service->media()->where('id', $mediaId)->first();
        if (! $targetMedia) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tệp media trong dịch vụ này.',
            ], 404);
        }

        DB::transaction(function () use ($service, $targetMedia) {
            $service->media()->update(['is_cover' => false]);
            $targetMedia->update(['is_cover' => true]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật ảnh bìa dịch vụ.',
            'data' => $targetMedia->fresh(),
        ]);
    }

    /**
     * Xóa ảnh/video khỏi album và xóa file vật lý trên storage.
     */
    public function deleteMedia(Request $request, int $id, int $mediaId): JsonResponse
    {
        $provider = $this->resolveProviderProfile($request);
        if (! $provider) {
            return $this->forbiddenProviderResponse();
        }

        $service = Service::where('provider_id', $provider->id)->find($id);
        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ yêu cầu.',
            ], 404);
        }

        /** @var ServiceMedia|null $targetMedia */
        $targetMedia = $service->media()->where('id', $mediaId)->first();
        if (! $targetMedia) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tệp media trong dịch vụ này.',
            ], 404);
        }

        $wasCover = (bool) $targetMedia->is_cover;
        $this->mediaService->deleteFile($targetMedia->url, 'public');
        $targetMedia->delete();

        if ($wasCover) {
            $fallback = $service->media()->where('type', 'image')->orderBy('sort_order')->first();
            if ($fallback) {
                $fallback->update(['is_cover' => true]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa tệp media khỏi album.',
        ]);
    }

    protected function resolveProviderProfile(Request $request): ?ProviderProfile
    {
        $user = $request->user();

        return $user?->providerProfile;
    }

    protected function forbiddenProviderResponse(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Tài khoản chưa có hồ sơ Nhà cung cấp hợp lệ.',
        ], 403);
    }

    /**
     * Suy ra type dịch vụ và đơn vị tính cố định từ Loại hình kinh doanh của Provider.
     *
     * @return array{type: string, price_unit: string, group: string}
     */
    protected function resolveServiceTypeMapping(ProviderProfile $provider): array
    {
        $provider->loadMissing('businessType');
        /** @var BusinessType|null $businessType */
        $businessType = $provider->businessType;

        if (! $businessType) {
            throw ValidationException::withMessages([
                'business_type_id' => ['Vui lòng cập nhật Loại hình kinh doanh trong Hồ sơ đối tác trước khi tạo dịch vụ.'],
            ]);
        }

        return match ($businessType->slug) {
            'khach-san', 'resort' => [
                'type' => ServiceType::Hotel->value,
                'price_unit' => $businessType->slug === 'resort' ? 'đêm' : 'phòng/đêm',
                'group' => 'accommodation',
            ],
            'homestay', 'villa', 'homestay-villa' => [
                'type' => ServiceType::Homestay->value,
                'price_unit' => $businessType->slug === 'villa' ? 'đêm' : 'phòng/đêm',
                'group' => 'accommodation',
            ],
            'phuong-tien-di-chuyen', 've-tau' => [
                'type' => ServiceType::Vehicle->value,
                'price_unit' => $businessType->slug === 've-tau' ? 'vé' : 'ngày',
                'group' => 'vehicle',
            ],
            default => [
                'type' => ServiceType::Tour->value,
                'price_unit' => 'người',
                'group' => 'tour',
            ],
        };
    }

    protected function generateUniqueSlug(string $name, ?int $ignoreServiceId = null): string
    {
        $baseSlug = Str::slug($name) ?: 'service';
        $slug = $baseSlug;
        $counter = 1;

        while (
            Service::withTrashed()
                ->where('slug', $slug)
                ->when($ignoreServiceId, fn ($q) => $q->where('id', '!=', $ignoreServiceId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    protected function buildDefault15DaysAvailability(int $dailySlots): array
    {
        $days = [];
        $start = Carbon::today();
        for ($i = 0; $i < 15; $i++) {
            $days[] = [
                'available_date' => $start->copy()->addDays($i)->toDateString(),
                'total_slots' => $dailySlots,
                'price_override' => null,
                'is_blocked' => false,
            ];
        }

        return $days;
    }

    protected function syncAvailabilities(Service $service, array $availabilities): void
    {
        foreach ($availabilities as $item) {
            $date = Carbon::parse($item['available_date'])->toDateString();
            $totalSlots = (int) $item['total_slots'];

            /** @var ServiceAvailability|null $existing */
            $existing = $service->availability()->whereDate('available_date', $date)->first();

            if ($existing && $totalSlots < $existing->booked_slots) {
                throw ValidationException::withMessages([
                    'availabilities' => ["Ngày {$date} đã có {$existing->booked_slots} khách đặt, không thể giảm số lượng thấp hơn."],
                ]);
            }

            $service->availability()->updateOrCreate(
                ['available_date' => $date],
                [
                    'total_slots' => $totalSlots,
                    'booked_slots' => $existing?->booked_slots ?? 0,
                    'price_override' => isset($item['price_override']) && $item['price_override'] !== '' ? $item['price_override'] : null,
                    'is_blocked' => (bool) ($item['is_blocked'] ?? false),
                ]
            );
        }
    }

    protected function syncRoomTypes(Service $service, array $roomTypes): void
    {
        $keptIds = [];

        foreach ($roomTypes as $room) {
            $totalRooms = (int) $room['total_rooms'];
            $inventory = isset($room['inventory']) ? min((int) $room['inventory'], $totalRooms) : $totalRooms;

            $attributes = [
                'name' => $room['name'],
                'rank' => $room['rank'] ?? 'standard',
                'description' => $room['description'] ?? null,
                'base_price' => $room['base_price'],
                'total_rooms' => $totalRooms,
                'inventory' => $inventory,
                'capacity_adults' => (int) $room['capacity_adults'],
                'capacity_children' => (int) ($room['capacity_children'] ?? 0),
                'amenities' => $room['amenities'] ?? [],
                'images' => is_array($room['images'] ?? null) ? array_values(array_filter($room['images'])) : [],
                'status' => $room['status'] ?? 'active',
            ];

            if (! empty($room['id'])) {
                $existing = $service->roomTypes()->find($room['id']);
                if ($existing) {
                    $existing->update($attributes);
                    $keptIds[] = $existing->id;

                    continue;
                }
            }

            $created = $service->roomTypes()->create($attributes);
            $keptIds[] = $created->id;
        }

        $service->roomTypes()->whereNotIn('id', $keptIds)->delete();
    }

    protected function syncSchedules(Service $service, array $schedules): void
    {
        $service->schedules()->delete();

        foreach ($schedules as $schedule) {
            $service->schedules()->create([
                'day_number' => (int) $schedule['day_number'],
                'title' => $schedule['title'],
                'description' => $schedule['description'] ?? null,
                'activities' => $schedule['activities'] ?? [],
            ]);
        }
    }

    protected function formatServiceSummary(Service $service): array
    {
        $coverMedia = $service->media->firstWhere('is_cover', true) ?? $service->media->first();

        return [
            'id' => $service->id,
            'provider_id' => $service->provider_id,
            'category_id' => $service->category_id,
            'location_id' => $service->location_id,
            'category' => $service->category,
            'location' => $service->location,
            'name' => $service->name,
            'slug' => $service->slug,
            'type' => $service->type,
            'status' => $service->status,
            'base_price' => $service->base_price,
            'price_unit' => $service->price_unit,
            'cover_image' => $coverMedia?->url,
            'media_count' => $service->media->count(),
            'room_types_count' => $service->roomTypes->count(),
            'availability_count' => $service->availability->count(),
            'rating_avg' => $service->rating_avg,
            'total_bookings' => $service->total_bookings,
            'sold_quantity' => (int) ($service->sold_quantity ?? 0),
            'rejection_reason' => $service->rejection_reason,
            'created_at' => $service->created_at?->toISOString(),
            'updated_at' => $service->updated_at?->toISOString(),
        ];
    }

    protected function formatServiceDetail(Service $service): array
    {
        $coverMedia = $service->media->firstWhere('is_cover', true) ?? $service->media->first();

        $allBookings = $service->bookings()
            ->with(['roomType:id,name'])
            ->latest('created_at')
            ->get();

        $activeBookings = $allBookings->whereNotIn('status', ['cancelled', 'refunded']);
        $paidRevenueBookings = $allBookings->whereIn('status', ['confirmed', 'checked_in', 'completed']);

        $salesOverview = [
            'total_orders' => $activeBookings->count(),
            'total_quantity_sold' => (int) $activeBookings->sum('quantity'),
            'pending_payment_count' => $allBookings->where('status', 'pending_payment')->count(),
            'confirmed_count' => $allBookings->where('status', 'confirmed')->count(),
            'checked_in_count' => $allBookings->where('status', 'checked_in')->count(),
            'completed_count' => $allBookings->where('status', 'completed')->count(),
            'cancelled_count' => $allBookings->whereIn('status', ['cancelled', 'refunded'])->count(),
            'total_revenue' => (float) $paidRevenueBookings->sum('total_amount'),
            'recent_bookings' => $allBookings->take(10)->map(fn ($b) => [
                'id' => $b->id,
                'booking_code' => $b->booking_code,
                'status' => $b->status,
                'start_date' => $b->start_date?->format('Y-m-d'),
                'end_date' => $b->end_date?->format('Y-m-d'),
                'quantity' => (int) $b->quantity,
                'total_amount' => (float) $b->total_amount,
                'deposit_amount' => (float) $b->deposit_amount,
                'contact_name' => $b->contact_name,
                'contact_phone' => $b->contact_phone,
                'room_type_name' => $b->roomType?->name,
                'created_at' => $b->created_at?->toIso8601String(),
            ])->values(),
        ];

        return array_merge($service->toArray(), [
            'cover_image' => $coverMedia?->url,
            'sales_overview' => $salesOverview,
        ]);
    }
}
