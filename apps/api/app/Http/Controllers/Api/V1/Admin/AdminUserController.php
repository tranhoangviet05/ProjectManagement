<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * Các vai trò Admin được phép quản lý trên /admin/users.
     *
     * @var array<int, string>
     */
    private const MANAGED_ROLES = [
        UserRole::Provider->value,
        UserRole::Tourist->value,
    ];

    /**
     * GET /api/v1/admin/users
     * Danh sách tài khoản Provider & Tourist có lọc theo vai trò, trạng thái, tìm kiếm.
     */
    public function index(Request $request): JsonResponse
    {
        $role = (string) $request->query('role', 'all');
        $status = (string) $request->query('status', 'all');
        $search = trim((string) $request->query('q', ''));
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $query = User::query()
            ->whereIn('role', self::MANAGED_ROLES)
            ->with([
                'touristProfile:id,user_id,name,phone_number,gender,date_of_birth',
                'providerProfile:id,user_id,business_name,representative_name,phone,address,status,business_type_id',
                'providerProfile.businessType:id,name,type',
                'socialProfile:id,user_id,display_name,avatar_url',
                'wallet:id,user_id,balance,locked_balance,currency',
            ])
            ->latest('created_at');

        if (in_array($role, self::MANAGED_ROLES, true)) {
            $query->where('role', $role);
        }

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($sub) use ($like) {
                $sub->where('email', 'ilike', $like)
                    ->orWhereHas('touristProfile', function ($tp) use ($like) {
                        $tp->where('name', 'ilike', $like)
                            ->orWhere('phone_number', 'ilike', $like);
                    })
                    ->orWhereHas('providerProfile', function ($pp) use ($like) {
                        $pp->where('business_name', 'ilike', $like)
                            ->orWhere('representative_name', 'ilike', $like)
                            ->orWhere('phone', 'ilike', $like);
                    })
                    ->orWhereHas('socialProfile', function ($sp) use ($like) {
                        $sp->where('display_name', 'ilike', $like);
                    });
            });
        }

        $paginated = $query->paginate($perPage);

        $items = collect($paginated->items())->map(fn (User $u) => $this->transformUser($u))->values();

        return response()->json([
            'success' => true,
            'counts' => [
                'all' => User::whereIn('role', self::MANAGED_ROLES)->count(),
                'provider' => User::where('role', UserRole::Provider->value)->count(),
                'tourist' => User::where('role', UserRole::Tourist->value)->count(),
                'active' => User::whereIn('role', self::MANAGED_ROLES)->where('status', UserStatus::Active->value)->count(),
                'banned' => User::whereIn('role', self::MANAGED_ROLES)->where('status', UserStatus::Banned->value)->count(),
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
     * GET /api/v1/admin/users/{id}
     * Chi tiết tài khoản Provider hoặc Tourist.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::query()
            ->whereIn('role', self::MANAGED_ROLES)
            ->with([
                'touristProfile',
                'providerProfile.businessType',
                'socialProfile',
                'wallet',
            ])
            ->withCount(['bookings'])
            ->find($id);

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản người dùng phù hợp.',
            ], 404);
        }

        $servicesCount = $user->providerProfile
            ? $user->providerProfile->services()->count()
            : 0;

        return response()->json([
            'success' => true,
            'data' => array_merge($this->transformUser($user, true), [
                'bookings_count' => $user->bookings_count ?? 0,
                'services_count' => $servicesCount,
            ]),
        ]);
    }

    /**
     * PATCH /api/v1/admin/users/{id}/status
     * Khóa (banned) hoặc mở khóa (active) tài khoản Provider / Tourist.
     */
    public function updateStatus(UpdateUserStatusRequest $request, int $id): JsonResponse
    {
        if ($id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tự thay đổi trạng thái chính tài khoản Admin đang đăng nhập.',
            ], 422);
        }

        $user = User::query()
            ->whereIn('role', self::MANAGED_ROLES)
            ->with(['touristProfile', 'providerProfile.businessType', 'socialProfile', 'wallet'])
            ->find($id);

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản Provider hoặc Tourist yêu cầu.',
            ], 404);
        }

        $newStatus = $request->validated('status');
        $user->update(['status' => $newStatus]);

        if ($newStatus === UserStatus::Banned->value) {
            $user->tokens()->delete();
        }

        $message = $newStatus === UserStatus::Banned->value
            ? 'Đã khóa tài khoản người dùng thành công.'
            : 'Đã mở khóa tài khoản người dùng thành công.';

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $this->transformUser($user->fresh([
                'touristProfile',
                'providerProfile.businessType',
                'socialProfile',
                'wallet',
            ])),
        ]);
    }

    /**
     * Chuẩn hóa dữ liệu tài khoản và trạng thái kích hoạt Ví cho Admin UI.
     *
     * @return array<string, mixed>
     */
    private function transformUser(User $user, bool $detailed = false): array
    {
        $phone = $user->role === UserRole::Provider->value
            ? $user->providerProfile?->phone
            : $user->touristProfile?->phone_number;

        $walletActivated = $user->wallet !== null;

        $payload = [
            'id' => $user->id,
            'name' => $user->display_name,
            'email' => $user->email,
            'phone' => $phone,
            'role' => $user->role,
            'status' => $user->status,
            'avatar_url' => $user->avatar_url,
            'social_active' => (bool) $user->social_active,
            'firebase_linked' => ! empty($user->firebase_uid),
            'wallet_activated' => $walletActivated,
            'wallet_status_label' => $walletActivated ? 'Đã kích hoạt' : 'Chưa kích hoạt',
            'wallet' => $walletActivated ? [
                'id' => $user->wallet->id,
                'balance' => (float) $user->wallet->balance,
                'locked_balance' => (float) $user->wallet->locked_balance,
                'currency' => $user->wallet->currency ?? 'VND',
            ] : null,
            'created_at' => $user->created_at,
        ];

        if ($user->role === UserRole::Provider->value && $user->providerProfile) {
            $payload['provider_profile'] = [
                'id' => $user->providerProfile->id,
                'business_name' => $user->providerProfile->business_name,
                'representative_name' => $user->providerProfile->representative_name,
                'status' => $user->providerProfile->status,
                'business_type' => $user->providerProfile->businessType?->name,
                'address' => $detailed ? $user->providerProfile->address : null,
            ];
        }

        if ($user->role === UserRole::Tourist->value && $user->touristProfile) {
            $payload['tourist_profile'] = [
                'id' => $user->touristProfile->id,
                'name' => $user->touristProfile->name,
                'phone' => $user->touristProfile->phone_number,
                'gender' => $detailed ? $user->touristProfile->gender : null,
                'date_of_birth' => $detailed ? $user->touristProfile->date_of_birth : null,
            ];
        }

        return $payload;
    }
}
