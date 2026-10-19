<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Khởi tạo tài khoản mẫu cho 3 vai trò: Admin, Provider, Tourist.
     */
    public function run(): void
    {
        $authService = app(AuthService::class);

        // 1. Tài khoản Quản trị viên (Admin)
        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Ban Quản Trị Hệ Thống',
                'password' => 'Admin@123',
                'role' => UserRole::Admin->value,
                'status' => UserStatus::Active->value,
                'social_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $authService->ensureUserEcosystem($admin);

        // 2. Tài khoản Nhà cung cấp dịch vụ (Provider)
        $provider = User::updateOrCreate(
            ['email' => 'tranhoangviet.provider@gmail.com'],
            [
                'name' => 'Trần Hoàng Việt (Đối tác)',
                'password' => 'Tranhoangviet@2005',
                'role' => UserRole::Provider->value,
                'status' => UserStatus::Active->value,
                'social_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $authService->ensureUserEcosystem($provider, [
            'business_name' => 'Đà Nẵng Ocean Travel & Retreat',
            'business_type' => 'Tour biển đảo & Nghỉ dưỡng',
            'phone' => '0905123456',
            'address' => '218 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
        ]);

        // 3. Tài khoản Khách du lịch (Tourist)
        $tourist = User::updateOrCreate(
            ['email' => 'tranhoangviet@gmail.com'],
            [
                'name' => 'Trần Hoàng Việt',
                'password' => 'Tranhoangviet@2005',
                'role' => UserRole::Tourist->value,
                'status' => UserStatus::Active->value,
                'social_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $authService->ensureUserEcosystem($tourist, [
            'phone' => '0905888999',
        ]);
    }
}
