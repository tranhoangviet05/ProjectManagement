<?php

namespace App\Http\Controllers\Api\V1\Tourist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tourist\UpdateTouristProfileRequest;
use App\Models\TouristProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TouristProfileController extends Controller
{
    /**
     * GET /api/v1/tourist/profile
     * Lấy thông tin hồ sơ cá nhân của Tourist hiện tại.
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

        $user->loadMissing(['touristProfile', 'socialProfile']);

        $profile = $user->touristProfile ?? TouristProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['name' => $user->display_name]
        );

        return response()->json([
            'success' => true,
            'data' => $this->formatProfile($user, $profile),
        ]);
    }

    /**
     * PUT /api/v1/tourist/profile
     * Cập nhật thông tin hồ sơ cá nhân của Tourist.
     */
    public function update(UpdateTouristProfileRequest $request): JsonResponse
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

            $validated = $request->validated();

            $profile = TouristProfile::updateOrCreate(
                ['user_id' => $user->id],
                $validated
            );

            $user->load(['touristProfile', 'socialProfile']);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật hồ sơ cá nhân thành công.',
                'data' => $this->formatProfile($user, $profile),
            ]);
        } catch (\Throwable $e) {
            Log::error('Tourist Profile Update Error: '.$e->getMessage(), [
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
     * Định dạng dữ liệu hồ sơ Tourist trả về API (tuyệt đối không lộ nationality hay id_card_number).
     */
    private function formatProfile(User $user, TouristProfile $profile): array
    {
        return [
            'id' => $profile->id,
            'user_id' => $user->id,
            'email' => $user->email,
            'name' => $profile->name,
            'phone_number' => $profile->phone_number,
            'gender' => $profile->gender,
            'date_of_birth' => $profile->date_of_birth?->format('Y-m-d'),
            'avatar_url' => $user->avatar_url ?? $user->socialProfile?->avatar_url,
            'role' => $user->role,
            'created_at' => $profile->created_at?->toIso8601String(),
            'updated_at' => $profile->updated_at?->toIso8601String(),
        ];
    }
}
