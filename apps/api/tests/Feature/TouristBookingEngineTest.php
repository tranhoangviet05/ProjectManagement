<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\HolidayCampaign;
use App\Models\HotelRoomType;
use App\Models\Location;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServiceAvailability;
use App\Models\ServicePolicy;
use App\Models\ServicePromotion;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TouristBookingEngineTest extends TestCase
{
    use DatabaseTransactions;

    private function seedBookingFixtures(): array
    {
        $tourist = User::create([
            'email' => 'tourist-booking@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::Tourist->value,
            'status' => 'active',
        ]);
        $providerUser = User::create([
            'email' => 'provider-booking@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::Provider->value,
            'status' => 'active',
        ]);
        $provider = ProviderProfile::create([
            'user_id' => $providerUser->id,
            'business_name' => 'Resort Đà Nẵng Test',
            'status' => ProviderStatus::Approved->value,
        ]);

        $location = Location::create(['name' => 'Đà Nẵng Test', 'slug' => 'test-da-nang-booking']);
        $category = Category::create([
            'name' => 'Khách sạn Test',
            'slug' => 'test-khach-san-booking',
            'applicable_types' => ['hotel', 'homestay'],
        ]);

        $depositPolicy = ServicePolicy::firstOrCreate(
            ['slug' => 'dat-coc-giu-cho-30'],
            [
                'name' => 'Đặt cọc giữ chỗ 30%',
                'category' => 'payment',
                'applicable_types' => ['hotel', 'homestay'],
                'is_active' => true,
            ]
        );

        $payAtPropertyPolicy = ServicePolicy::firstOrCreate(
            ['slug' => 'thanh-toan-khi-nhan-phong'],
            [
                'name' => 'Thanh toán khi nhận phòng / sử dụng dịch vụ',
                'category' => 'payment',
                'applicable_types' => ['hotel', 'homestay', 'vehicle'],
                'is_active' => true,
            ]
        );

        $hotel = Service::create([
            'provider_id' => $provider->id,
            'category_id' => $category->id,
            'location_id' => $location->id,
            'type' => 'hotel',
            'name' => 'Ocean View Resort Test',
            'slug' => 'test-ocean-view-resort',
            'base_price' => 1000000,
            'price_unit' => 'night',
            'status' => ServiceStatus::Active->value,
        ]);
        $hotel->policies()->attach([$depositPolicy->id, $payAtPropertyPolicy->id]);

        $roomType = HotelRoomType::create([
            'service_id' => $hotel->id,
            'name' => 'Family Ocean 4 Khách',
            'base_price' => 1000000,
            'total_rooms' => 2,
            'inventory' => 2,
            'capacity_adults' => 4,
            'capacity_children' => 1,
            'status' => 'active',
        ]);

        $tour = Service::create([
            'provider_id' => $provider->id,
            'category_id' => $category->id,
            'location_id' => $location->id,
            'type' => 'tour',
            'name' => 'Tour Bà Nà Hills Test',
            'slug' => 'test-tour-ba-na-hills',
            'base_price' => 800000,
            'price_unit' => 'person',
            'status' => ServiceStatus::Active->value,
        ]);

        return compact('tourist', 'provider', 'hotel', 'roomType', 'tour');
    }

    public function test_accommodation_calculates_by_room_nights_separates_two_discounts_and_holds_10_minutes(): void
    {
        $f = $this->seedBookingFixtures();
        Sanctum::actingAs($f['tourist']);

        $campaign = HolidayCampaign::create([
            'name' => 'Black Friday Test',
            'slug' => 'test-black-friday-booking',
            'discount_type' => 'percent',
            'discount_value' => 10,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDays(5),
            'priority' => 100,
            'status' => 'active',
        ]);

        $promo = ServicePromotion::create([
            'holiday_campaign_id' => $campaign->id,
            'service_id' => $f['hotel']->id,
            'discount_type' => 'percent',
            'discount_value' => 20, // 20% off 2 nights (2,000,000) => 400,000 off => 1,600,000
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'TEST100K',
            'type' => 'fixed',
            'discount_value' => 100000,
            'min_order_amount' => 500000,
            'usage_limit' => 10,
            'used_count' => 0,
            'per_user_limit' => 2,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDays(5),
        ]);

        // Phòng 4 người, đặt 1 phòng cho 3 người trong 2 đêm => vẫn tính đúng 1 phòng x 2 đêm = 2,000,000
        $res = $this->postJson('/api/v1/tourist/bookings', [
            'service_id' => $f['hotel']->id,
            'room_type_id' => $f['roomType']->id,
            'start_date' => now()->addDays(2)->format('Y-m-d'),
            'end_date' => now()->addDays(4)->format('Y-m-d'),
            'quantity' => 1,
            'deposit_rate' => 30,
            'coupon_code' => 'TEST100K',
            'contact_name' => 'Nguyễn Văn A',
            'contact_phone' => '0901234567',
            'metadata' => ['num_adults' => 3, 'num_children' => 0, 'has_pets' => true],
        ]);

        $res->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending_payment')
            ->assertJsonPath('data.service_promotion_id', $promo->id)
            ->assertJsonPath('data.deposit_rate', 30)
            ->assertJsonPath('data.duration_units', 2)
            ->assertJsonPath('data.metadata.num_adults', 3);

        $data = $res->json('data');
        $this->assertSame(2000000.0, (float) $data['subtotal']);
        $this->assertSame(400000.0, (float) $data['promotion_discount_amount']);
        $this->assertSame(100000.0, (float) $data['coupon_discount_amount']);
        $this->assertSame(1500000.0, (float) $data['total_amount']);
        $this->assertSame(450000.0, (float) $data['deposit_amount']);
        $this->assertSame(1050000.0, (float) $data['remaining_amount']);
        $this->assertNotNull($data['payment_expires_at']);
    }

    public function test_guest_checkout_0_percent_pay_at_property_confirms_immediately_without_hold(): void
    {
        $f = $this->seedBookingFixtures();

        // Khách vãng lai (không đăng nhập) chọn trả trước 0% theo chính sách trả khi nhận phòng
        $res = $this->postJson('/api/v1/public/bookings', [
            'service_id' => $f['hotel']->id,
            'room_type_id' => $f['roomType']->id,
            'start_date' => now()->addDays(3)->format('Y-m-d'),
            'end_date' => now()->addDays(4)->format('Y-m-d'),
            'quantity' => 1,
            'deposit_rate' => 0,
            'contact_name' => 'Khách Vãng Lai',
            'contact_phone' => '0988777666',
            'contact_email' => 'guest@example.com',
        ]);

        $res->assertStatus(201)
            ->assertJsonPath('data.user_id', null)
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.deposit_rate', 0)
            ->assertJsonPath('data.payment_expires_at', null);

        $code = $res->json('data.booking_code');

        // Tra cứu lại đơn vãng lai bằng mã đơn + SĐT
        $this->getJson("/api/v1/public/bookings/{$code}?contact_phone=0988777666")
            ->assertOk()
            ->assertJsonPath('data.booking_code', $code);
    }

    public function test_unpaid_10_minute_hold_blocks_other_users_and_releases_slot_after_expiry(): void
    {
        $f = $this->seedBookingFixtures();
        Sanctum::actingAs($f['tourist']);

        $tourDate = now()->addDays(4)->format('Y-m-d');
        ServiceAvailability::create([
            'service_id' => $f['tour']->id,
            'available_date' => $tourDate,
            'total_slots' => 2,
            'booked_slots' => 0,
            'is_blocked' => false,
        ]);

        // Người 1 giữ 2 vé cuối cùng -> chờ thanh toán 10p
        $first = $this->postJson('/api/v1/tourist/bookings', [
            'service_id' => $f['tour']->id,
            'start_date' => $tourDate,
            'quantity' => 2,
            'contact_name' => 'Khách 1',
            'contact_phone' => '0901111111',
        ]);
        $first->assertStatus(201)->assertJsonPath('data.status', 'pending_payment');

        // Người 2 cố đặt 1 vé trong lúc còn hạn 10p -> bị chặn 422
        $this->postJson('/api/v1/public/bookings', [
            'service_id' => $f['tour']->id,
            'start_date' => $tourDate,
            'quantity' => 1,
            'contact_name' => 'Khách 2',
            'contact_phone' => '0902222222',
            'contact_email' => 'khach2@example.com',
        ])->assertStatus(422);

        // Giả lập quá 10 phút chưa thanh toán
        Booking::where('id', $first->json('data.id'))->update([
            'payment_expires_at' => now()->subMinute(),
        ]);

        // Người 2 đặt lại -> hệ thống tự hủy đơn Người 1 với lý do "Chưa thanh toán", trả slot và cho Người 2 đặt thành công
        $this->postJson('/api/v1/public/bookings', [
            'service_id' => $f['tour']->id,
            'start_date' => $tourDate,
            'quantity' => 1,
            'contact_name' => 'Khách 2',
            'contact_phone' => '0902222222',
            'contact_email' => 'khach2@example.com',
        ])->assertStatus(201);

        $expired = Booking::find($first->json('data.id'));
        $this->assertSame('cancelled', $expired->status);
        $this->assertSame('Chưa thanh toán', $expired->cancel_reason);
    }

    public function test_room_type_schedule_conflict_blocks_overlapping_bookings(): void
    {
        $f = $this->seedBookingFixtures();
        Sanctum::actingAs($f['tourist']);

        $d1 = now()->addDays(5)->format('Y-m-d');
        $d2 = now()->addDays(8)->format('Y-m-d');

        // Inventory = 2 phòng -> đặt hết 2 phòng
        $this->postJson('/api/v1/tourist/bookings', [
            'service_id' => $f['hotel']->id,
            'room_type_id' => $f['roomType']->id,
            'start_date' => $d1,
            'end_date' => $d2,
            'quantity' => 2,
            'contact_name' => 'Khách 1',
            'contact_phone' => '0911111111',
        ])->assertStatus(201);

        // Khoảng ngày chồng lấn bị chặn 422
        $this->postJson('/api/v1/tourist/bookings', [
            'service_id' => $f['hotel']->id,
            'room_type_id' => $f['roomType']->id,
            'start_date' => now()->addDays(6)->format('Y-m-d'),
            'end_date' => now()->addDays(9)->format('Y-m-d'),
            'quantity' => 1,
            'contact_name' => 'Khách 2',
            'contact_phone' => '0922222222',
        ])->assertStatus(422);
    }
}
