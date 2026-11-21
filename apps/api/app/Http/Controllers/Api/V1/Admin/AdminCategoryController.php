<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $query = Category::query()->withCount('services')->orderBy('name');

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($sub) use ($like) {
                $sub->where('name', 'ilike', $like)
                    ->orWhere('slug', 'ilike', $like);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(UpsertCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm danh mục mới thành công.',
            'data' => $category->loadCount('services'),
        ], 201);
    }

    public function update(UpsertCategoryRequest $request, int $id): JsonResponse
    {
        $category = Category::find($id);
        if (! $category) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy danh mục.'], 404);
        }

        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật danh mục thành công.',
            'data' => $category->fresh()->loadCount('services'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::withCount('services')->find($id);
        if (! $category) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy danh mục.'], 404);
        }

        if ($category->services_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục đang được dịch vụ sử dụng.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa danh mục thành công.',
        ]);
    }
}
