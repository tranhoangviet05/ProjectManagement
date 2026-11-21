<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ServiceStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectServiceRequest;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminServiceController extends Controller
{
    /**
     * GET /api/v1/admin/services
     * Danh sách dịch vụ kiểm duyệt kèm thống kê số lượng theo trạng thái.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Service::query()
            ->with(['provider.businessType', 'category', 'location', 'media'])
            ->latest();

        $status = $request->string('status')->toString();
        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        $type = $request->string('type')->toString();
        if ($type !== '' && $type !== 'all') {
            $query->where('type', $type);
        }

        if ($request->filled('q')) {
            $keyword = trim($request->string('q')->toString());
            $query->where(function ($subQuery) use ($keyword) {
                $subQuery->where('name', 'like', '%'.$keyword.'%')
                    ->orWhereHas('provider', function ($providerQuery) use ($keyword) {
                        $providerQuery->where('business_name', 'like', '%'.$keyword.'%');
                    });
            });
        }

        $perPage = min(max((int) $request->integer('per_page', 15), 1), 50);
        $paginated = $query->paginate($perPage);

        $items = collect($paginated->items())->map(function (Service $service) {
            $coverMedia = $service->media->firstWhere('is_cover', true) ?? $service->media->first();

            return [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'type' => $service->type,
                'status' => $service->status,
                'base_price' => $service->base_price,
                'price_unit' => $service->price_unit,
                'address' => $service->address,
                'rejection_reason' => $service->rejection_reason,
                'provider' => $service->provider ? [
                    'id' => $service->provider->id,
                    'business_name' => $service->provider->business_name,
                    'business_type' => $service->provider->businessType,
                ] : null,
                'category' => $service->category,
                'location' => $service->location,
                'cover_image' => $coverMedia?->url,
                'media_count' => $service->media->count(),
                'created_at' => $service->created_at?->toISOString(),
                'updated_at' => $service->updated_at?->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'counts' => [
                'pending_review' => Service::where('status', ServiceStatus::PendingReview->value)->count(),
                'active' => Service::where('status', ServiceStatus::Active->value)->count(),
                'rejected' => Service::where('status', ServiceStatus::Rejected->value)->count(),
            ],
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * GET /api/v1/admin/services/{id}
     * Xem chi tiết đầy đủ dịch vụ để Admin kiểm duyệt.
     */
    public function show(int $id): JsonResponse
    {
        $service = Service::query()
            ->with([
                'provider.businessType',
                'category',
                'location',
                'media',
                'schedules',
                'roomTypes',
                'availability',
            ])
            ->find($id);

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ yêu cầu.',
            ], 404);
        }

        $coverMedia = $service->media->firstWhere('is_cover', true) ?? $service->media->first();

        return response()->json([
            'success' => true,
            'data' => array_merge($service->toArray(), [
                'cover_image' => $coverMedia?->url,
            ]),
        ]);
    }

    /**
     * POST /api/v1/admin/services/{id}/approve
     * Phê duyệt dịch vụ pending_review -> active.
     */
    public function approve(int $id): JsonResponse
    {
        $service = Service::find($id);
        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ yêu cầu.',
            ], 404);
        }

        if ($service->status !== ServiceStatus::PendingReview->value) {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ có thể phê duyệt các dịch vụ đang ở trạng thái chờ duyệt (pending_review).',
            ], 422);
        }

        $service->update([
            'status' => ServiceStatus::Active->value,
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã phê duyệt dịch vụ hiển thị công khai.',
            'data' => [
                'id' => $service->id,
                'status' => $service->status,
                'rejection_reason' => $service->rejection_reason,
            ],
        ]);
    }

    /**
     * POST /api/v1/admin/services/{id}/reject
     * Từ chối dịch vụ kèm lý do bắt buộc.
     */
    public function reject(RejectServiceRequest $request, int $id): JsonResponse
    {
        $service = Service::find($id);
        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ yêu cầu.',
            ], 404);
        }

        if (! in_array($service->status, [ServiceStatus::PendingReview->value, ServiceStatus::Active->value], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể từ chối dịch vụ ở trạng thái hiện tại.',
            ], 422);
        }

        $service->update([
            'status' => ServiceStatus::Rejected->value,
            'rejection_reason' => $request->validated('rejection_reason'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã từ chối dịch vụ và gửi phản hồi cho đối tác.',
            'data' => [
                'id' => $service->id,
                'status' => $service->status,
                'rejection_reason' => $service->rejection_reason,
            ],
        ]);
    }
}
