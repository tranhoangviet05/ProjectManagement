<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertServicePolicyRequest;
use App\Models\ServicePolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminServicePolicyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $category = trim((string) $request->query('category', ''));
        $type = trim((string) $request->query('type', ''));

        $query = ServicePolicy::query()->orderBy('sort_order')->orderBy('name');

        if ($category !== '' && in_array($category, ['payment', 'cancellation', 'checkin', 'rules'], true)) {
            $query->where('category', $category);
        }

        if ($type !== '') {
            $query->whereJsonContains('applicable_types', $type);
        }

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($sub) use ($like) {
                $sub->where('name', 'ilike', $like)
                    ->orWhere('slug', 'ilike', $like)
                    ->orWhere('description', 'ilike', $like);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(UpsertServicePolicyRequest $request): JsonResponse
    {
        $policy = ServicePolicy::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm chính sách dịch vụ mới thành công.',
            'data' => $policy,
        ], 201);
    }

    public function update(UpsertServicePolicyRequest $request, int $id): JsonResponse
    {
        $policy = ServicePolicy::find($id);
        if (! $policy) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy chính sách dịch vụ.'], 404);
        }

        $policy->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật chính sách dịch vụ thành công.',
            'data' => $policy->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $policy = ServicePolicy::find($id);
        if (! $policy) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy chính sách dịch vụ.'], 404);
        }

        $policy->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa chính sách dịch vụ thành công.',
        ]);
    }
}
