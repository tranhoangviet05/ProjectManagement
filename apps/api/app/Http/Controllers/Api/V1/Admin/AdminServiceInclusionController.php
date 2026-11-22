<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertServiceInclusionRequest;
use App\Models\ServiceInclusion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminServiceInclusionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $kind = trim((string) $request->query('kind', ''));
        $type = trim((string) $request->query('type', ''));

        $query = ServiceInclusion::query()->orderBy('sort_order')->orderBy('name');

        if ($kind !== '' && in_array($kind, ['include', 'exclude'], true)) {
            $query->where('kind', $kind);
        }

        if ($type !== '') {
            $query->whereJsonContains('applicable_types', $type);
        }

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

    public function store(UpsertServiceInclusionRequest $request): JsonResponse
    {
        $inclusion = ServiceInclusion::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm mục mới thành công.',
            'data' => $inclusion,
        ], 201);
    }

    public function update(UpsertServiceInclusionRequest $request, int $id): JsonResponse
    {
        $inclusion = ServiceInclusion::find($id);
        if (! $inclusion) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy mục dữ liệu.'], 404);
        }

        $inclusion->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật mục thành công.',
            'data' => $inclusion->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $inclusion = ServiceInclusion::find($id);
        if (! $inclusion) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy mục dữ liệu.'], 404);
        }

        $inclusion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa mục thành công.',
        ]);
    }
}
