<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Models\BusinessType;
use App\Models\Category;
use App\Models\Location;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Tests\TestCase;

class AdminCatalogManagementTest extends TestCase
{
    protected User $adminUser;

    protected string $adminToken;

    protected User $touristUser;

    protected string $touristToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->adminUser = User::where('email', 'admin@gmail.com')->firstOrFail();
        $this->adminToken = $this->adminUser->createToken('test-admin-catalog')->plainTextToken;

        $this->touristUser = User::where('email', 'tranhoangviet@gmail.com')->firstOrFail();
        $this->touristToken = $this->touristUser->createToken('test-tourist-catalog')->plainTextToken;
    }

    public function test_admin_can_crud_locations_and_blocks_delete_when_referenced(): void
    {
        $suffix = uniqid();
        $parentName = 'Khu Vực Test '.$suffix;
        $parentRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/locations', [
                'name' => $parentName,
                'country_code' => 'vn',
                'is_popular' => true,
                'description' => 'Tỉnh ven biển Nam Trung Bộ.',
                'image_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            ]);

        $parentRes->assertStatus(201)
            ->assertJsonPath('data.slug', 'khu-vuc-test-'.$suffix)
            ->assertJsonPath('data.country_code', 'VN')
            ->assertJsonPath('data.is_popular', true);

        $parentId = $parentRes->json('data.id');

        $childRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/locations', [
                'name' => 'Vịnh Ninh Vân '.$suffix,
                'parent_id' => $parentId,
                'is_popular' => false,
            ]);

        $childRes->assertStatus(201)
            ->assertJsonPath('data.parent_id', $parentId)
            ->assertJsonPath('data.parent.name', $parentName);

        $childId = $childRes->json('data.id');

        // Không cho chọn chính mình làm parent_id
        $selfParent = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->putJson('/api/v1/admin/locations/'.$parentId, [
                'name' => $parentName,
                'parent_id' => $parentId,
            ]);
        $selfParent->assertStatus(422);

        // Không cho xóa parent đang có location con
        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/locations/'.$parentId)
            ->assertStatus(422);

        // Xóa child rồi xóa parent -> thành công
        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/locations/'.$childId)
            ->assertStatus(200);

        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/locations/'.$parentId)
            ->assertStatus(200);
    }

    public function test_admin_can_crud_categories_and_business_types_with_reference_guards(): void
    {
        $suffix = substr(uniqid(), -6);

        $catRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/categories', [
                'name' => 'Du lịch Sinh thái '.$suffix,
                'icon' => 'trees',
                'icon_url' => 'https://example.com/eco.png',
                'description' => 'Khám phá rừng nguyên sinh và biển đảo.',
            ]);

        $catRes->assertStatus(201)->assertJsonPath('data.slug', 'du-lich-sinh-thai-'.$suffix);
        $catId = $catRes->json('data.id');

        $btRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/business-types', [
                'type' => 'Giải trí',
                'name' => 'Công viên chuyên đề '.$suffix,
            ]);

        $btRes->assertStatus(201)->assertJsonPath('data.slug', 'cong-vien-chuyen-de-'.$suffix);
        $btId = $btRes->json('data.id');

        // Tạo service tham chiếu category -> chặn xóa category
        $providerUser = User::where('email', 'tranhoangviet.provider@gmail.com')->firstOrFail();
        $providerProfile = ProviderProfile::where('user_id', $providerUser->id)->firstOrFail();
        $providerProfile->update(['status' => ProviderStatus::Approved->value]);

        $location = Location::create(['name' => 'Test Loc '.uniqid(), 'slug' => 'test-loc-'.uniqid()]);
        Service::create([
            'provider_id' => $providerProfile->id,
            'category_id' => $catId,
            'location_id' => $location->id,
            'name' => 'Tour Sinh Thái Test '.uniqid(),
            'slug' => 'tour-sinh-thai-test-'.uniqid(),
            'type' => 'tour',
            'status' => ServiceStatus::Active->value,
            'base_price' => 500000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/categories/'.$catId)
            ->assertStatus(422);

        // BusinessType chưa ai dùng -> xóa thành công
        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/business-types/'.$btId)
            ->assertStatus(200);

        // Non-admin bị chặn 403
        $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->getJson('/api/v1/admin/locations')
            ->assertStatus(403);
    }
}
