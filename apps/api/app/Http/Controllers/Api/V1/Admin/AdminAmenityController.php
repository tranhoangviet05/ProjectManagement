<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertAmenityRequest;
use App\Models\Amenity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAmenityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $scope = trim((string) $request->query('scope', ''));
        $type = trim((string) $request->query('type', ''));

        $query = Amenity::query()->orderBy('sort_order')->orderBy('name');

        if ($scope !== '' && in_array($scope, ['service', 'room'], true)) {
            $query->where('scope', $scope);
        }

        if ($type !== '') {
            $query->whereJsonContains('applicable_types', $type);
        }

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($sub) use ($like) {
                $sub->where('name', 'ilike', $like)
                    ->orWhere('slug', 'ilike', $like)
                    ->orWhere('icon', 'ilike', $like);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(UpsertAmenityRequest $request): JsonResponse
    {
        $amenity = Amenity::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm tiện nghi mới thành công.',
            'data' => $amenity,
        ], 201);
    }

    public function update(UpsertAmenityRequest $request, int $id): JsonResponse
    {
        $amenity = Amenity::find($id);
        if (! $amenity) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tiện nghi.'], 404);
        }

        $amenity->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật tiện nghi thành công.',
            'data' => $amenity->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $amenity = Amenity::find($id);
        if (! $amenity) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tiện nghi.'], 404);
        }

        $amenity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa tiện nghi thành công.',
        ]);
    }
}
