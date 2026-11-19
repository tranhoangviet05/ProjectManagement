<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Location;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServiceMedia;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ServiceManagementTest extends TestCase
{
    protected User $providerUser;

    protected string $providerToken;

    protected ProviderProfile $providerProfile;

    protected User $otherProviderUser;

    protected string $otherProviderToken;

    protected Category $category;

    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->category = Category::first() ?? Category::create([
            'name' => 'Tour Biển Đảo',
            'slug' => 'tour-bien-dao',
        ]);

        $this->location = Location::first() ?? Location::create([
            'name' => 'Đà Nẵng',
            'slug' => 'da-nang',
            'country_code' => 'VN',
            'is_popular' => true,
        ]);

        /** @var User $provider */
        $provider = User::updateOrCreate(
            ['email' => 'provider.service.test@gmail.com'],
            [
                'name' => 'Provider Service Test',
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Provider->value,
                'status' => 'active',
                'social_active' => true,
            ]
        );
        $this->providerUser = $provider;
        $this->providerToken = $provider->createToken('test-provider-service')->plainTextToken;

        $this->providerProfile = ProviderProfile::updateOrCreate(
            ['user_id' => $provider->id],
            [
                'business_name' => 'Đà Nẵng Ocean Service Test',
                'representative_name' => 'Nguyễn Văn Service',
                'phone' => '0905123456',
                'address' => '123 Võ Nguyên Giáp, Đà Nẵng',
                'status' => ProviderStatus::Approved->value,
            ]
        );

        /** @var User $otherProvider */
        $otherProvider = User::updateOrCreate(
            ['email' => 'other.provider.service.test@gmail.com'],
            [
                'name' => 'Other Provider Test',
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Provider->value,
                'status' => 'active',
                'social_active' => true,
            ]
        );
        $this->otherProviderUser = $otherProvider;
        $this->otherProviderToken = $otherProvider->createToken('test-other-provider')->plainTextToken;

        ProviderProfile::updateOrCreate(
            ['user_id' => $otherProvider->id],
            [
                'business_name' => 'Other Travel Co.',
                'representative_name' => 'Trần Văn Khác',
                'phone' => '0912345678',
                'address' => '456 Bạch Đằng, Đà Nẵng',
                'status' => ProviderStatus::Approved->value,
            ]
        );
    }

    public function test_provider_can_create_services_with_unique_seo_slug_and_schedules(): void
    {
        $payload = [
            'name' => 'Tour Lặn San Hô Cù Lao Chàm '.uniqid(),
            'type' => 'tour',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => 'pending_review',
            'description' => 'Trải nghiệm lặn ngắm san hô bằng cano cao tốc.',
            'base_price' => 650000,
            'price_unit' => 'người',
            'max_guests' => 20,
            'duration_days' => 1,
            'duration_nights' => 0,
            'address' => 'Cảng Cửa Đại, Hội An',
            'amenities' => ['Cano cao tốc', 'Áo phao'],
            'includes' => ['Vé tham quan', 'Bữa trưa'],
            'excludes' => ['Thuế VAT'],
            'schedules' => [
                [
                    'day_number' => 1,
                    'title' => 'Khởi hành Cửa Đại - Bãi Ông',
                    'description' => 'Đón khách và lặn ngắm san hô.',
                    'activities' => ['08:00 Tập trung', '09:30 Lặn san hô'],
                ],
            ],
        ];

        $firstResponse = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->postJson('/api/v1/provider/services', $payload);

        $firstResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending_review')
            ->assertJsonPath('data.schedules.0.day_number', 1);

        $firstSlug = $firstResponse->json('data.slug');
        $this->assertNotEmpty($firstSlug);

        // Tạo dịch vụ trùng tên phải sinh slug khác nhau (không lỗi unique constraint)
        $secondResponse = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->postJson('/api/v1/provider/services', $payload);

        $secondResponse->assertStatus(201);
        $secondSlug = $secondResponse->json('data.slug');
        $this->assertNotEquals($firstSlug, $secondSlug);
        $this->assertStringStartsWith($firstSlug.'-', $secondSlug);
    }

    public function test_provider_cannot_directly_set_active_or_rejected_status(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->postJson('/api/v1/provider/services', [
                'name' => 'Tour Tự Duyệt Không Hợp Lệ',
                'type' => 'tour',
                'status' => 'active',
                'base_price' => 500000,
                'price_unit' => 'người',
                'max_guests' => 10,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_provider_cannot_access_or_modify_another_providers_service(): void
    {
        $service = Service::create([
            'provider_id' => $this->providerProfile->id,
            'name' => 'Dịch vụ Riêng Tư Provider A',
            'slug' => 'dich-vu-rieng-tu-provider-a-'.uniqid(),
            'type' => 'hotel',
            'status' => 'draft',
            'base_price' => 1200000,
            'price_unit' => 'phòng/đêm',
            'max_guests' => 4,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$this->otherProviderToken)
            ->getJson('/api/v1/provider/services/'.$service->id)
            ->assertStatus(404);

        $this->withHeader('Authorization', 'Bearer '.$this->otherProviderToken)
            ->putJson('/api/v1/provider/services/'.$service->id, [
                'name' => 'Hack Tên Dịch Vụ',
            ])
            ->assertStatus(404);

        $this->withHeader('Authorization', 'Bearer '.$this->otherProviderToken)
            ->deleteJson('/api/v1/provider/services/'.$service->id)
            ->assertStatus(404);
    }

    public function test_provider_can_upload_set_cover_and_delete_service_media(): void
    {
        Storage::fake('public');

        $service = Service::create([
            'provider_id' => $this->providerProfile->id,
            'name' => 'Khách Sạn Biển Test Media',
            'slug' => 'khach-san-bien-test-media-'.uniqid(),
            'type' => 'hotel',
            'status' => 'draft',
            'base_price' => 1500000,
            'price_unit' => 'phòng/đêm',
            'max_guests' => 2,
        ]);

        $file1 = UploadedFile::fake()->create('photo1.jpg', 200, 'image/jpeg');
        $file2 = UploadedFile::fake()->create('photo2.png', 200, 'image/png');

        $uploadResponse = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->postJson('/api/v1/provider/services/'.$service->id.'/media', [
                'files' => [$file1, $file2],
                'cover_index' => 0,
            ]);

        $uploadResponse->assertStatus(201)
            ->assertJsonCount(2, 'data');

        $media1Id = $uploadResponse->json('data.0.id');
        $media2Id = $uploadResponse->json('data.1.id');

        $this->assertTrue((bool) ServiceMedia::find($media1Id)->is_cover);
        $this->assertFalse((bool) ServiceMedia::find($media2Id)->is_cover);

        // Chuyển ảnh bìa sang ảnh thứ 2
        $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->patchJson('/api/v1/provider/services/'.$service->id.'/media/'.$media2Id.'/cover')
            ->assertStatus(200)
            ->assertJsonPath('data.is_cover', true);

        $this->assertFalse((bool) ServiceMedia::find($media1Id)->is_cover);
        $this->assertTrue((bool) ServiceMedia::find($media2Id)->is_cover);

        // Xóa ảnh bìa thứ 2 -> ảnh thứ 1 tự động được chọn làm ảnh bìa thay thế
        $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->deleteJson('/api/v1/provider/services/'.$service->id.'/media/'.$media2Id)
            ->assertStatus(200);

        $this->assertNull(ServiceMedia::find($media2Id));
        $this->assertTrue((bool) ServiceMedia::find($media1Id)->is_cover);
    }

    public function test_provider_can_soft_delete_service(): void
    {
        $service = Service::create([
            'provider_id' => $this->providerProfile->id,
            'name' => 'Tour Sắp Xóa Mềm',
            'slug' => 'tour-sap-xoa-mem-'.uniqid(),
            'type' => 'tour',
            'status' => 'draft',
            'base_price' => 400000,
            'price_unit' => 'người',
            'max_guests' => 15,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->deleteJson('/api/v1/provider/services/'.$service->id)
            ->assertStatus(200);

        $this->assertSoftDeleted('services', ['id' => $service->id]);
    }

    public function test_public_catalog_endpoints_return_categories_and_locations(): void
    {
        $this->getJson('/api/v1/public/categories')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->getJson('/api/v1/public/locations')
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
