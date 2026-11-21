<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertBusinessTypeRequest;
use App\Models\BusinessType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBusinessTypeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $query = BusinessType::query()->withCount('providerProfiles')->orderBy('type')->orderBy('name');

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($sub) use ($like) {
                $sub->where('name', 'ilike', $like)
                    ->orWhere('type', 'ilike', $like)
                    ->orWhere('slug', 'ilike', $like);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(UpsertBusinessTypeRequest $request): JsonResponse
    {
        $businessType = BusinessType::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm loại hình kinh doanh mới thành công.',
            'data' => $businessType->loadCount('providerProfiles'),
        ], 201);
    }

    public function update(UpsertBusinessTypeRequest $request, int $id): JsonResponse
    {
        $businessType = BusinessType::find($id);
        if (! $businessType) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy loại hình kinh doanh.'], 404);
        }

        $businessType->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật loại hình kinh doanh thành công.',
            'data' => $businessType->fresh()->loadCount('providerProfiles'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $businessType = BusinessType::withCount('providerProfiles')->find($id);
        if (! $businessType) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy loại hình kinh doanh.'], 404);
        }

        if ($businessType->provider_profiles_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa loại hình đang được Nhà cung cấp sử dụng.',
            ], 422);
        }

        $businessType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa loại hình kinh doanh thành công.',
        ]);
    }
}
