<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\ServiceStatus;
use App\Http\Controllers\Controller;
use App\Models\Amenity;
use App\Models\Booking;
use App\Models\BusinessType;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\HolidayCampaign;
use App\Models\Location;
use App\Models\ServiceInclusion;
use App\Models\ServicePolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * Lấy danh sách danh mục dịch vụ du lịch (hỗ trợ lọc theo ?type=hotel|homestay|tour|vehicle|train).
     */
    public function categories(Request $request): JsonResponse
    {
        $type = trim((string) $request->query('type', ''));

        $query = Category::query()->orderBy('id');

        if ($type !== '') {
            $query->where(function ($sub) use ($type) {
                $sub->whereJsonContains('applicable_types', $type)
                    ->orWhereJsonLength('applicable_types', 0);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Lấy danh sách địa điểm du lịch (hỗ trợ ?popular=1 và đếm dịch vụ active).
     */
    public function locations(Request $request): JsonResponse
    {
        $query = Location::query()
            ->with('parent:id,name')
            ->withCount([
                'services as active_services_count' => fn ($q) => $q->where('status', ServiceStatus::Active->value),
            ])
            ->orderByDesc('is_popular')
            ->orderByDesc('active_services_count')
            ->orderBy('name');

        if ($request->boolean('popular')) {
            $query->where('is_popular', true);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Lấy danh sách loại hình kinh doanh của Đối tác (Provider).
     */
    public function businessTypes(): JsonResponse
    {
        $businessTypes = BusinessType::query()
            ->orderBy('type')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $businessTypes,
        ]);
    }

    /**
     * Lấy danh sách tiện nghi dịch vụ / tiện nghi phòng đang kích hoạt (lọc theo ?scope=service|room & ?type=).
     */
    public function amenities(Request $request): JsonResponse
    {
        $scope = trim((string) $request->query('scope', ''));
        $type = trim((string) $request->query('type', ''));

        $query = Amenity::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($scope !== '' && in_array($scope, ['service', 'room'], true)) {
            $query->where('scope', $scope);
        }

        if ($type !== '') {
            $query->whereJsonContains('applicable_types', $type);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Lấy danh sách mục Bao gồm / Không bao gồm đang kích hoạt (lọc theo ?kind=include|exclude & ?type=).
     */
    public function inclusions(Request $request): JsonResponse
    {
        $kind = trim((string) $request->query('kind', ''));
        $type = trim((string) $request->query('type', ''));

        $query = ServiceInclusion::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($kind !== '' && in_array($kind, ['include', 'exclude'], true)) {
            $query->where('kind', $kind);
        }

        if ($type !== '') {
            $query->whereJsonContains('applicable_types', $type);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Lấy danh sách chính sách dịch vụ đang kích hoạt (lọc theo ?type=&category=).
     */
    public function policies(Request $request): JsonResponse
    {
        $category = trim((string) $request->query('category', ''));
        $type = trim((string) $request->query('type', ''));

        $query = ServicePolicy::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($category !== '' && in_array($category, ['payment', 'cancellation', 'checkin', 'rules'], true)) {
            $query->where('category', $category);
        }

        if ($type !== '') {
            $query->whereJsonContains('applicable_types', $type);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Lấy danh sách chương trình khuyến mãi ngày lễ đang mở trên sàn.
     */
    public function campaigns(): JsonResponse
    {
        $campaigns = HolidayCampaign::query()
            ->where('status', 'active')
            ->where('ends_at', '>=', now())
            ->orderByDesc('priority')
            ->orderBy('starts_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $campaigns,
        ]);
    }

    /**
     * Lấy danh sách mã giảm giá đang còn hiệu lực để khách chọn áp dụng (mỗi đơn tối đa 1 mã).
     */
    public function coupons(Request $request): JsonResponse
    {
        $now = now();
        $user = $request->user();

        $query = Coupon::query()
            ->where(fn ($q) => $q->whereNull('valid_from')->orWhere('valid_from', '<=', $now))
            ->where(fn ($q) => $q->whereNull('valid_until')->orWhere('valid_until', '>=', $now))
            ->where(fn ($q) => $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit'));

        if ($user) {
            $query->where(function ($q) use ($user) {
                $q->where('visibility', 'public')
                    ->orWhere(function ($sub) use ($user) {
                        $sub->where('visibility', 'private')
                            ->whereHas('grants', fn ($g) => $g->where('user_id', $user->id));
                    });
            });
        } else {
            $query->where('visibility', 'public');
        }

        $coupons = $query->orderByDesc('discount_value')->get();

        $userUsageMap = [];
        if ($user && $coupons->isNotEmpty()) {
            $userUsageMap = Booking::query()
                ->where('user_id', $user->id)
                ->whereIn('coupon_id', $coupons->pluck('id'))
                ->where('status', '!=', 'cancelled')
                ->selectRaw('coupon_id, COUNT(*) as cnt')
                ->groupBy('coupon_id')
                ->pluck('cnt', 'coupon_id')
                ->all();
        }

        $items = $coupons->filter(function (Coupon $coupon) use ($user, $userUsageMap) {
            if (! $user || $coupon->per_user_limit === null) {
                return true;
            }

            return ((int) ($userUsageMap[$coupon->id] ?? 0)) < $coupon->per_user_limit;
        })->map(function (Coupon $coupon) use ($userUsageMap) {
            $remainingTotal = $coupon->usage_limit !== null
                ? max(0, $coupon->usage_limit - $coupon->used_count)
                : null;
            $usedByUser = (int) ($userUsageMap[$coupon->id] ?? 0);
            $remainingUser = $coupon->per_user_limit !== null
                ? max(0, $coupon->per_user_limit - $usedByUser)
                : null;

            return [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'visibility' => $coupon->visibility ?? 'public',
                'type' => $coupon->type,
                'discount_value' => (float) $coupon->discount_value,
                'min_order_amount' => (float) ($coupon->min_order_amount ?? 0),
                'valid_until' => $coupon->valid_until?->toIso8601String(),
                'remaining_uses' => $remainingTotal,
                'user_remaining_uses' => $remainingUser,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }
}
