<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServicePromotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicServiceController extends Controller
{
    private function resolveActivePromotion(Service $service): ?array
    {
        $now = now();
        $activePromos = $service->promotions->filter(function (ServicePromotion $promo) use ($now) {
            $campaign = $promo->holidayCampaign;

            return $promo->is_active
                && $campaign
                && $campaign->status === 'active'
                && $campaign->starts_at <= $now
                && $campaign->ends_at >= $now;
        });

        if ($activePromos->isEmpty()) {
            return null;
        }

        $best = $activePromos->sortByDesc(function (ServicePromotion $promo) {
            $campaign = $promo->holidayCampaign;
            $boost = max(0, (float) $promo->discount_value - (float) $campaign->discount_value);

            return ((int) $campaign->priority * 10000) + ($boost > 0 ? 5000 + ($boost * 10) : 0);
        })->first();

        $campaign = $best->holidayCampaign;
        $basePrice = (float) $service->base_price;

        if ($best->discount_type === 'fixed') {
            $discountAmount = min($basePrice, (float) $best->discount_value);
        } else {
            $discountAmount = $basePrice * ((float) $best->discount_value / 100);
            if ($campaign->max_discount !== null && $campaign->max_discount > 0) {
                $discountAmount = min($discountAmount, (float) $campaign->max_discount);
            }
        }

        $discountedPrice = max(0, round($basePrice - $discountAmount));
        $boost = max(0, (float) $best->discount_value - (float) $campaign->discount_value);

        return [
            'id' => $best->id,
            'campaign_id' => $campaign->id,
            'campaign_name' => $campaign->name,
            'badge_text' => $campaign->badge_text ?: ('-'.rtrim(rtrim(number_format($best->discount_value, 2, '.', ''), '0'), '.').($best->discount_type === 'fixed' ? '₫' : '%')),
            'discount_type' => $best->discount_type,
            'discount_value' => (float) $best->discount_value,
            'campaign_default_discount' => (float) $campaign->discount_value,
            'discount_boost' => $boost,
            'priority' => (int) $campaign->priority,
            'discounted_price' => $discountedPrice,
            'ends_at' => $campaign->ends_at?->toIso8601String(),
        ];
    }

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
        $hasPets = filter_var($request->query('has_pets', false), FILTER_VALIDATE_BOOLEAN);
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
                'policies:id,name,category,icon',
                'promotions.holidayCampaign',
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

        if ($hasPets) {
            $query->whereHas('policies', fn ($p) => $p->where('name', 'ilike', '%Cho phép mang theo thú cưng%'));
        }

        if ($sort === 'price_asc') {
            $query->orderBy('base_price', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('base_price', 'desc');
        } elseif ($sort === 'rating') {
            $query->orderByDesc('rating_avg')->orderByDesc('total_bookings');
        } else {
            $nowStr = now()->toDateTimeString();
            $query->orderByRaw(
                "COALESCE((SELECT MAX((hc.priority * 10000) + CASE WHEN sp.discount_value > hc.discount_value THEN 5000 + (sp.discount_value - hc.discount_value) * 10 ELSE 0 END) FROM service_promotions sp INNER JOIN holiday_campaigns hc ON hc.id = sp.holiday_campaign_id WHERE sp.service_id = services.id AND sp.is_active = true AND hc.status = 'active' AND hc.starts_at <= ? AND hc.ends_at >= ?), -1) DESC",
                [$nowStr, $nowStr]
            )->latest('created_at');
        }

        $paginated = $query->paginate($perPage);

        $items = collect($paginated->items())->map(function (Service $service) {
            $cover = $service->media->firstWhere('is_cover', true) ?? $service->media->first();
            $activePromotion = $this->resolveActivePromotion($service);
            $allAmenities = is_array($service->amenities) ? $service->amenities : [];

            return [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'type' => $service->type,
                'base_price' => (float) $service->base_price,
                'price_unit' => $service->price_unit,
                'address' => $service->address,
                'description' => $service->description,
                'amenities' => array_slice($allAmenities, 0, 3),
                'amenities_count' => count($allAmenities),
                'includes' => is_array($service->includes) ? array_slice($service->includes, 0, 3) : [],
                'policies' => $service->policies->take(2)->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'category' => $p->category,
                    'icon' => $p->icon,
                ])->values(),
                'policies_count' => $service->policies->count(),
                'rating_avg' => (float) ($service->rating_avg ?? 0),
                'reviews_count' => (int) ($service->reviews_count ?? 0),
                'total_bookings' => (int) ($service->total_bookings ?? 0),
                'cover_image' => $cover?->url,
                'active_promotion' => $activePromotion,
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
                'policies:id,name,category,icon,description',
                'promotions.holidayCampaign',
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
        $activePromotion = $this->resolveActivePromotion($service);

        return response()->json([
            'success' => true,
            'data' => array_merge($service->toArray(), [
                'base_price' => (float) $service->base_price,
                'rating_avg' => (float) ($service->rating_avg ?? 0),
                'reviews_count' => (int) ($service->reviews_count ?? 0),
                'total_bookings' => (int) ($service->total_bookings ?? 0),
                'cover_image' => $cover?->url,
                'active_promotion' => $activePromotion,
            ]),
        ]);
    }
}
