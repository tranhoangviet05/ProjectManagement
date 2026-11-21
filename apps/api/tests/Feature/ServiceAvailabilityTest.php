<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Enums\UserRole;
use App\Models\BusinessType;
use App\Models\Category;
use App\Models\Location;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServiceAvailability;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ServiceAvailabilityTest extends TestCase
{
    protected User $tourProvider;

    protected string $tourToken;

    protected ProviderProfile $tourProfile;

    protected User $hotelProvider;

    protected string $hotelToken;

    protected ProviderProfile $hotelProfile;

    protected User $otherProvider;

    protected string $otherToken;

    protected Category $category;

    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->category = Category::first() ?? Category::create(['name' => 'Tour', 'slug' => 'tour']);
        $this->location = Location::first() ?? Location::create(['name' => 'Đà Nẵng', 'slug' => 'da-nang']);

        $tourType = BusinessType::where('slug', 'tour-du-lich-trai-nghiem')->first();
        $hotelType = BusinessType::where('slug', 'khach-san')->first();

        $this->tourProvider = User::updateOrCreate(
            ['email' => 'provider.avail.tour@gmail.com'],
            [
                'name' => 'Tour Avail Test',
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Provider->value,
                'status' => 'active',
            ]
        );
        $this->tourToken = $this->tourProvider->createToken('tour-avail-token')->plainTextToken;
        $this->tourProfile = ProviderProfile::updateOrCreate(
            ['user_id' => $this->tourProvider->id],
            [
                'business_name' => 'Tour Avail Co.',
                'business_type_id' => $tourType?->id,
                'status' => ProviderStatus::Approved->value,
            ]
        );

        $this->hotelProvider = User::updateOrCreate(
            ['email' => 'provider.avail.hotel@gmail.com'],
            [
                'name' => 'Hotel Avail Test',
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Provider->value,
                'status' => 'active',
            ]
        );
        $this->hotelToken = $this->hotelProvider->createToken('hotel-avail-token')->plainTextToken;
        $this->hotelProfile = ProviderProfile::updateOrCreate(
            ['user_id' => $this->hotelProvider->id],
            [
                'business_name' => 'Hotel Avail Resort',
                'business_type_id' => $hotelType?->id,
                'status' => ProviderStatus::Approved->value,
            ]
        );

        $this->otherProvider = User::updateOrCreate(
            ['email' => 'other.avail.provider@gmail.com'],
            [
                'name' => 'Other Avail Test',
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Provider->value,
                'status' => 'active',
            ]
        );
        $this->otherToken = $this->otherProvider->createToken('other-avail-token')->plainTextToken;
        ProviderProfile::updateOrCreate(
            ['user_id' => $this->otherProvider->id],
            [
                'business_name' => 'Other Avail Co.',
                'business_type_id' => $tourType?->id,
                'status' => ProviderStatus::Approved->value,
            ]
        );
    }

    public function test_creating_tour_generates_15_days_availability_and_supports_per_day_customization(): void
    {
        $availabilities = [];
        for ($i = 0; $i < 15; $i++) {
            $availabilities[] = [
                'available_date' => Carbon::today()->addDays($i)->toDateString(),
                'total_slots' => $i === 2 ? 0 : 12 + $i,
                'price_override' => $i === 4 ? 850000 : null,
                'is_blocked' => $i === 2,
            ];
        }

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tourToken)
            ->postJson('/api/v1/provider/services', [
                'name' => 'Tour 15 Ngày Avail '.uniqid(),
                'category_id' => $this->category->id,
                'location_id' => $this->location->id,
                'description' => 'Mô tả tour có lịch 15 ngày.',
                'base_price' => 650000,
                'address' => 'Đà Nẵng',
                'availabilities' => $availabilities,
            ]);

        $response->assertStatus(201)
            ->assertJsonCount(15, 'data.availability')
            ->assertJsonPath('data.availability.2.is_blocked', true)
            ->assertJsonPath('data.availability.4.price_override', '850000.00');
    }

    public function test_provider_can_bulk_upsert_availability_without_duplicate_key_error(): void
    {
        $service = Service::create([
            'provider_id' => $this->tourProfile->id,
            'name' => 'Tour Bulk Upsert '.uniqid(),
            'slug' => 'tour-bulk-upsert-'.uniqid(),
            'type' => 'tour',
            'status' => 'draft',
            'base_price' => 500000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
        ]);

        $start = Carbon::today()->addDays(1)->toDateString();
        $end = Carbon::today()->addDays(3)->toDateString();

        // Lần 1: tạo mới 3 ngày
        $this->withHeader('Authorization', 'Bearer '.$this->tourToken)
            ->putJson('/api/v1/provider/services/'.$service->id.'/availability', [
                'start_date' => $start,
                'end_date' => $end,
                'total_slots' => 20,
                'price_override' => 650000,
                'is_blocked' => false,
            ])
            ->assertStatus(200)
            ->assertJsonCount(3, 'data');

        // Lần 2: cập nhật đè cùng khoảng ngày không được lỗi duplicate unique key
        $this->withHeader('Authorization', 'Bearer '.$this->tourToken)
            ->putJson('/api/v1/provider/services/'.$service->id.'/availability', [
                'start_date' => $start,
                'end_date' => $end,
                'total_slots' => 15,
                'price_override' => null,
                'is_blocked' => true,
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.0.is_blocked', true)
            ->assertJsonPath('data.0.effective_price', '500000.00');

        $this->withHeader('Authorization', 'Bearer '.$this->tourToken)
            ->getJson('/api/v1/provider/services/'.$service->id.'/availability?from='.$start.'&to='.$end)
            ->assertStatus(200)
            ->assertJsonCount(3, 'data.availabilities');
    }

    public function test_cannot_reduce_total_slots_below_booked_slots(): void
    {
        $service = Service::create([
            'provider_id' => $this->tourProfile->id,
            'name' => 'Tour Guard Booked Slots '.uniqid(),
            'slug' => 'tour-guard-booked-'.uniqid(),
            'type' => 'tour',
            'status' => 'active',
            'base_price' => 500000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
        ]);

        $targetDate = Carbon::today()->addDays(5)->toDateString();
        ServiceAvailability::create([
            'service_id' => $service->id,
            'available_date' => $targetDate,
            'total_slots' => 10,
            'booked_slots' => 6,
            'is_blocked' => false,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$this->tourToken)
            ->putJson('/api/v1/provider/services/'.$service->id.'/availability', [
                'dates' => [$targetDate],
                'total_slots' => 4,
                'is_blocked' => false,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['total_slots']);
    }

    public function test_other_provider_cannot_access_or_modify_service_availability(): void
    {
        $service = Service::create([
            'provider_id' => $this->tourProfile->id,
            'name' => 'Tour Private Avail '.uniqid(),
            'slug' => 'tour-private-avail-'.uniqid(),
            'type' => 'tour',
            'status' => 'draft',
            'base_price' => 500000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$this->otherToken)
            ->getJson('/api/v1/provider/services/'.$service->id.'/availability')
            ->assertStatus(404);

        $this->withHeader('Authorization', 'Bearer '.$this->otherToken)
            ->putJson('/api/v1/provider/services/'.$service->id.'/availability', [
                'dates' => [Carbon::today()->toDateString()],
                'total_slots' => 10,
                'is_blocked' => false,
            ])
            ->assertStatus(404);
    }

    public function test_hotel_room_types_crud_works_for_accommodation_and_blocks_tour(): void
    {
        $tourService = Service::create([
            'provider_id' => $this->tourProfile->id,
            'name' => 'Tour Cannot Have Rooms '.uniqid(),
            'slug' => 'tour-no-rooms-'.uniqid(),
            'type' => 'tour',
            'status' => 'draft',
            'base_price' => 500000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$this->tourToken)
            ->postJson('/api/v1/provider/services/'.$tourService->id.'/room-types', [
                'name' => 'Phòng Lỗi',
                'base_price' => 500000,
                'total_rooms' => 2,
                'capacity_adults' => 2,
            ])
            ->assertStatus(422);

        $hotelService = Service::create([
            'provider_id' => $this->hotelProfile->id,
            'name' => 'Khách Sạn Room Types '.uniqid(),
            'slug' => 'hotel-room-types-'.uniqid(),
            'type' => 'hotel',
            'status' => 'active',
            'base_price' => 1200000,
            'price_unit' => 'phòng/đêm',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả.',
        ]);

        $createRes = $this->withHeader('Authorization', 'Bearer '.$this->hotelToken)
            ->postJson('/api/v1/provider/services/'.$hotelService->id.'/room-types', [
                'name' => 'Phòng Deluxe Hướng Biển',
                'rank' => 'deluxe',
                'base_price' => 1450000,
                'total_rooms' => 5,
                'capacity_adults' => 2,
                'capacity_children' => 1,
                'amenities' => ['Ban công', 'Điều hòa'],
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.inventory', 5);

        $roomId = $createRes->json('data.id');

        $this->withHeader('Authorization', 'Bearer '.$this->hotelToken)
            ->putJson('/api/v1/provider/services/'.$hotelService->id.'/room-types/'.$roomId, [
                'inventory' => 3,
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.inventory', 3);

        $this->withHeader('Authorization', 'Bearer '.$this->hotelToken)
            ->deleteJson('/api/v1/provider/services/'.$hotelService->id.'/room-types/'.$roomId)
            ->assertStatus(200);
    }
}
