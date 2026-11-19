<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\TouristProfile;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TouristProfileTest extends TestCase
{
    protected User $touristUser;

    protected string $touristToken;

    protected TouristProfile $touristProfile;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        /** @var User $tourist */
        $tourist = User::updateOrCreate(
            ['email' => 'tourist.profile.test@gmail.com'],
            [
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Tourist->value,
                'status' => 'active',
                'social_active' => true,
            ]
        );
        $this->touristUser = $tourist;
        $this->touristToken = $tourist->createToken('test-tourist-token')->plainTextToken;

        $this->touristProfile = TouristProfile::updateOrCreate(
            ['user_id' => $tourist->id],
            [
                'name' => 'Nguyễn Văn Du Khách',
                'phone_number' => '0905123456',
                'gender' => 'male',
                'date_of_birth' => '1999-05-15',
            ]
        );
    }

    public function test_tourist_can_get_profile(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->getJson('/api/v1/tourist/profile');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $this->touristProfile->id,
                    'user_id' => $this->touristUser->id,
                    'email' => 'tourist.profile.test@gmail.com',
                    'name' => 'Nguyễn Văn Du Khách',
                    'phone_number' => '0905123456',
                    'gender' => 'male',
                    'date_of_birth' => '1999-05-15',
                    'role' => 'tourist',
                ],
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'user_id',
                    'email',
                    'name',
                    'phone_number',
                    'gender',
                    'date_of_birth',
                    'avatar_url',
                    'role',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $data = $response->json('data');
        $this->assertArrayNotHasKey('nationality', $data);
        $this->assertArrayNotHasKey('id_card_number', $data);

        $serializedModel = $this->touristProfile->fresh()->toArray();
        $this->assertArrayNotHasKey('nationality', $serializedModel);
        $this->assertArrayNotHasKey('id_card_number', $serializedModel);
    }

    public function test_tourist_without_existing_profile_can_get_and_update_profile(): void
    {
        /** @var User $freshTourist */
        $freshTourist = User::updateOrCreate(
            ['email' => 'fresh.tourist.profile.test@gmail.com'],
            [
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Tourist->value,
                'status' => 'active',
                'social_active' => false,
            ]
        );
        TouristProfile::where('user_id', $freshTourist->id)->delete();
        $freshToken = $freshTourist->createToken('test-fresh-tourist')->plainTextToken;

        $getResponse = $this->withHeader('Authorization', 'Bearer '.$freshToken)
            ->getJson('/api/v1/tourist/profile');

        $getResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user_id' => $freshTourist->id,
                    'email' => 'fresh.tourist.profile.test@gmail.com',
                    'role' => 'tourist',
                ],
            ]);

        $getData = $getResponse->json('data');
        $this->assertArrayNotHasKey('nationality', $getData);
        $this->assertArrayNotHasKey('id_card_number', $getData);

        $putResponse = $this->withHeader('Authorization', 'Bearer '.$freshToken)
            ->putJson('/api/v1/tourist/profile', [
                'name' => 'Du Khách Mới Tạo',
                'phone_number' => '0387654321',
                'gender' => 'other',
                'date_of_birth' => '2001-11-20',
            ]);

        $putResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user_id' => $freshTourist->id,
                    'name' => 'Du Khách Mới Tạo',
                    'phone_number' => '0387654321',
                    'gender' => 'other',
                    'date_of_birth' => '2001-11-20',
                ],
            ]);

        $this->assertDatabaseHas('tourist_profiles', [
            'user_id' => $freshTourist->id,
            'name' => 'Du Khách Mới Tạo',
            'phone_number' => '0387654321',
            'gender' => 'other',
        ]);
    }

    public function test_tourist_can_update_profile_with_valid_vietnamese_phone(): void
    {
        $payload = [
            'name' => 'Trần Thị Minh Thư',
            'phone_number' => '0912345678',
            'gender' => 'female',
            'date_of_birth' => '1998-08-20',
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->putJson('/api/v1/tourist/profile', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Cập nhật hồ sơ cá nhân thành công.',
                'data' => [
                    'user_id' => $this->touristUser->id,
                    'name' => 'Trần Thị Minh Thư',
                    'phone_number' => '0912345678',
                    'gender' => 'female',
                    'date_of_birth' => '1998-08-20',
                    'role' => 'tourist',
                ],
            ]);

        $data = $response->json('data');
        $this->assertArrayNotHasKey('nationality', $data);
        $this->assertArrayNotHasKey('id_card_number', $data);

        $this->assertDatabaseHas('tourist_profiles', [
            'user_id' => $this->touristUser->id,
            'name' => 'Trần Thị Minh Thư',
            'phone_number' => '0912345678',
            'gender' => 'female',
        ]);
    }

    public function test_tourist_update_profile_fails_with_invalid_data(): void
    {
        // 1. Thiếu toàn bộ các trường bắt buộc
        $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->putJson('/api/v1/tourist/profile', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'phone_number', 'gender', 'date_of_birth']);

        // 2. Các định dạng số điện thoại VN không hợp lệ (sai đầu số, thiếu số, thừa số, không phải số)
        $invalidPhones = ['0123456789', '090512345', '09051234567', '84905123456', 'invalidphone'];
        foreach ($invalidPhones as $invalidPhone) {
            $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
                ->putJson('/api/v1/tourist/profile', [
                    'name' => 'Nguyễn Văn A',
                    'phone_number' => $invalidPhone,
                    'gender' => 'male',
                    'date_of_birth' => '1998-08-20',
                ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['phone_number']);
        }

        // 3. Giới tính không hợp lệ
        $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->putJson('/api/v1/tourist/profile', [
                'name' => 'Nguyễn Văn A',
                'phone_number' => '0905123456',
                'gender' => 'unknown',
                'date_of_birth' => '1998-08-20',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['gender']);

        // 4. Ngày sinh ở tương lai hoặc sai định dạng
        $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->putJson('/api/v1/tourist/profile', [
                'name' => 'Nguyễn Văn A',
                'phone_number' => '0905123456',
                'gender' => 'male',
                'date_of_birth' => now()->addDay()->format('Y-m-d'),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['date_of_birth']);

        $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->putJson('/api/v1/tourist/profile', [
                'name' => 'Nguyễn Văn A',
                'phone_number' => '0905123456',
                'gender' => 'male',
                'date_of_birth' => 'not-a-valid-date',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['date_of_birth']);
    }

    public function test_unauthenticated_and_non_tourist_roles_are_rejected(): void
    {
        // Chưa đăng nhập -> 401
        $this->getJson('/api/v1/tourist/profile')
            ->assertStatus(401);

        $this->putJson('/api/v1/tourist/profile', [
            'name' => 'Test',
            'phone_number' => '0905123456',
            'gender' => 'male',
            'date_of_birth' => '1999-05-15',
        ])->assertStatus(401);

        // Sai role (provider) -> 403
        /** @var User $provider */
        $provider = User::updateOrCreate(
            ['email' => 'provider.forbidden.tourist.test@gmail.com'],
            [
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Provider->value,
                'status' => 'active',
                'social_active' => false,
            ]
        );
        $providerToken = $provider->createToken('test-provider-forbidden')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$providerToken)
            ->getJson('/api/v1/tourist/profile')
            ->assertStatus(403);

        $this->withHeader('Authorization', 'Bearer '.$providerToken)
            ->putJson('/api/v1/tourist/profile', [
                'name' => 'Test',
                'phone_number' => '0905123456',
                'gender' => 'male',
                'date_of_birth' => '1999-05-15',
            ])->assertStatus(403);
    }

    public function test_auth_me_does_not_expose_deprecated_tourist_fields(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'tourist_profile' => [
                        'id',
                        'name',
                        'phone_number',
                        'gender',
                        'date_of_birth',
                    ],
                ],
            ]);

        $touristProfilePayload = $response->json('data.tourist_profile');
        $this->assertArrayNotHasKey('nationality', $touristProfilePayload);
        $this->assertArrayNotHasKey('id_card_number', $touristProfilePayload);
    }
}
