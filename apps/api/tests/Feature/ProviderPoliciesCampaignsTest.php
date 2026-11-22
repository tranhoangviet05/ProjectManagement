<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Models\Category;
use App\Models\HolidayCampaign;
use App\Models\Location;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServicePolicy;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\HolidayCampaignSeeder;
use Database\Seeders\ServicePolicySeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ProviderPoliciesCampaignsTest extends TestCase
{
    use DatabaseTransactions;

    private string $providerToken;

    private ProviderProfile $providerProfile;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->seed(ServicePolicySeeder::class);
        $this->seed(HolidayCampaignSeeder::class);

        $providerUser = User::where('email', 'tranhoangviet.provider@gmail.com')->firstOrFail();
        $this->providerProfile = ProviderProfile::where('user_id', $providerUser->id)->firstOrFail();
        $this->providerProfile->update(['status' => ProviderStatus::Approved->value]);
        $this->providerToken = $providerUser->createToken('test-provider')->plainTextToken;
    }

    public function test_provider_can_assign_policies_when_creating_service(): void
    {
        $categoryId = Category::query()->value('id');
        $locationId = Location::query()->value('id');
        $policyIds = ServicePolicy::query()->limit(2)->pluck('id')->all();

        $res = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->postJson('/api/v1/provider/services', [
                'name' => 'Tour Khám Phá '.substr(uniqid(), -5),
                'category_id' => $categoryId,
                'location_id' => $locationId,
                'description' => 'Mô tả tour trải nghiệm đặc sắc.',
                'base_price' => 750000,
                'address' => '218 Võ Nguyên Giáp, Đà Nẵng',
                'policy_ids' => $policyIds,
            ]);

        $res->assertStatus(201);
        $serviceId = $res->json('data.id');

        foreach ($policyIds as $pid) {
            $this->assertDatabaseHas('service_policy_assignments', [
                'service_id' => $serviceId,
                'service_policy_id' => $pid,
            ]);
        }
    }

    public function test_provider_can_opt_in_specific_service_to_holiday_campaign(): void
    {
        $categoryId = Category::query()->value('id');
        $locationId = Location::query()->value('id');

        $svc1 = Service::create([
            'provider_id' => $this->providerProfile->id,
            'category_id' => $categoryId,
            'location_id' => $locationId,
            'name' => 'Dịch vụ A '.substr(uniqid(), -5),
            'slug' => 'dich-vu-a-'.substr(uniqid(), -6),
            'description' => 'Dịch vụ A',
            'type' => 'tour',
            'status' => 'active',
            'base_price' => 900000,
            'price_unit' => 'khách',
            'address' => 'Đà Nẵng',
        ]);

        $pendingSvc = Service::create([
            'provider_id' => $this->providerProfile->id,
            'category_id' => $categoryId,
            'location_id' => $locationId,
            'name' => 'Dịch vụ Chờ duyệt '.substr(uniqid(), -5),
            'slug' => 'dich-vu-cho-duyet-'.substr(uniqid(), -6),
            'description' => 'Chờ duyệt',
            'type' => 'tour',
            'status' => 'pending_review',
            'base_price' => 500000,
            'price_unit' => 'khách',
            'address' => 'Đà Nẵng',
        ]);

        $campaign = HolidayCampaign::where('status', 'active')->firstOrFail();

        // Dịch vụ chưa duyệt mở bán không được tham gia khuyến mãi -> 422
        $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->putJson('/api/v1/provider/campaigns/'.$campaign->id.'/services', [
                'service_id' => $pendingSvc->id,
                'is_active' => true,
                'discount_value' => $campaign->discount_value,
            ])
            ->assertStatus(422);

        // Không cho phép nhập mức giảm thấp hơn mức chuẩn của chiến dịch
        $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->putJson('/api/v1/provider/campaigns/'.$campaign->id.'/services', [
                'service_id' => $svc1->id,
                'is_active' => true,
                'discount_value' => 1,
            ])
            ->assertStatus(422);

        // Tham gia với mức giảm cao hơn mức chuẩn -> 200
        $higherDiscount = $campaign->discount_value + 10;
        $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->putJson('/api/v1/provider/campaigns/'.$campaign->id.'/services', [
                'service_id' => $svc1->id,
                'is_active' => true,
                'discount_value' => $higherDiscount,
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('service_promotions', [
            'holiday_campaign_id' => $campaign->id,
            'service_id' => $svc1->id,
            'is_active' => true,
        ]);
    }
}
