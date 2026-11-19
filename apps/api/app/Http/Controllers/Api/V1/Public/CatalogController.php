<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\BusinessType;
use App\Models\Category;
use App\Models\Location;
use Illuminate\Http\JsonResponse;

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
}
