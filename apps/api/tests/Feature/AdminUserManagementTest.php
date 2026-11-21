<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use App\Models\Wallet;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    protected User $adminUser;

    protected string $adminToken;

    protected User $providerUser;

    protected User $touristUser;

    protected string $touristToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->adminUser = User::where('email', 'admin@gmail.com')->firstOrFail();
        $this->adminToken = $this->adminUser->createToken('test-admin-users')->plainTextToken;

        $this->providerUser = User::where('email', 'tranhoangviet.provider@gmail.com')->firstOrFail();
        $this->touristUser = User::where('email', 'tranhoangviet@gmail.com')->firstOrFail();
        $this->touristToken = $this->touristUser->createToken('test-tourist-users')->plainTextToken;
    }

    public function test_admin_lists_only_provider_and_tourist_with_wallet_activation_status(): void
    {
        $unactivatedTourist = User::create([
            'email' => 'no.wallet.tourist.'.uniqid().'@gmail.com',
            'password' => Hash::make('Password@123'),
            'role' => UserRole::Tourist->value,
            'status' => UserStatus::Active->value,
            'social_active' => true,
        ]);

        // Đảm bảo touristUser có ví
        Wallet::firstOrCreate(
            ['user_id' => $this->touristUser->id],
            ['balance' => 150000, 'locked_balance' => 0, 'currency' => 'VND']
        );

        $response = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/users?per_page=100');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'counts' => ['all', 'provider', 'tourist', 'active', 'banned'],
                'data',
                'meta',
            ]);

        $items = collect($response->json('data'));

        // Không được bao gồm tài khoản Admin
        $this->assertFalse($items->contains(fn ($item) => $item['role'] === UserRole::Admin->value));
        $this->assertTrue($items->contains(fn ($item) => $item['role'] === UserRole::Provider->value));
        $this->assertTrue($items->contains(fn ($item) => $item['role'] === UserRole::Tourist->value));

        // Kiểm tra trạng thái ví Chưa kích hoạt vs Đã kích hoạt
        $noWalletItem = $items->firstWhere('id', $unactivatedTourist->id);
        $this->assertNotNull($noWalletItem);
        $this->assertFalse($noWalletItem['wallet_activated']);
        $this->assertSame('Chưa kích hoạt', $noWalletItem['wallet_status_label']);
        $this->assertNull($noWalletItem['wallet']);

        $activeWalletItem = $items->firstWhere('id', $this->touristUser->id);
        $this->assertNotNull($activeWalletItem);
        $this->assertTrue($activeWalletItem['wallet_activated']);
        $this->assertSame('Đã kích hoạt', $activeWalletItem['wallet_status_label']);
    }

    public function test_admin_can_ban_and_unban_user_and_revokes_tokens_on_ban(): void
    {
        $targetUser = User::create([
            'email' => 'ban.target.'.uniqid().'@gmail.com',
            'password' => Hash::make('Password@123'),
            'role' => UserRole::Tourist->value,
            'status' => UserStatus::Active->value,
        ]);
        $targetUser->createToken('target-session');
        $this->assertSame(1, $targetUser->tokens()->count());

        $banRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->patchJson('/api/v1/admin/users/'.$targetUser->id.'/status', [
                'status' => 'banned',
                'reason' => 'Tài khoản có hành vi spam đặt chỗ ảo liên tục.',
            ]);

        $banRes->assertStatus(200)
            ->assertJsonPath('data.status', 'banned');

        $this->assertSame(0, $targetUser->fresh()->tokens()->count());

        $unbanRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->patchJson('/api/v1/admin/users/'.$targetUser->id.'/status', [
                'status' => 'active',
            ]);

        $unbanRes->assertStatus(200)
            ->assertJsonPath('data.status', 'active');
    }

    public function test_admin_cannot_view_or_ban_admin_accounts_and_non_admin_is_forbidden(): void
    {
        $selfBan = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->patchJson('/api/v1/admin/users/'.$this->adminUser->id.'/status', [
                'status' => 'banned',
                'reason' => 'Thử tự khóa chính tài khoản admin đang dùng.',
            ]);

        $selfBan->assertStatus(422);

        $showAdmin = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/users/'.$this->adminUser->id);

        $showAdmin->assertStatus(404);

        $forbidden = $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->getJson('/api/v1/admin/users');

        $forbidden->assertStatus(403);
    }
}
