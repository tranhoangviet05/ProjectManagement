<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Location;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ProviderBookingsQrTicketTest extends TestCase
{
    use DatabaseTransactions;

    public function test_provider_can_list_and_view_bookings_without_exposing_qr_token(): void
    {
        $providerUser = User::create([
            'email' => 'qr-provider-'.uniqid().'@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::Provider->value,
            'status' => 'active',
        ]);
        $provider = ProviderProfile::create([
            'user_id' => $providerUser->id,
            'business_name' => 'Resort QR Test '.uniqid(),
            'status' => ProviderStatus::Approved->value,
        ]);
        $location = Location::first() ?? Location::create([
            'name' => 'Đà Nẵng QR Test',
            'slug' => 'da-nang-qr-'.uniqid(),
            'is_popular' => true,
        ]);
        $service = Service::create([
            'provider_id' => $provider->id,
            'location_id' => $location->id,
            'name' => 'Tour QR Test '.uniqid(),
            'slug' => 'tour-qr-test-'.uniqid(),
            'description' => 'Mô tả tour test QR',
            'type' => 'tour',
            'status' => ServiceStatus::Active->value,
            'base_price' => 500000,
            'price_unit' => 'person',
            'address' => 'Đà Nẵng',
        ]);
        $tourist = User::create([
            'email' => 'qr-tourist-'.uniqid().'@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::Tourist->value,
            'status' => 'active',
        ]);

        $booking = Booking::create([
            'booking_code' => 'STB-20261128-'.strtoupper(substr(uniqid(), -6)),
            'qr_checkin_token' => 'QR-SECRET-'.uniqid(),
            'user_id' => $tourist->id,
            'service_id' => $service->id,
            'provider_id' => $provider->id,
            'check_in_date' => now()->addDays(2)->format('Y-m-d'),
            'check_out_date' => now()->addDays(3)->format('Y-m-d'),
            'num_adults' => 2,
            'num_children' => 0,
            'unit_price' => 500000,
            'subtotal' => 1000000,
            'discount_amount' => 0,
            'total_amount' => 1000000,
            'status' => 'confirmed',
            'contact_name' => 'Nguyen Van QR',
            'contact_phone' => '0901112233',
            'contact_email' => 'qr@example.com',
        ]);

        $listRes = $this->actingAs($providerUser, 'sanctum')
            ->getJson('/api/v1/provider/bookings');

        $listRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.booking_code', $booking->booking_code);

        $detailRes = $this->actingAs($providerUser, 'sanctum')
            ->getJson('/api/v1/provider/bookings/'.$booking->id);

        $detailRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.booking_code', $booking->booking_code)
            ->assertJsonMissing(['qr_checkin_token' => $booking->qr_checkin_token]);
    }
}
