<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Enums\UserRole;
use App\Models\BusinessType;
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
    protected User $tourProviderUser;

    protected string $tourProviderToken;

    protected ProviderProfile $tourProviderProfile;

    protected User $hotelProviderUser;

    protected string $hotelProviderToken;

    protected ProviderProfile $hotelProviderProfile;

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

        $tourType = BusinessType::where('slug', 'tour-du-lich-trai-nghiem')->first();
        $villaType = BusinessType::where('slug', 'villa')->first();
        $hotelType = BusinessType::where('slug', 'khach-san')->first();

        /** @var User $tourProvider */
        $tourProvider = User::updateOrCreate(
            ['email' => 'provider.service.test@gmail.com'],
            [
                'name' => 'Provider Service Test',
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Provider->value,
                'status' => 'active',
                'social_active' => true,
            ]
        );
        $this->tourProviderUser = $tourProvider;
        $this->tourProviderToken = $tourProvider->createToken('test-provider-service')->plainTextToken;

        $this->tourProviderProfile = ProviderProfile::updateOrCreate(
            ['user_id' => $tourProvider->id],
            [
                'business_name' => 'Đà Nẵng Ocean Service Test',
                'representative_name' => 'Nguyễn Văn Service',
                'business_type_id' => $tourType?->id,
                'phone' => '0905123456',
                'address' => '123 Võ Nguyên Giáp, Đà Nẵng',
                'status' => ProviderStatus::Approved->value,
            ]
        );

        /** @var User $hotelProvider */
        $hotelProvider = User::updateOrCreate(
            ['email' => 'villa.provider.service.test@gmail.com'],
            [
                'name' => 'Villa Provider Test',
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Provider->value,
                'status' => 'active',
                'social_active' => true,
            ]
        );
        $this->hotelProviderUser = $hotelProvider;
        $this->hotelProviderToken = $hotelProvider->createToken('test-villa-provider')->plainTextToken;

        $this->hotelProviderProfile = ProviderProfile::updateOrCreate(
            ['user_id' => $hotelProvider->id],
            [
                'business_name' => 'Sơn Trà Ocean Villa',
                'representative_name' => 'Lê Thị Villa',
                'business_type_id' => $villaType?->id,
                'phone' => '0905123789',
                'address' => '789 Hoàng Sa, Sơn Trà, Đà Nẵng',
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
                'business_type_id' => $hotelType?->id,
                'phone' => '0912345678',
                'address' => '456 Bạch Đằng, Đà Nẵng',
                'status' => ProviderStatus::Approved->value,
            ]
        );
    }

    public function test_tour_provider_can_create_tour_with_schedules_and_unique_slug(): void
    {
        $payload = [
            'name' => 'Tour Lặn San Hô Cù Lao Chàm '.uniqid(),
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => 'pending_review',
            'description' => 'Trải nghiệm lặn ngắm san hô bằng cano cao tốc.',
            'base_price' => 650000,
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

        $firstResponse = $this->withHeader('Authorization', 'Bearer '.$this->tourProviderToken)
            ->postJson('/api/v1/provider/services', $payload);

        $firstResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.type', 'tour')
            ->assertJsonPath('data.price_unit', 'người')
            ->assertJsonPath('data.status', 'pending_review')
            ->assertJsonPath('data.schedules.0.day_number', 1)
            ->assertJsonPath('data.schedules.0.activities.0', '08:00 Tập trung');

        $firstSlug = $firstResponse->json('data.slug');
        $this->assertNotEmpty($firstSlug);

        // Tạo dịch vụ trùng tên phải sinh slug khác nhau
        $secondResponse = $this->withHeader('Authorization', 'Bearer '.$this->tourProviderToken)
            ->postJson('/api/v1/provider/services', $payload);

        $secondResponse->assertStatus(201);
        $secondSlug = $secondResponse->json('data.slug');
        $this->assertNotEquals($firstSlug, $secondSlug);
        $this->assertStringStartsWith($firstSlug.'-', $secondSlug);
    }

    public function test_accommodation_provider_receives_fixed_price_unit_and_saves_room_types(): void
    {
        // Thiếu room_types phải bị chặn 422
        $missingRoomsResponse = $this->withHeader('Authorization', 'Bearer '.$this->hotelProviderToken)
            ->postJson('/api/v1/provider/services', [
                'name' => 'Villa Nghỉ Dưỡng Sơn Trà '.uniqid(),
                'category_id' => $this->category->id,
                'location_id' => $this->location->id,
                'description' => 'Villa sát biển view toàn cảnh.',
                'base_price' => 3500000,
                'address' => '789 Hoàng Sa, Đà Nẵng',
            ]);

        $missingRoomsResponse->assertStatus(422)
            ->assertJsonValidationErrors(['room_types']);

        // Tạo thành công với 2 loại phòng và tiện nghi riêng
        $response = $this->withHeader('Authorization', 'Bearer '.$this->hotelProviderToken)
            ->postJson('/api/v1/provider/services', [
                'name' => 'Villa Nghỉ Dưỡng Sơn Trà '.uniqid(),
                'category_id' => $this->category->id,
                'location_id' => $this->location->id,
                'status' => 'pending_review',
                'description' => 'Villa sát biển view toàn cảnh.',
                'base_price' => 3500000,
                'address' => '789 Hoàng Sa, Đà Nẵng',
                'amenities' => ['Hồ bơi vô cực', 'Bãi đậu xe'],
                'includes' => ['Ăn sáng miễn phí'],
                'excludes' => ['Dịch vụ spa'],
                'room_types' => [
                    [
                        'name' => 'Phòng Master Ocean View',
                        'rank' => 'deluxe',
                        'description' => 'Phòng hướng biển rộng 45m2.',
                        'base_price' => 3500000,
                        'total_rooms' => 2,
                        'capacity_adults' => 2,
                        'capacity_children' => 1,
                        'amenities' => ['Điều hòa', 'Bồn tắm', 'Ban công'],
                        'status' => 'active',
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'homestay')
            ->assertJsonPath('data.price_unit', 'đêm')
            ->assertJsonCount(1, 'data.room_types')
            ->assertJsonPath('data.room_types.0.name', 'Phòng Master Ocean View')
            ->assertJsonPath('data.room_types.0.amenities.0', 'Điều hòa');
    }

    public function test_provider_cannot_directly_set_active_or_rejected_status(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->tourProviderToken)
            ->postJson('/api/v1/provider/services', [
                'name' => 'Tour Tự Duyệt Không Hợp Lệ',
                'category_id' => $this->category->id,
                'location_id' => $this->location->id,
                'status' => 'active',
                'description' => 'Mô tả tour test.',
                'base_price' => 500000,
                'address' => 'Đà Nẵng',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_provider_cannot_access_or_modify_another_providers_service(): void
    {
        $service = Service::create([
            'provider_id' => $this->tourProviderProfile->id,
            'name' => 'Dịch vụ Riêng Tư Provider A',
            'slug' => 'dich-vu-rieng-tu-provider-a-'.uniqid(),
            'type' => 'tour',
            'status' => 'draft',
            'base_price' => 1200000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
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
            'provider_id' => $this->tourProviderProfile->id,
            'name' => 'Tour Biển Test Media',
            'slug' => 'tour-bien-test-media-'.uniqid(),
            'type' => 'tour',
            'status' => 'draft',
            'base_price' => 1500000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
        ]);

        $file1 = UploadedFile::fake()->create('photo1.jpg', 200, 'image/jpeg');
        $file2 = UploadedFile::fake()->create('photo2.png', 200, 'image/png');

        $uploadResponse = $this->withHeader('Authorization', 'Bearer '.$this->tourProviderToken)
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

        $this->withHeader('Authorization', 'Bearer '.$this->tourProviderToken)
            ->patchJson('/api/v1/provider/services/'.$service->id.'/media/'.$media2Id.'/cover')
            ->assertStatus(200)
            ->assertJsonPath('data.is_cover', true);

        $this->assertFalse((bool) ServiceMedia::find($media1Id)->is_cover);
        $this->assertTrue((bool) ServiceMedia::find($media2Id)->is_cover);

        $this->withHeader('Authorization', 'Bearer '.$this->tourProviderToken)
            ->deleteJson('/api/v1/provider/services/'.$service->id.'/media/'.$media2Id)
            ->assertStatus(200);

        $this->assertNull(ServiceMedia::find($media2Id));
        $this->assertTrue((bool) ServiceMedia::find($media1Id)->is_cover);
    }

    public function test_provider_can_soft_delete_service(): void
    {
        $service = Service::create([
            'provider_id' => $this->tourProviderProfile->id,
            'name' => 'Tour Sắp Xóa Mềm',
            'slug' => 'tour-sap-xoa-mem-'.uniqid(),
            'type' => 'tour',
            'status' => 'draft',
            'base_price' => 400000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$this->tourProviderToken)
            ->deleteJson('/api/v1/provider/services/'.$service->id)
            ->assertStatus(200);

        $this->assertSoftDeleted('services', ['id' => $service->id]);
    }

    public function test_public_catalog_endpoints_return_categories_locations_and_business_types(): void
    {
        $this->getJson('/api/v1/public/categories')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->getJson('/api/v1/public/locations')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->getJson('/api/v1/public/business-types')
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
