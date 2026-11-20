<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GrantCouponRequest;
use App\Http\Requests\Admin\UpsertCouponRequest;
use App\Models\Coupon;
use App\Models\User;
use App\Models\UserCoupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    /**
     * GET /api/v1/admin/coupons
     * Danh sách mã ưu đãi toàn sàn kèm thống kê hiệu lực và số lượt đã tặng.
     */
    public function index(Request $request): JsonResponse
    {
        $status = (string) $request->query('status', 'all');
        $search = trim((string) $request->query('q', ''));
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $now = now();
        $baseQuery = Coupon::query()->withCount('grants')->latest('created_at');

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $baseQuery->where('code', 'ilike', $like);
        }

        if ($status === 'upcoming') {
            $baseQuery->whereNotNull('valid_from')->where('valid_from', '>', $now);
        } elseif ($status === 'expired') {
            $baseQuery->where(function ($q) use ($now) {
                $q->where(function ($sub) use ($now) {
                    $sub->whereNotNull('valid_until')->where('valid_until', '<', $now);
                })->orWhere(function ($sub) {
                    $sub->whereNotNull('usage_limit')->whereColumn('used_count', '>=', 'usage_limit');
                });
            });
        } elseif ($status === 'active') {
            $baseQuery->where(function ($q) use ($now) {
                $q->whereNull('valid_from')->orWhere('valid_from', '<=', $now);
            })->where(function ($q) use ($now) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', $now);
            })->where(function ($q) {
                $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit');
            });
        }

        $paginated = $baseQuery->paginate($perPage);
        $items = collect($paginated->items())->map(fn (Coupon $c) => $this->transformCoupon($c))->values();

        return response()->json([
            'success' => true,
            'counts' => [
                'all' => Coupon::count(),
                'active' => Coupon::query()
                    ->where(fn ($q) => $q->whereNull('valid_from')->orWhere('valid_from', '<=', $now))
                    ->where(fn ($q) => $q->whereNull('valid_until')->orWhere('valid_until', '>=', $now))
                    ->where(fn ($q) => $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit'))
                    ->count(),
                'upcoming' => Coupon::query()->whereNotNull('valid_from')->where('valid_from', '>', $now)->count(),
                'expired' => Coupon::query()
                    ->where(fn ($q) => $q
                        ->where(fn ($sub) => $sub->whereNotNull('valid_until')->where('valid_until', '<', $now))
                        ->orWhere(fn ($sub) => $sub->whereNotNull('usage_limit')->whereColumn('used_count', '>=', 'usage_limit'))
                    )->count(),
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
     * POST /api/v1/admin/coupons
     */
    public function store(UpsertCouponRequest $request): JsonResponse
    {
        $coupon = Coupon::create(array_merge($request->validated(), [
            'used_count' => 0,
            'created_by' => $request->user()->id,
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo mã ưu đãi mới thành công.',
            'data' => $this->transformCoupon($coupon->loadCount('grants')),
        ], 201);
    }

    /**
     * PUT /api/v1/admin/coupons/{id}
     */
    public function update(UpsertCouponRequest $request, int $id): JsonResponse
    {
        $coupon = Coupon::find($id);
        if (! $coupon) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy mã ưu đãi.'], 404);
        }

        $coupon->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật mã ưu đãi thành công.',
            'data' => $this->transformCoupon($coupon->fresh()->loadCount('grants')),
        ]);
    }

    /**
     * DELETE /api/v1/admin/coupons/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $coupon = Coupon::find($id);
        if (! $coupon) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy mã ưu đãi.'], 404);
        }

        if ($coupon->used_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa mã ưu đãi đã có lượt sử dụng.',
            ], 422);
        }

        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa mã ưu đãi thành công.',
        ]);
    }

    /**
     * GET /api/v1/admin/coupons/{id}/grants
     * Xem danh sách Tourist đã được tặng mã ưu đãi này.
     */
    public function grants(int $id): JsonResponse
    {
        $coupon = Coupon::find($id);
        if (! $coupon) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy mã ưu đãi.'], 404);
        }

        $grants = UserCoupon::query()
            ->where('coupon_id', $coupon->id)
            ->with(['user.touristProfile:id,user_id,name,phone_number', 'user.socialProfile:id,user_id,display_name'])
            ->latest('granted_at')
            ->get()
            ->map(fn (UserCoupon $g) => [
                'id' => $g->id,
                'user_id' => $g->user_id,
                'user_name' => $g->user?->display_name ?? 'Khách du lịch',
                'user_email' => $g->user?->email,
                'note' => $g->note,
                'granted_at' => $g->granted_at,
                'used_at' => $g->used_at,
            ]);

        return response()->json([
            'success' => true,
            'data' => $grants,
        ]);
    }

    /**
     * POST /api/v1/admin/coupons/{id}/grant
     * Tặng mã ưu đãi cho danh sách Khách du lịch (Tourist).
     */
    public function grant(GrantCouponRequest $request, int $id): JsonResponse
    {
        $coupon = Coupon::find($id);
        if (! $coupon) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy mã ưu đãi.'], 404);
        }

        if ($this->resolveComputedStatus($coupon) === 'expired') {
            return response()->json([
                'success' => false,
                'message' => 'Mã ưu đãi đã hết hạn hoặc hết lượt sử dụng, không thể tặng thêm.',
            ], 422);
        }

        $userIds = array_values(array_unique($request->validated('user_ids')));
        $tourists = User::query()
            ->whereIn('id', $userIds)
            ->where('role', UserRole::Tourist->value)
            ->get();

        if ($tourists->count() !== count($userIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ được phép tặng mã ưu đãi cho tài khoản Khách du lịch (tourist).',
            ], 422);
        }

        $note = $request->validated('note');
        $grantedBy = $request->user()->id;
        $newlyGranted = 0;

        foreach ($tourists as $tourist) {
            $record = UserCoupon::firstOrCreate(
                ['coupon_id' => $coupon->id, 'user_id' => $tourist->id],
                [
                    'granted_by' => $grantedBy,
                    'note' => $note,
                    'granted_at' => now(),
                ]
            );
            if ($record->wasRecentlyCreated) {
                $newlyGranted++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => $newlyGranted > 0
                ? "Đã tặng mã {$coupon->code} cho {$newlyGranted} khách du lịch."
                : "Các khách du lịch được chọn đều đã sở hữu mã {$coupon->code}.",
            'granted_count' => $newlyGranted,
            'total_grants' => UserCoupon::where('coupon_id', $coupon->id)->count(),
        ]);
    }

    private function resolveComputedStatus(Coupon $coupon): string
    {
        $now = now();
        if ($coupon->valid_until && $coupon->valid_until->lt($now)) {
            return 'expired';
        }
        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return 'expired';
        }
        if ($coupon->valid_from && $coupon->valid_from->gt($now)) {
            return 'upcoming';
        }

        return 'active';
    }

    /**
     * @return array<string, mixed>
     */
    private function transformCoupon(Coupon $coupon): array
    {
        return [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'discount_value' => (float) $coupon->discount_value,
            'min_order_amount' => $coupon->min_order_amount !== null ? (float) $coupon->min_order_amount : null,
            'usage_limit' => $coupon->usage_limit,
            'used_count' => (int) $coupon->used_count,
            'per_user_limit' => (int) $coupon->per_user_limit,
            'valid_from' => $coupon->valid_from,
            'valid_until' => $coupon->valid_until,
            'grants_count' => (int) ($coupon->grants_count ?? 0),
            'computed_status' => $this->resolveComputedStatus($coupon),
            'created_at' => $coupon->created_at,
        ];
    }
}
