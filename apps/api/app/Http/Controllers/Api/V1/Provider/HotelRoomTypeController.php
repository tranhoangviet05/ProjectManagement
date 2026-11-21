<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Enums\ServiceType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\StoreHotelRoomTypeRequest;
use App\Http\Requests\Provider\UpdateHotelRoomTypeRequest;
use App\Models\HotelRoomType;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HotelRoomTypeController extends Controller
{
    public function index(Request $request, int $serviceId): JsonResponse
    {
        $service = $this->findOwnedAccommodationService($request, $serviceId);
        if ($service instanceof JsonResponse) {
            return $service;
        }

        return response()->json([
            'success' => true,
            'data' => $service->roomTypes()->orderBy('id')->get(),
        ]);
    }

    public function store(StoreHotelRoomTypeRequest $request, int $serviceId): JsonResponse
    {
        $service = $this->findOwnedAccommodationService($request, $serviceId);
        if ($service instanceof JsonResponse) {
            return $service;
        }

        $validated = $request->validated();
        $totalRooms = (int) $validated['total_rooms'];

        $roomType = $service->roomTypes()->create([
            'name' => $validated['name'],
            'rank' => $validated['rank'] ?? 'standard',
            'description' => $validated['description'] ?? null,
            'base_price' => $validated['base_price'],
            'total_rooms' => $totalRooms,
            'inventory' => isset($validated['inventory']) ? (int) $validated['inventory'] : $totalRooms,
            'capacity_adults' => (int) $validated['capacity_adults'],
            'capacity_children' => (int) ($validated['capacity_children'] ?? 0),
            'amenities' => $validated['amenities'] ?? [],
            'images' => $validated['images'] ?? [],
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm hạng phòng thành công.',
            'data' => $roomType,
        ], 201);
    }

    public function update(UpdateHotelRoomTypeRequest $request, int $serviceId, int $roomTypeId): JsonResponse
    {
        $service = $this->findOwnedAccommodationService($request, $serviceId);
        if ($service instanceof JsonResponse) {
            return $service;
        }

        /** @var HotelRoomType|null $roomType */
        $roomType = $service->roomTypes()->find($roomTypeId);
        if (! $roomType) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hạng phòng yêu cầu.',
            ], 404);
        }

        $validated = $request->validated();
        $effectiveTotalRooms = isset($validated['total_rooms']) ? (int) $validated['total_rooms'] : $roomType->total_rooms;
        if (isset($validated['inventory']) && (int) $validated['inventory'] > $effectiveTotalRooms) {
            return response()->json([
                'success' => false,
                'message' => 'Số phòng còn trống không thể lớn hơn tổng số phòng.',
                'errors' => ['inventory' => ['Số phòng còn trống không thể lớn hơn tổng số phòng.']],
            ], 422);
        }

        $roomType->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật hạng phòng thành công.',
            'data' => $roomType->fresh(),
        ]);
    }

    public function destroy(Request $request, int $serviceId, int $roomTypeId): JsonResponse
    {
        $service = $this->findOwnedAccommodationService($request, $serviceId);
        if ($service instanceof JsonResponse) {
            return $service;
        }

        /** @var HotelRoomType|null $roomType */
        $roomType = $service->roomTypes()->find($roomTypeId);
        if (! $roomType) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hạng phòng yêu cầu.',
            ], 404);
        }

        $roomType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa hạng phòng thành công.',
        ]);
    }

    protected function findOwnedAccommodationService(Request $request, int $serviceId): Service|JsonResponse
    {
        $provider = $request->user()?->providerProfile;
        if (! $provider) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản chưa có hồ sơ Nhà cung cấp hợp lệ.',
            ], 403);
        }

        $service = Service::where('provider_id', $provider->id)->find($serviceId);
        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ thuộc quyền sở hữu của bạn.',
            ], 404);
        }

        if (! in_array($service->type, [ServiceType::Hotel->value, ServiceType::Homestay->value], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ dịch vụ lưu trú (Khách sạn / Homestay / Villa / Resort) mới hỗ trợ cấu hình hạng phòng.',
            ], 422);
        }

        return $service;
    }
}
