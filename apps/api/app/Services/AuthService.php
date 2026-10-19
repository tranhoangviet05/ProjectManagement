<?php

namespace App\Services;

use App\Enums\ProviderStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\ProviderProfile;
use App\Models\SocialProfile;
use App\Models\TouristProfile;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Đồng bộ tài khoản từ Firebase (Đăng nhập / Đăng ký qua Firebase hoặc Google OAuth).
     */
    public function syncFirebaseUser(array $firebaseData): array
    {
        return DB::transaction(function () use ($firebaseData) {
            $firebaseUid = $firebaseData['uid'];
            $firebaseEmail = isset($firebaseData['email']) ? strtolower(trim($firebaseData['email'])) : null;
            $requestedRole = in_array($firebaseData['role'] ?? '', [UserRole::Tourist->value, UserRole::Provider->value], true)
                ? $firebaseData['role']
                : UserRole::Tourist->value;

            $isNewUser = false;

            $user = User::where('firebase_uid', $firebaseUid)->first();

            if (!$user && $firebaseEmail) {
                $user = User::where('email', $firebaseEmail)->first();
                if ($user) {
                    $user->update(['firebase_uid' => $firebaseUid]);
                }
            }

            $displayName = $firebaseData['name']
                ?? ($firebaseEmail ? explode('@', $firebaseEmail)[0] : 'Thành viên mới');

            if (!$user) {
                $isNewUser = true;

                $user = User::create([
                    'firebase_uid' => $firebaseUid,
                    'name' => $displayName,
                    'email' => $firebaseEmail ?? ($firebaseUid . '@firebase.local'),
                    'password' => Hash::make(Str::random(24)),
                    'avatar_url' => $firebaseData['picture'] ?? null,
                    'role' => $requestedRole,
                    'status' => UserStatus::Active->value,
                    'social_active' => true,
                    'email_verified_at' => now(),
                ]);
            } else {
                $updates = [];
                if (!empty($firebaseData['name']) && $user->name !== $firebaseData['name']) {
                    $updates['name'] = $firebaseData['name'];
                }
                if (!empty($firebaseData['picture']) && !$user->avatar_url) {
                    $updates['avatar_url'] = $firebaseData['picture'];
                }
                if (!empty($updates)) {
                    $user->update($updates);
                }
            }

            $this->ensureUserEcosystem($user, $firebaseData);

            $sanctumToken = $user->createToken('stb_client_token')->plainTextToken;

            return [
                'user' => $this->formatUserPayload($user),
                'token' => $sanctumToken,
                'is_new_user' => $isNewUser,
            ];
        });
    }

    /**
     * Đăng ký tài khoản mới trực tiếp qua Backend API.
     */
    public function registerWithCredentials(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $role = in_array($data['role'] ?? '', [UserRole::Tourist->value, UserRole::Provider->value], true)
                ? $data['role']
                : UserRole::Tourist->value;

            $user = User::create([
                'name' => $data['name'],
                'email' => strtolower(trim($data['email'])),
                'password' => $data['password'],
                'role' => $role,
                'status' => UserStatus::Active->value,
                'social_active' => true,
                'email_verified_at' => now(),
            ]);

            $this->ensureUserEcosystem($user, $data);

            $token = $user->createToken('stb_client_token')->plainTextToken;

            return [
                'user' => $this->formatUserPayload($user),
                'token' => $token,
                'is_new_user' => true,
            ];
        });
    }

    /**
     * Đăng nhập bằng Email và Mật khẩu trực tiếp qua Backend API.
     */
    public function loginWithCredentials(string $email, string $password): array
    {
        $normalizedEmail = strtolower(trim($email));
        $user = User::where('email', $normalizedEmail)->first();

        if (!$user || !$user->password || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'],
            ]);
        }

        if ($user->status === UserStatus::Banned->value) {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ bộ phận hỗ trợ.'],
            ]);
        }

        $this->ensureUserEcosystem($user);

        $token = $user->createToken('stb_client_token')->plainTextToken;

        return [
            'user' => $this->formatUserPayload($user),
            'token' => $token,
            'is_new_user' => false,
        ];
    }

    /**
     * Khởi tạo đầy đủ hồ sơ (Tourist/Provider), Ví điện tử và Hồ sơ MXH cho người dùng.
     */
    public function ensureUserEcosystem(User $user, array $extra = []): void
    {
        // 1. Khởi tạo Ví điện tử
        Wallet::firstOrCreate(
            ['user_id' => $user->id],
            [
                'balance' => 0.00,
                'locked_balance' => 0.00,
                'currency' => 'VND',
            ]
        );

        // 2. Khởi tạo Hồ sơ theo Vai trò
        if ($user->role === UserRole::Provider->value) {
            ProviderProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'business_name' => $extra['business_name'] ?? ($user->name . ' Travel'),
                    'business_type' => $extra['business_type'] ?? 'Tour & Lưu trú',
                    'phone' => $extra['phone'] ?? null,
                    'address' => $extra['address'] ?? null,
                    'status' => ProviderStatus::Approved->value,
                    'approved_at' => now(),
                ]
            );
        } elseif ($user->role === UserRole::Tourist->value) {
            TouristProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $user->name,
                    'phone_number' => $extra['phone'] ?? null,
                    'nationality' => 'Việt Nam',
                ]
            );
        }

        // 3. Khởi tạo Hồ sơ Mạng xã hội độc lập
        if (!$user->socialProfile()->exists()) {
            $baseUsername = Str::slug($user->name ?: explode('@', $user->email)[0], '');
            if (strlen($baseUsername) < 3) {
                $baseUsername = 'traveler';
            }
            $username = substr($baseUsername, 0, 35) . '_' . $user->id;

            SocialProfile::create([
                'user_id' => $user->id,
                'username' => $username,
                'display_name' => $user->name,
                'avatar_url' => $user->avatar_url,
                'bio' => $user->role === UserRole::Provider->value
                    ? 'Đối tác cung cấp trải nghiệm du lịch chính thức trên Social Travel Booking.'
                    : 'Đam mê xê dịch và khám phá vẻ đẹp Việt Nam.',
                'is_verified' => $user->role === UserRole::Admin->value || $user->role === UserRole::Provider->value,
            ]);
        }
    }

    /**
     * Định dạng chuẩn hóa thông tin người dùng trả về cho Web & Mobile.
     */
    public function formatUserPayload(User $user): array
    {
        $user->loadMissing(['touristProfile', 'providerProfile', 'socialProfile', 'wallet']);

        return [
            'id' => $user->id,
            'firebase_uid' => $user->firebase_uid,
            'name' => $user->name,
            'display_name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url ?? $user->socialProfile?->avatar_url,
            'role' => $user->role,
            'status' => $user->status,
            'social_active' => (bool) $user->social_active,
            'wallet' => $user->wallet ? [
                'balance' => (float) $user->wallet->balance,
                'locked_balance' => (float) $user->wallet->locked_balance,
                'currency' => $user->wallet->currency,
            ] : null,
            'tourist_profile' => $user->touristProfile ? [
                'id' => $user->touristProfile->id,
                'name' => $user->touristProfile->name,
                'phone_number' => $user->touristProfile->phone_number,
                'nationality' => $user->touristProfile->nationality,
            ] : null,
            'provider_profile' => $user->providerProfile ? [
                'id' => $user->providerProfile->id,
                'business_name' => $user->providerProfile->business_name,
                'business_type' => $user->providerProfile->business_type,
                'phone' => $user->providerProfile->phone,
                'address' => $user->providerProfile->address,
                'status' => $user->providerProfile->status,
            ] : null,
            'social_profile' => $user->socialProfile ? [
                'id' => $user->socialProfile->id,
                'username' => $user->socialProfile->username,
                'display_name' => $user->socialProfile->display_name,
                'bio' => $user->socialProfile->bio,
                'is_verified' => (bool) $user->socialProfile->is_verified,
                'followers_count' => (int) $user->socialProfile->followers_count,
                'following_count' => (int) $user->socialProfile->following_count,
                'posts_count' => (int) $user->socialProfile->posts_count,
            ] : null,
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }
}
