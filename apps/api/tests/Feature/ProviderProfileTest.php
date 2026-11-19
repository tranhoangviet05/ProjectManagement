<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Enums\UserRole;
use App\Models\BusinessType;
use App\Models\ProviderProfile;
use App\Models\User;
use App\Models\Wallet;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProviderProfileTest extends TestCase
{
    protected User $providerUser;

    protected string $providerToken;

    protected ProviderProfile $providerProfile;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        /** @var User $provider */
        $provider = User::updateOrCreate(
            ['email' => 'provider.profile.test@gmail.com'],
            [
                'name' => 'Provider Test Profile',
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Provider->value,
                'status' => 'active',
                'social_active' => true,
            ]
        );
        $this->providerUser = $provider;
        $this->providerToken = $provider->createToken('test-provider-token')->plainTextToken;

        // Reset ví của test user để đảm bảo trạng thái độc lập
        Wallet::where('user_id', $provider->id)->delete();

        $businessType = BusinessType::first();

        $this->providerProfile = ProviderProfile::updateOrCreate(
            ['user_id' => $provider->id],
            [
                'business_name' => 'Công ty Du lịch Test',
                'representative_name' => 'Nguyễn Văn Test',
                'business_type_id' => $businessType?->id,
                'phone' => '0905123456',
                'address' => '123 Đường Test, Đà Nẵng',
                'description' => 'Mô tả test cơ sở du lịch',
                'status' => ProviderStatus::Approved->value,
            ]
        );
    }

    public function test_provider_can_get_profile(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->getJson('/api/v1/provider/profile');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user_id' => $this->providerUser->id,
                    'email' => 'provider.profile.test@gmail.com',
                    'business_name' => 'Công ty Du lịch Test',
                    'representative_name' => 'Nguyễn Văn Test',
                    'phone' => '0905123456',
                    'address' => '123 Đường Test, Đà Nẵng',
                    'wallet' => [
                        'is_activated' => false,
                        'balance' => '0.00',
                        'locked_balance' => '0.00',
                        'currency' => 'VND',
                    ],
                ],
            ]);
    }

    public function test_provider_can_update_profile(): void
    {
        $updatePayload = [
            'business_name' => 'Công ty Du lịch Test Đã Cập Nhật',
            'representative_name' => 'Trần Văn Mới',
            'phone' => '0912345678',
            'address' => '456 Đường Mới, Sơn Trà, Đà Nẵng',
            'description' => 'Mô tả mới đã được cập nhật thành công.',
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->putJson('/api/v1/provider/profile', $updatePayload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Cập nhật hồ sơ nhà cung cấp thành công.',
                'data' => [
                    'business_name' => 'Công ty Du lịch Test Đã Cập Nhật',
                    'representative_name' => 'Trần Văn Mới',
                    'phone' => '0912345678',
                    'address' => '456 Đường Mới, Sơn Trà, Đà Nẵng',
                ],
            ]);

        $this->assertDatabaseHas('provider_profiles', [
            'user_id' => $this->providerUser->id,
            'business_name' => 'Công ty Du lịch Test Đã Cập Nhật',
            'phone' => '0912345678',
        ]);
    }

    public function test_provider_can_activate_wallet(): void
    {
        // Ban đầu chưa có ví
        Wallet::where('user_id', $this->providerUser->id)->delete();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->postJson('/api/v1/provider/wallet/activate');

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Kích hoạt Ví Travel thành công.',
                'data' => [
                    'balance' => '0.00',
                    'locked_balance' => '0.00',
                    'currency' => 'VND',
                ],
            ]);

        $this->assertDatabaseHas('wallets', [
            'user_id' => $this->providerUser->id,
            'currency' => 'VND',
        ]);

        // Kích hoạt lại lần 2 -> vẫn thành công và trả về ví hiện có
        $responseSecond = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->postJson('/api/v1/provider/wallet/activate');

        $responseSecond->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_user_can_change_password(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->postJson('/api/v1/auth/change-password', [
                'current_password' => 'Password@123',
                'new_password' => 'NewSecret@2026',
                'new_password_confirmation' => 'NewSecret@2026',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Đổi mật khẩu thành công. Vui lòng ghi nhớ mật khẩu mới của bạn.',
            ]);

        $this->providerUser->refresh();
        $this->assertTrue(Hash::check('NewSecret@2026', $this->providerUser->password));
    }

    public function test_user_cannot_change_password_with_incorrect_current_password(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->postJson('/api/v1/auth/change-password', [
                'current_password' => 'WrongCurrentPassword',
                'new_password' => 'NewSecret@2026',
                'new_password_confirmation' => 'NewSecret@2026',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_user_can_upload_avatar(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('avatar.png', 100, 'image/png');

        $response = $this->withHeader('Authorization', 'Bearer '.$this->providerToken)
            ->postJson('/api/v1/auth/avatar', [
                'avatar' => $file,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Tải lên ảnh đại diện thành công.',
            ])
            ->assertJsonStructure([
                'data' => ['avatar_url'],
            ]);

        $this->providerProfile->refresh();
        $this->assertNotNull($this->providerProfile->avatar_url);
    }
}
