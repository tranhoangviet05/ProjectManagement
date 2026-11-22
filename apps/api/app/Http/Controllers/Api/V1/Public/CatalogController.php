<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\ServiceStatus;
use App\Http\Controllers\Controller;
use App\Models\BusinessType;
use App\Models\Category;
use App\Models\Location;
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
}
