<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Database\Seeders\DatabaseSeeder;
use Tests\TestCase;

class AdminDashboardAndBookingTest extends TestCase
{
    protected User $adminUser;

    protected string $adminToken;

    protected User $touristUser;

    protected string $touristToken;

    protected ProviderProfile $providerProfile;

    protected Service $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->adminUser = User::where('email', 'admin@gmail.com')->firstOrFail();
        $this->adminToken = $this->adminUser->createToken('test-admin-dashboard')->plainTextToken;

        $this->touristUser = User::where('email', 'tranhoangviet@gmail.com')->firstOrFail();
        $this->touristToken = $this->touristUser->createToken('test-tourist-dashboard')->plainTextToken;

        $providerUser = User::where('email', 'tranhoangviet.provider@gmail.com')->firstOrFail();
        $this->providerProfile = ProviderProfile::where('user_id', $providerUser->id)->firstOrFail();
        $this->providerProfile->update(['status' => ProviderStatus::Approved->value]);

        $this->service = Service::create([
            'provider_id' => $this->providerProfile->id,
            'name' => 'Tour Đối Soát '.uniqid(),
            'slug' => 'tour-doi-soat-'.uniqid(),
            'type' => 'tour',
            'status' => ServiceStatus::Active->value,
            'base_price' => 1000000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Mô tả tour.',
        ]);
    }

    public function test_admin_dashboard_returns_live_kpis_and_recent_items(): void
    {
        $booking = Booking::create([
            'booking_code' => 'STB'.strtoupper(uniqid()),
            'qr_checkin_token' => bin2hex(random_bytes(16)),
            'user_id' => $this->touristUser->id,
            'service_id' => $this->service->id,
            'provider_id' => $this->providerProfile->id,
            'check_in_date' => now()->addDays(2)->toDateString(),
            'num_adults' => 2,
            'num_children' => 0,
            'unit_price' => 1000000,
            'subtotal' => 2000000,
            'discount_amount' => 0,
            'total_amount' => 2000000,
            'status' => 'confirmed',
            'contact_name' => 'Trần Hoàng Việt',
            'contact_phone' => '0905888999',
            'contact_email' => 'tranhoangviet@gmail.com',
        ]);

        $res = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/dashboard');

        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'kpis' => [
                        'pending_providers_count',
                        'pending_services_count',
                        'active_services_count',
                        'total_users_count',
                        'total_bookings_count',
                        'total_gmv',
                        'total_posts_count',
                    ],
                    'service_breakdown' => ['tour', 'hotel', 'homestay', 'vehicle'],
                    'charts' => [
                        'gmv' => ['total', 'previous_total', 'growth_percent', 'series'],
                        'bookings' => ['total', 'previous_total', 'growth_percent', 'series'],
                        'users' => ['total', 'previous_total', 'growth_percent', 'series'],
                        'posts' => ['total', 'previous_total', 'growth_percent', 'series'],
                    ],
                    'recent_pending_providers',
                    'recent_pending_services',
                    'recent_bookings',
                ],
            ]);

        $this->assertGreaterThanOrEqual(2000000, $res->json('data.kpis.total_gmv'));
        $this->assertNotEmpty($res->json('data.recent_bookings'));
        $this->assertSame($booking->booking_code, $res->json('data.recent_bookings.0.booking_code'));

        // Kiểm tra endpoint lọc riêng từng biểu đồ theo Ngày/Tháng/Năm
        $chartRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/dashboard/chart?metric=gmv&period=month_days&year='.now()->year.'&month='.now()->month);

        $chartRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.metric', 'gmv')
            ->assertJsonPath('data.period', 'month_days');
    }

    public function test_admin_can_list_and_inspect_booking_payments_and_wallet_transactions(): void
    {
        $code = 'STB'.strtoupper(substr(uniqid(), -8));
        $booking = Booking::create([
            'booking_code' => $code,
            'qr_checkin_token' => bin2hex(random_bytes(16)),
            'user_id' => $this->touristUser->id,
            'service_id' => $this->service->id,
            'provider_id' => $this->providerProfile->id,
            'check_in_date' => now()->addDays(3)->toDateString(),
            'num_adults' => 1,
            'num_children' => 0,
            'unit_price' => 1000000,
            'subtotal' => 1000000,
            'discount_amount' => 0,
            'total_amount' => 1000000,
            'status' => 'completed',
            'contact_name' => 'Khách Đối Soát',
            'contact_phone' => '0909111222',
            'contact_email' => 'khach@gmail.com',
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'sepay',
            'amount' => 300000,
            'currency' => 'VND',
            'transaction_code' => 'SEPAY-'.$code,
            'status' => 'paid',
            'paid_at' => now(),
            'gateway_response' => ['gateway' => 'MBBank', 'ref' => $code],
        ]);

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $this->providerProfile->user_id],
            ['balance' => 0, 'locked_balance' => 0, 'currency' => 'VND']
        );

        WalletTransaction::create([
            'wallet_id' => $wallet->id,
            'type' => 'booking_payment',
            'amount' => 300000,
            'balance_before' => 0,
            'balance_after' => 300000,
            'note' => 'Giải ngân tiền cọc đơn '.$code,
            'reference_id' => $code,
        ]);

        $listRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/bookings?q='.$code);

        $listRes->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.booking_code', $code)
            ->assertJsonPath('data.0.latest_payment.status', 'paid');

        $showRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/bookings/'.$booking->id);

        $showRes->assertStatus(200)
            ->assertJsonCount(1, 'data.payments')
            ->assertJsonCount(1, 'data.wallet_transactions')
            ->assertJsonPath('data.wallet_transactions.0.amount', 300000);

        $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->getJson('/api/v1/admin/dashboard')
            ->assertStatus(403);
    }
}
