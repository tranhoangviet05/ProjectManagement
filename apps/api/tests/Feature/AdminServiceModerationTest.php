<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Enums\UserRole;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminServiceModerationTest extends TestCase
{
    protected User $adminUser;

    protected string $adminToken;

    protected User $providerUser;

    protected string $providerToken;

    protected User $touristUser;

    protected string $touristToken;

    protected ProviderProfile $providerProfile;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->adminUser = User::where('email', 'admin@gmail.com')->first();
        $this->adminToken = $this->adminUser->createToken('test-admin-moderation')->plainTextToken;

        $this->providerUser = User::updateOrCreate(
            ['email' => 'provider.mod.test@gmail.com'],
            [
                'name' => 'Provider Mod Test',
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Provider->value,
                'status' => 'active',
            ]
        );
        $this->providerToken = $this->providerUser->createToken('test-provider-mod')->plainTextToken;

        $this->providerProfile = ProviderProfile::updateOrCreate(
            ['user_id' => $this->providerUser->id],
            [
                'business_name' => 'Đà Nẵng Mod Travel',
                'status' => ProviderStatus::Approved->value,
            ]
        );

        $this->touristUser = User::where('email', 'tranhoangviet@gmail.com')->first();
        $this->touristToken = $this->touristUser->createToken('test-tourist-mod')->plainTextToken;
    }

    public function test_admin_can_list_and_view_service_moderation_details(): void
    {
        $service = Service::create([
            'provider_id' => $this->providerProfile->id,
            'name' => 'Tour Kiểm Duyệt '.uniqid(),
            'slug' => 'tour-kiem-duyet-'.uniqid(),
            'type' => 'tour',
            'status' => ServiceStatus::PendingReview->value,
            'base_price' => 750000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả chi tiết tour.',
        ]);

        $listResponse = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/services?status=pending_review');

        $listResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'counts' => ['pending_review', 'active', 'rejected'],
                'data',
                'meta',
            ]);

        $showResponse = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/services/'.$service->id);

        $showResponse->assertStatus(200)
            ->assertJsonPath('data.id', $service->id)
            ->assertJsonPath('data.provider.business_name', 'Đà Nẵng Mod Travel');
    }

    public function test_admin_can_approve_pending_review_service(): void
    {
        $service = Service::create([
            'provider_id' => $this->providerProfile->id,
            'name' => 'Tour Chờ Duyệt Approve '.uniqid(),
            'slug' => 'tour-cho-duyet-approve-'.uniqid(),
            'type' => 'tour',
            'status' => ServiceStatus::PendingReview->value,
            'base_price' => 500000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
            'rejection_reason' => 'Lý do cũ cần xóa',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/services/'.$service->id.'/approve');

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.rejection_reason', null);

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'active',
            'rejection_reason' => null,
        ]);
    }

    public function test_admin_reject_requires_valid_reason_and_saves_rejected_status(): void
    {
        $service = Service::create([
            'provider_id' => $this->providerProfile->id,
            'name' => 'Tour Chờ Duyệt Reject '.uniqid(),
            'slug' => 'tour-cho-duyet-reject-'.uniqid(),
            'type' => 'tour',
            'status' => ServiceStatus::PendingReview->value,
            'base_price' => 500000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
        ]);

        // Lý do trống hoặc quá ngắn -> 422
        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/services/'.$service->id.'/reject', [
                'rejection_reason' => 'Ngắn',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['rejection_reason']);

        // Lý do hợp lệ -> 200
        $reason = 'Hình ảnh album bị mờ và thiếu lịch trình chi tiết buổi chiều.';
        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/services/'.$service->id.'/reject', [
                'rejection_reason' => $reason,
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.rejection_reason', $reason);
    }

    public function test_non_admin_roles_cannot_access_service_moderation_endpoints(): void
    {
        $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->getJson('/api/v1/admin/services')
            ->assertStatus(403);

        $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->getJson('/api/v1/admin/services')
            ->assertStatus(403);
    }
}
