<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\BusinessType;
use App\Models\Category;
use App\Models\HolidayCampaign;
use App\Models\Location;
use App\Models\ServicePolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * Lấy danh sách danh mục dịch vụ du lịch.
     */
    public function categories(): JsonResponse
    {
        $categories = Category::query()->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Lấy danh sách địa điểm du lịch.
     */
    public function locations(): JsonResponse
    {
        $locations = Location::query()
            ->orderByDesc('is_popular')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $locations,
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
     * Lấy danh sách chính sách dịch vụ hệ thống (lọc theo service_type).
     */
    public function policies(Request $request): JsonResponse
    {
        $query = ServicePolicy::query()->where('is_active', true);

        if ($request->filled('service_type')) {
            $query->where(function ($q) use ($request) {
                $q->whereNull('applicable_service_type')
                    ->orWhere('applicable_service_type', $request->query('service_type'));
            });
        }

        $policies = $query->orderBy('order')->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'data' => $policies,
        ]);
    }

    /**
     * Lấy danh sách chương trình khuyến mãi ngày lễ đang áp dụng.
     */
    public function campaigns(): JsonResponse
    {
        $now = now()->toDateString();

        $campaigns = HolidayCampaign::query()
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $now)
            ->whereDate('end_date', '>=', $now)
            ->orderBy('start_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $campaigns,
        ]);
    }
}
