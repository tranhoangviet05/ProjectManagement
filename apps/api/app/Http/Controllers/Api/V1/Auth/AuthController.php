<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\SyncAuthRequest;
use App\Http\Requests\Auth\UploadAvatarRequest;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Kreait\Laravel\Firebase\Facades\Firebase;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * POST /api/v1/auth/register
     * Đăng ký tài khoản mới trực tiếp qua Backend API.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            // Nếu client không truyền role rõ ràng, tự động suy luận theo nền tảng (X-Platform)
            if (empty($data['role'])) {
                $platform = strtolower($request->header('X-Platform', ''));
                $data['role'] = ($platform === 'web') ? 'provider' : 'tourist';
            }

            $result = $this->authService->registerWithCredentials($data);

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký tài khoản thành công.',
                'data' => $result['user'],
                'token' => $result['token'],
                'is_new_user' => true,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Auth Register Error: '.$e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Không thể hoàn tất đăng ký tài khoản. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    /**
     * POST /api/v1/auth/login
     * Đăng nhập bằng Email và Mật khẩu.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->authService->loginWithCredentials(
                $validated['email'],
                $validated['password']
            );

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập thành công.',
                'data' => $result['user'],
                'token' => $result['token'],
                'is_new_user' => false,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first() ?? 'Thông tin đăng nhập không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Auth Login Error: '.$e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Đã có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    /**
     * POST /api/v1/auth/sync
     * Đồng bộ người dùng từ Firebase Auth / Google Sign-In.
     */
    public function sync(SyncAuthRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $firebaseUserClaims = $request->attributes->get('firebaseUser', []);

            $firebaseUid = $request->attributes->get('firebaseUid')
                ?? $validated['firebase_uid']
                ?? null;

            $firebaseEmail = $request->attributes->get('firebaseEmail')
                ?? $validated['email']
                ?? null;

            $platform = strtolower($request->header('X-Platform', ''));
            $defaultRole = ($platform === 'web') ? 'provider' : 'tourist';

            $firebaseData = [
                'uid' => $firebaseUid,
                'firebase_uid' => $firebaseUid,
                'email' => $firebaseEmail,
                'password' => $validated['password'] ?? null,
                'name' => $validated['displayName']
                    ?? $validated['display_name']
                    ?? ($firebaseUserClaims['name'] ?? null),
                'picture' => $validated['avatarUrl']
                    ?? $validated['avatar_url']
                    ?? ($firebaseUserClaims['picture'] ?? null),
                'role' => $validated['role'] ?? $defaultRole,
                'phone' => $validated['phone'] ?? null,
                'business_name' => $validated['business_name'] ?? null,
                'business_type' => $validated['business_type'] ?? null,
            ];

            if (! $firebaseData['uid']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy định danh xác thực trong yêu cầu.',
                ], 400);
            }

            $result = $this->authService->syncFirebaseUser($firebaseData);

            return response()->json([
                'success' => true,
                'message' => $result['is_new_user']
                    ? 'Khởi tạo và đồng bộ tài khoản thành công.'
                    : 'Đồng bộ phiên đăng nhập thành công.',
                'data' => $result['user'],
                'token' => $result['token'],
                'is_new_user' => $result['is_new_user'],
            ]);
        } catch (\Throwable $e) {
            Log::error('Auth Sync Error: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Không thể đồng bộ tài khoản. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    /**
     * GET /api/v1/auth/me
     * Lấy thông tin người dùng hiện tại kèm hồ sơ vai trò & ví.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user() ?? $request->attributes->get('userModel');

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin người dùng.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->authService->formatUserPayload($user),
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     * Đăng xuất và thu hồi Sanctum token hiện tại.
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user() ?? $request->attributes->get('userModel');

        if ($user && method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã đăng xuất khỏi thiết bị.',
        ]);
    }

    /**
     * POST /api/v1/auth/change-password
     * Đổi mật khẩu tài khoản người dùng hiện tại.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user() ?? $request->attributes->get('userModel');

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập để thực hiện đổi mật khẩu.',
            ], 401);
        }

        // Kiểm tra tính chính xác của mật khẩu cũ
        if (! empty($user->password) && ! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không chính xác.'],
            ]);
        }

        // Cập nhật mật khẩu mới trong DB
        $user->password = Hash::make($request->new_password);
        $user->save();

        // Đồng bộ đổi mật khẩu trên Firebase nếu tài khoản có liên kết Firebase
        if (! empty($user->firebase_uid)) {
            try {
                Firebase::auth()->changeUserPassword($user->firebase_uid, $request->new_password);
            } catch (\Throwable $e) {
                Log::warning('Firebase password update warning: '.$e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Đổi mật khẩu thành công. Vui lòng ghi nhớ mật khẩu mới của bạn.',
        ]);
    }

    /**
     * POST /api/v1/auth/avatar
     * Tải lên và cập nhật ảnh đại diện của người dùng.
     */
    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user() ?? $request->attributes->get('userModel');

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập để thực hiện tải ảnh đại diện.',
            ], 401);
        }

        $file = $request->file('avatar');
        $ext = $file->getClientOriginalExtension() ?: 'png';
        $filename = (string) Str::uuid().'.'.$ext;

        // Xóa ảnh đại diện cũ trên disk nếu có
        $oldAvatarUrl = $user->avatar_url ?? $user->providerProfile?->avatar_url;
        if ($oldAvatarUrl && Str::contains($oldAvatarUrl, '/storage/avatars/')) {
            $oldPath = 'avatars/'.basename($oldAvatarUrl);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        // Lưu ảnh mới vào storage/app/public/avatars/
        $path = $file->storeAs('avatars', $filename, 'public');
        $url = Storage::disk('public')->url($path);

        // Cập nhật vào ProviderProfile nếu là provider
        if ($user->providerProfile) {
            $user->providerProfile->update(['avatar_url' => $url]);
        }

        // Cập nhật vào SocialProfile nếu có
        if ($user->socialProfile) {
            $user->socialProfile->update(['avatar_url' => $url]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tải lên ảnh đại diện thành công.',
            'data' => [
                'avatar_url' => $url,
            ],
        ], 200);
    }
}
