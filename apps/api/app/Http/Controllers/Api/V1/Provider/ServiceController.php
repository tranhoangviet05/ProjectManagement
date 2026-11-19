<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\StoreServiceRequest;
use App\Http\Requests\Provider\UpdateServiceRequest;
use App\Http\Requests\Provider\UploadServiceMediaRequest;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServiceMedia;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
            ->with(['category', 'location', 'media'])
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
     * Tạo mới dịch vụ (tour / khách sạn / homestay / phương tiện) kèm lịch trình.
     */
    public function store(StoreServiceRequest $request): JsonResponse
    {
        $provider = $this->resolveProviderProfile($request);
        if (! $provider) {
            return $this->forbiddenProviderResponse();
        }

        $validated = $request->validated();
        $targetStatus = $validated['status'] ?? ServiceStatus::Draft->value;

        if ($targetStatus === ServiceStatus::PendingReview->value && $provider->status !== ProviderStatus::Approved->value) {
            return response()->json([
                'success' => false,
                'message' => 'Hồ sơ đối tác cần được Admin phê duyệt KYC trước khi gửi duyệt dịch vụ.',
            ], 403);
        }

        $service = DB::transaction(function () use ($provider, $validated, $targetStatus) {
            $service = Service::create([
                'provider_id' => $provider->id,
                'category_id' => $validated['category_id'] ?? null,
                'location_id' => $validated['location_id'] ?? null,
                'name' => $validated['name'],
                'slug' => $this->generateUniqueSlug($validated['name']),
                'description' => $validated['description'] ?? null,
                'type' => $validated['type'],
                'status' => $targetStatus,
                'base_price' => $validated['base_price'],
                'price_unit' => $validated['price_unit'],
                'max_guests' => $validated['max_guests'],
                'duration_days' => $validated['duration_days'] ?? 1,
                'duration_nights' => $validated['duration_nights'] ?? 0,
                'address' => $validated['address'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'amenities' => $validated['amenities'] ?? [],
                'includes' => $validated['includes'] ?? [],
                'excludes' => $validated['excludes'] ?? [],
            ]);

            if (! empty($validated['schedules'])) {
                $this->syncSchedules($service, $validated['schedules']);
            }

            return $service;
        });

        $service->load(['category', 'location', 'media', 'schedules']);

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
            ->with(['category', 'location', 'media', 'schedules'])
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
     * Cập nhật thông tin dịch vụ và lịch trình.
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

        DB::transaction(function () use ($service, $validated) {
            $updateData = collect($validated)->except(['schedules'])->toArray();

            if (isset($updateData['name']) && $updateData['name'] !== $service->name) {
                $updateData['slug'] = $this->generateUniqueSlug($updateData['name'], $service->id);
            }

            if (isset($updateData['status']) && $updateData['status'] === ServiceStatus::PendingReview->value) {
                $updateData['rejection_reason'] = null;
            }

            $service->update($updateData);

            if (array_key_exists('schedules', $validated)) {
                $this->syncSchedules($service, $validated['schedules'] ?? []);
            }
        });

        $service->load(['category', 'location', 'media', 'schedules']);

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

        // Nếu vừa xóa ảnh bìa, tự động chọn ảnh đầu tiên còn lại làm ảnh bìa mới
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
            'max_guests' => $service->max_guests,
            'duration_days' => $service->duration_days,
            'duration_nights' => $service->duration_nights,
            'cover_image' => $coverMedia?->url,
            'media_count' => $service->media->count(),
            'rating_avg' => $service->rating_avg,
            'total_bookings' => $service->total_bookings,
            'rejection_reason' => $service->rejection_reason,
            'created_at' => $service->created_at?->toISOString(),
            'updated_at' => $service->updated_at?->toISOString(),
        ];
    }

    protected function formatServiceDetail(Service $service): array
    {
        $coverMedia = $service->media->firstWhere('is_cover', true) ?? $service->media->first();

        return array_merge($service->toArray(), [
            'cover_image' => $coverMedia?->url,
        ]);
    }
}
