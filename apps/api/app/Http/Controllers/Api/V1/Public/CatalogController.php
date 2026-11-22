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
     * Lấy danh sách chính sách dịch vụ hệ thống (lọc theo type/service_type).
     */
    public function policies(Request $request): JsonResponse
    {
        $type = trim((string) ($request->query('type') ?? $request->query('service_type') ?? ''));

        $query = ServicePolicy::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($type !== '') {
            $query->whereJsonContains('applicable_types', $type);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Lấy danh sách chương trình khuyến mãi ngày lễ đang áp dụng.
     */
    public function campaigns(): JsonResponse
    {
        $campaigns = HolidayCampaign::query()
            ->currentlyActive()
            ->orderByDesc('priority')
            ->orderByDesc('starts_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $campaigns,
        ]);
    }
}
