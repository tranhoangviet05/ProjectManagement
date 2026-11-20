<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Tests\TestCase;

class AdminCouponManagementTest extends TestCase
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
        $this->adminToken = $this->adminUser->createToken('test-admin-coupons')->plainTextToken;

        $this->providerUser = User::where('email', 'tranhoangviet.provider@gmail.com')->firstOrFail();
        $this->touristUser = User::where('email', 'tranhoangviet@gmail.com')->firstOrFail();
        $this->touristToken = $this->touristUser->createToken('test-tourist-coupons')->plainTextToken;
    }

    public function test_admin_can_crud_coupons_and_cannot_delete_used_coupon(): void
    {
        $createRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/coupons', [
                'code' => 'summer2026',
                'type' => 'percent',
                'discount_value' => 15,
                'min_order_amount' => 500000,
                'usage_limit' => 100,
                'per_user_limit' => 1,
                'valid_from' => now()->subDay()->toIso8601String(),
                'valid_until' => now()->addDays(30)->toIso8601String(),
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.code', 'SUMMER2026')
            ->assertJsonPath('data.computed_status', 'active');

        $couponId = $createRes->json('data.id');

        $updateRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->putJson('/api/v1/admin/coupons/'.$couponId, [
                'code' => 'SUMMER2026',
                'type' => 'fixed',
                'discount_value' => 100000,
                'per_user_limit' => 2,
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.type', 'fixed')
            ->assertJsonPath('data.discount_value', 100000);

        // Giả lập mã đã có lượt dùng -> phải chặn xóa
        Coupon::where('id', $couponId)->update(['used_count' => 1]);
        $blockedDelete = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/coupons/'.$couponId);
        $blockedDelete->assertStatus(422);

        // Chưa dùng -> xóa thành công
        Coupon::where('id', $couponId)->update(['used_count' => 0]);
        $deleteRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/coupons/'.$couponId);
        $deleteRes->assertStatus(200);
    }

    public function test_admin_can_grant_coupon_to_tourists_only_and_list_grants(): void
    {
        $coupon = Coupon::create([
            'code' => 'VIPTOURIST'.uniqid(),
            'type' => 'percent',
            'discount_value' => 20,
            'per_user_limit' => 1,
            'valid_from' => now()->subHour(),
            'valid_until' => now()->addDays(10),
            'created_by' => $this->adminUser->id,
        ]);

        // Thử tặng cho Provider -> phải chặn 422
        $invalidGrant = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/coupons/'.$coupon->id.'/grant', [
                'user_ids' => [$this->providerUser->id],
            ]);
        $invalidGrant->assertStatus(422);

        // Tặng cho Tourist -> thành công
        $grantRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/coupons/'.$coupon->id.'/grant', [
                'user_ids' => [$this->touristUser->id],
                'note' => 'Tri ân khách hàng thân thiết tháng 11',
            ]);

        $grantRes->assertStatus(200)
            ->assertJsonPath('granted_count', 1)
            ->assertJsonPath('total_grants', 1);

        $this->assertDatabaseHas('user_coupons', [
            'coupon_id' => $coupon->id,
            'user_id' => $this->touristUser->id,
        ]);

        $grantsRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/coupons/'.$coupon->id.'/grants');

        $grantsRes->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user_id', $this->touristUser->id);

        // Tourist không được gọi API Admin
        $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->getJson('/api/v1/admin/coupons')
            ->assertStatus(403);
    }
}
