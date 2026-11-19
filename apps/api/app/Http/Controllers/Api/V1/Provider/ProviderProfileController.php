<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\UpdateProviderProfileRequest;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProviderProfileController extends Controller
{
    /**
     * GET /api/v1/provider/profile
     * Lấy thông tin hồ sơ doanh nghiệp của Provider hiện tại kèm thông tin ví.
     */
    public function show(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user() ?? $request->attributes->get('userModel');

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập để truy cập thông tin hồ sơ.',
            ], 401);
        }

        $user->loadMissing(['providerProfile.businessType', 'wallet']);
        $profile = $user->providerProfile;

        if (! $profile) {
            return response()->json([
                'success' => false,
                'message' => 'Hồ sơ nhà cung cấp chưa được thiết lập.',
            ], 404);
        }

        $wallet = $user->wallet;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $profile->id,
                'user_id' => $user->id,
                'email' => $user->email,
                'business_name' => $profile->business_name,
                'representative_name' => $profile->representative_name,
                'business_type_id' => $profile->business_type_id,
                'business_type' => $profile->businessType ? [
                    'id' => $profile->businessType->id,
                    'type' => $profile->businessType->type,
                    'name' => $profile->businessType->name,
                    'slug' => $profile->businessType->slug,
                ] : null,
                'avatar_url' => $profile->avatar_url,
                'address' => $profile->address,
                'phone' => $profile->phone,
                'description' => $profile->description,
                'status' => $profile->status,
                'rejection_reason' => $profile->rejection_reason,
                'wallet' => [
                    'is_activated' => ! is_null($wallet),
                    'balance' => $wallet ? (string) number_format((float) $wallet->balance, 2, '.', '') : '0.00',
                    'locked_balance' => $wallet ? (string) number_format((float) $wallet->locked_balance, 2, '.', '') : '0.00',
                    'currency' => $wallet?->currency ?? 'VND',
                ],
            ],
        ]);
    }

    /**
     * PUT /api/v1/provider/profile
     * Cập nhật thông tin hồ sơ doanh nghiệp của Provider.
     */
    public function update(UpdateProviderProfileRequest $request): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = $request->user() ?? $request->attributes->get('userModel');

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vui lòng đăng nhập để thực hiện cập nhật.',
                ], 401);
            }

            $profile = $user->providerProfile;

            if (! $profile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy hồ sơ nhà cung cấp để cập nhật.',
                ], 404);
            }

            $validated = $request->validated();
            $profile->update($validated);

            $user->load(['providerProfile.businessType', 'wallet']);
            $wallet = $user->wallet;

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật hồ sơ nhà cung cấp thành công.',
                'data' => [
                    'id' => $profile->id,
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'business_name' => $profile->business_name,
                    'representative_name' => $profile->representative_name,
                    'business_type_id' => $profile->business_type_id,
                    'business_type' => $profile->businessType ? [
                        'id' => $profile->businessType->id,
                        'type' => $profile->businessType->type,
                        'name' => $profile->businessType->name,
                        'slug' => $profile->businessType->slug,
                    ] : null,
                    'avatar_url' => $profile->avatar_url,
                    'address' => $profile->address,
                    'phone' => $profile->phone,
                    'description' => $profile->description,
                    'status' => $profile->status,
                    'rejection_reason' => $profile->rejection_reason,
                    'wallet' => [
                        'is_activated' => ! is_null($wallet),
                        'balance' => $wallet ? (string) number_format((float) $wallet->balance, 2, '.', '') : '0.00',
                        'locked_balance' => $wallet ? (string) number_format((float) $wallet->locked_balance, 2, '.', '') : '0.00',
                        'currency' => $wallet?->currency ?? 'VND',
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Provider Profile Update Error: '.$e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Đã có lỗi xảy ra trong quá trình cập nhật hồ sơ.',
            ], 500);
        }
    }

    /**
     * POST /api/v1/provider/wallet/activate
     * Kích hoạt hoặc khởi tạo Ví Travel nội bộ cho Provider.
     */
    public function activateWallet(Request $request): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = $request->user() ?? $request->attributes->get('userModel');

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vui lòng đăng nhập để kích hoạt ví.',
                ], 401);
            }

            $isNew = false;
            $wallet = $user->wallet;

            if (! $wallet) {
                $wallet = Wallet::create([
                    'user_id' => $user->id,
                    'balance' => 0.00,
                    'locked_balance' => 0.00,
                    'currency' => 'VND',
                ]);
                $isNew = true;
            }

            return response()->json([
                'success' => true,
                'message' => 'Kích hoạt Ví Travel thành công.',
                'data' => [
                    'wallet_id' => $wallet->id,
                    'balance' => (string) number_format((float) $wallet->balance, 2, '.', ''),
                    'locked_balance' => (string) number_format((float) $wallet->locked_balance, 2, '.', ''),
                    'currency' => $wallet->currency,
                    'activated_at' => $wallet->created_at?->toIso8601String(),
                ],
            ], $isNew ? 201 : 200);
        } catch (\Throwable $e) {
            Log::error('Provider Wallet Activation Error: '.$e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Không thể kích hoạt Ví Travel lúc này. Vui lòng thử lại sau.',
            ], 500);
        }
    }
}
