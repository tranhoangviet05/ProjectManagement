<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertHolidayCampaignRequest;
use App\Models\HolidayCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminHolidayCampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));

        $query = HolidayCampaign::query()
            ->orderByDesc('priority')
            ->orderByDesc('starts_at');

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($sub) use ($like) {
                $sub->where('name', 'ilike', $like)
                    ->orWhere('badge_text', 'ilike', $like)
                    ->orWhere('slug', 'ilike', $like);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(UpsertHolidayCampaignRequest $request): JsonResponse
    {
        $campaign = HolidayCampaign::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo chương trình khuyến mãi mới thành công.',
            'data' => $campaign,
        ], 201);
    }

    public function update(UpsertHolidayCampaignRequest $request, int $id): JsonResponse
    {
        $campaign = HolidayCampaign::find($id);
        if (! $campaign) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy chương trình khuyến mãi.'], 404);
        }

        $campaign->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật chương trình khuyến mãi thành công.',
            'data' => $campaign->fresh(),
        ]);
    }

    public function reopen(Request $request, int $id): JsonResponse
    {
        $campaign = HolidayCampaign::find($id);
        if (! $campaign) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy chương trình khuyến mãi.'], 404);
        }

        $validated = $request->validate([
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
        ], [
            'starts_at.required' => 'Vui lòng chọn thời gian bắt đầu mới.',
            'ends_at.required' => 'Vui lòng chọn thời gian kết thúc mới.',
            'ends_at.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
        ]);

        $campaign->update([
            'starts_at' => $validated['starts_at'],
            'ends_at' => $validated['ends_at'],
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã mở lại chương trình khuyến mãi thành công.',
            'data' => $campaign->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $campaign = HolidayCampaign::find($id);
        if (! $campaign) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy chương trình khuyến mãi.'], 404);
        }

        $campaign->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa chương trình khuyến mãi thành công.',
        ]);
    }
}
