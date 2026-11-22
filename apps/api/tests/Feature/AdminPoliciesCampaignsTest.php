<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\HolidayCampaignSeeder;
use Database\Seeders\ServicePolicySeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminPoliciesCampaignsTest extends TestCase
{
    use DatabaseTransactions;

    private string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->seed(ServicePolicySeeder::class);
        $this->seed(HolidayCampaignSeeder::class);

        $admin = User::where('email', 'admin@gmail.com')->firstOrFail();
        $this->adminToken = $admin->createToken('test-admin')->plainTextToken;
    }

    public function test_admin_can_crud_service_policies_and_public_filters_by_type(): void
    {
        $suffix = substr(uniqid(), -6);

        $createRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/policies', [
                'name' => 'Hủy miễn phí 72 giờ '.$suffix,
                'category' => 'cancellation',
                'applicable_types' => ['hotel', 'homestay'],
                'icon' => 'clock',
                'description' => 'Hoàn tiền 100% trước 72 giờ.',
            ]);

        $createRes->assertStatus(201)->assertJsonPath('data.category', 'cancellation');
        $policyId = $createRes->json('data.id');

        $hotelPolicies = $this->getJson('/api/v1/public/policies?type=hotel');
        $hotelPolicies->assertStatus(200);
        $this->assertTrue(collect($hotelPolicies->json('data'))->pluck('id')->contains($policyId));

        $tourPolicies = $this->getJson('/api/v1/public/policies?type=tour');
        $tourPolicies->assertStatus(200);
        $this->assertFalse(collect($tourPolicies->json('data'))->pluck('id')->contains($policyId));

        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/policies/'.$policyId)
            ->assertStatus(200);
    }

    public function test_admin_can_crud_and_reopen_holiday_campaigns(): void
    {
        $suffix = substr(uniqid(), -6);

        $createRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/campaigns', [
                'name' => 'Lễ Quốc Khánh '.$suffix,
                'badge_text' => '2/9 -20%',
                'discount_type' => 'percent',
                'discount_value' => 20,
                'max_discount' => 1000000,
                'starts_at' => now()->subDays(10)->toDateTimeString(),
                'ends_at' => now()->subDays(2)->toDateTimeString(),
                'priority' => 90,
                'status' => 'ended',
            ]);

        $createRes->assertStatus(201)->assertJsonPath('data.status', 'ended');
        $campaignId = $createRes->json('data.id');

        // Mở lại chiến dịch đã kết thúc với thời gian mới
        $reopenRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/campaigns/'.$campaignId.'/reopen', [
                'starts_at' => now()->subHour()->toDateTimeString(),
                'ends_at' => now()->addDays(5)->toDateTimeString(),
            ]);

        $reopenRes->assertStatus(200)->assertJsonPath('data.status', 'active');

        $publicRes = $this->getJson('/api/v1/public/campaigns');
        $publicRes->assertStatus(200);
        $this->assertTrue(collect($publicRes->json('data'))->pluck('id')->contains($campaignId));

        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/campaigns/'.$campaignId)
            ->assertStatus(200);
    }
}
