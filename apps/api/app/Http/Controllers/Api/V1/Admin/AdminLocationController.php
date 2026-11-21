<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertLocationRequest;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $query = Location::query()
            ->with('parent:id,name')
            ->withCount(['services', 'children'])
            ->orderByDesc('is_popular')
            ->orderBy('name');

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($sub) use ($like) {
                $sub->where('name', 'ilike', $like)
                    ->orWhere('slug', 'ilike', $like)
                    ->orWhere('country_code', 'ilike', $like);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(UpsertLocationRequest $request): JsonResponse
    {
        $location = Location::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm điểm đến mới thành công.',
            'data' => $location->load('parent:id,name')->loadCount(['services', 'children']),
        ], 201);
    }

    public function update(UpsertLocationRequest $request, int $id): JsonResponse
    {
        $location = Location::find($id);
        if (! $location) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy điểm đến.'], 404);
        }

        $location->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật điểm đến thành công.',
            'data' => $location->fresh(['parent:id,name'])->loadCount(['services', 'children']),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $location = Location::withCount(['services', 'children'])->find($id);
        if (! $location) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy điểm đến.'], 404);
        }

        if ($location->services_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa điểm đến đang có dịch vụ gắn kết.',
            ], 422);
        }

        if ($location->children_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa điểm đến đang là khu vực cha của điểm đến khác.',
            ], 422);
        }

        $location->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa điểm đến thành công.',
        ]);
    }
}
