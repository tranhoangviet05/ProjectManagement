<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\BusinessType;
use Illuminate\Http\JsonResponse;

class CatalogController extends Controller
{
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
