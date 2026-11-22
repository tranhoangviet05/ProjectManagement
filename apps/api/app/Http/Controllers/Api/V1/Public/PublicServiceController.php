<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicServiceController extends Controller
{
    /**
     * GET /api/v1/public/services
     * Tìm kiếm & khám phá các dịch vụ du lịch đang mở bán (status = active, provider approved).
     */
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $locationId = $request->query('location_id');
        $locationSlug = trim((string) $request->query('location_slug', ''));
        $categoryId = $request->query('category_id');
        $type = trim((string) $request->query('type', ''));
        $group = trim((string) $request->query('group', ''));
        $minPrice = $request->query('min_price');
        $maxPrice = $request->query('max_price');
        $sort = (string) $request->query('sort', 'newest');
        $perPage = min(max((int) $request->query('per_page', 15), 1), 50);

        $query = Service::query()
            ->where('status', ServiceStatus::Active->value)
            ->whereHas('provider', fn ($p) => $p->where('status', ProviderStatus::Approved->value))
            ->with([
                'location:id,name,slug,parent_id',
                'category:id,name,slug',
                'provider:id,business_name,address',
                'media' => fn ($m) => $m->orderByDesc('is_cover')->orderBy('sort_order'),
            ])
            ->withCount('reviews');

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($sub) use ($like) {
                $sub->where('name', 'ilike', $like)
                    ->orWhere('description', 'ilike', $like)
                    ->orWhere('address', 'ilike', $like)
                    ->orWhereHas('location', fn ($l) => $l->where('name', 'ilike', $like));
            });
        }

        // Lọc theo location_id hoặc location_slug (bao gồm cả điểm đến con trực thuộc)
        $targetLocationId = null;
        if (is_numeric($locationId)) {
            $targetLocationId = (int) $locationId;
        } elseif ($locationSlug !== '') {
            $targetLocationId = Location::where('slug', $locationSlug)->value('id');
        }

        if ($targetLocationId !== null) {
            $childIds = Location::where('parent_id', $targetLocationId)->pluck('id')->all();
            $query->whereIn('location_id', array_merge([$targetLocationId], $childIds));
        }

        if (is_numeric($categoryId)) {
            $query->where('category_id', (int) $categoryId);
        }

        if ($type !== '' && $type !== 'all') {
            $types = array_filter(array_map('trim', explode(',', $type)));
            if (count($types) === 1) {
                $query->where('type', $types[0]);
            } elseif (count($types) > 1) {
                $query->whereIn('type', $types);
            }
        } elseif ($group !== '') {
            if ($group === 'accommodation') {
                $query->whereIn('type', ['hotel', 'homestay']);
            } elseif ($group === 'entertainment') {
                $query->where('type', 'tour');
            } elseif ($group === 'vehicle') {
                $query->where('type', 'vehicle');
            } elseif ($group === 'train') {
                $query->where(function ($sub) {
                    $sub->where('type', 'train')
                        ->orWhereHas('category', function ($c) {
                            $c->where('slug', 'ilike', '%tau%')
                                ->orWhere('name', 'ilike', '%vé tàu%');
                        });
                });
            }
        }

        if (is_numeric($minPrice)) {
            $query->where('base_price', '>=', (float) $minPrice);
        }

        if (is_numeric($maxPrice)) {
            $query->where('base_price', '<=', (float) $maxPrice);
        }

        match ($sort) {
            'price_asc' => $query->orderBy('base_price', 'asc'),
            'price_desc' => $query->orderBy('base_price', 'desc'),
            'rating' => $query->orderByDesc('rating_avg')->orderByDesc('total_bookings'),
            default => $query->latest('created_at'),
        };

        $paginated = $query->paginate($perPage);

        $items = collect($paginated->items())->map(function (Service $service) {
            $cover = $service->media->firstWhere('is_cover', true) ?? $service->media->first();

            return [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'type' => $service->type,
                'base_price' => (float) $service->base_price,
                'price_unit' => $service->price_unit,
                'address' => $service->address,
                'description' => $service->description,
                'amenities' => is_array($service->amenities) ? array_slice($service->amenities, 0, 4) : [],
                'includes' => is_array($service->includes) ? array_slice($service->includes, 0, 3) : [],
                'rating_avg' => (float) ($service->rating_avg ?? 0),
                'reviews_count' => (int) ($service->reviews_count ?? 0),
                'total_bookings' => (int) ($service->total_bookings ?? 0),
                'cover_image' => $cover?->url,
                'location' => $service->location ? [
                    'id' => $service->location->id,
                    'name' => $service->location->name,
                    'slug' => $service->location->slug,
                ] : null,
                'category' => $service->category ? [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                ] : null,
                'provider' => $service->provider ? [
                    'id' => $service->provider->id,
                    'business_name' => $service->provider->business_name,
                ] : null,
            ];
        })->values();

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
     * GET /api/v1/public/services/{id}
     * Xem chi tiết đầy đủ dịch vụ công khai.
     */
    public function show(int $id): JsonResponse
    {
        $service = Service::query()
            ->where('status', ServiceStatus::Active->value)
            ->whereHas('provider', fn ($p) => $p->where('status', ProviderStatus::Approved->value))
            ->with([
                'location:id,name,slug,parent_id',
                'location.parent:id,name,slug',
                'category:id,name,slug',
                'provider:id,business_name,phone,address',
                'media' => fn ($m) => $m->orderByDesc('is_cover')->orderBy('sort_order'),
                'schedules',
                'roomTypes' => fn ($r) => $r->where('status', 'active')->orderBy('base_price'),
                'availability' => fn ($q) => $q->where('available_date', '>=', now()->toDateString())
                    ->where('is_blocked', false)
                    ->orderBy('available_date')
                    ->limit(30),
                'reviews' => fn ($rv) => $rv->with('user:id,name,avatar_url')->latest()->limit(10),
            ])
            ->withCount('reviews')
            ->find($id);

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ hoặc dịch vụ chưa được mở bán.',
            ], 404);
        }

        $cover = $service->media->firstWhere('is_cover', true) ?? $service->media->first();

        return response()->json([
            'success' => true,
            'data' => array_merge($service->toArray(), [
                'base_price' => (float) $service->base_price,
                'rating_avg' => (float) ($service->rating_avg ?? 0),
                'reviews_count' => (int) ($service->reviews_count ?? 0),
                'total_bookings' => (int) ($service->total_bookings ?? 0),
                'cover_image' => $cover?->url,
            ]),
        ]);
    }
}
