<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AmenitySeeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ServiceInclusionSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminAmenitiesInclusionsTest extends TestCase
{
    use DatabaseTransactions;

    private string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->seed(AmenitySeeder::class);
        $this->seed(ServiceInclusionSeeder::class);

        $admin = User::where('email', 'admin@gmail.com')->firstOrFail();
        $this->adminToken = $admin->createToken('test-admin')->plainTextToken;
    }

    public function test_admin_can_crud_amenities_and_public_filters_by_scope_and_type(): void
    {
        $suffix = substr(uniqid(), -6);

        $createRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/amenities', [
                'name' => 'Hồ bơi nước mặn '.$suffix,
                'scope' => 'service',
                'applicable_types' => ['hotel', 'homestay'],
                'icon' => 'waves',
                'description' => 'Hồ bơi ngoài trời lọc nước mặn.',
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.scope', 'service')
            ->assertJsonPath('data.icon', 'waves');

        $amenityId = $createRes->json('data.id');

        // Public API lọc đúng theo scope & type
        $hotelRes = $this->getJson('/api/v1/public/amenities?scope=service&type=hotel');
        $hotelRes->assertStatus(200);
        $this->assertTrue(collect($hotelRes->json('data'))->pluck('id')->contains($amenityId));

        $tourRes = $this->getJson('/api/v1/public/amenities?scope=service&type=tour');
        $tourRes->assertStatus(200);
        $this->assertFalse(collect($tourRes->json('data'))->pluck('id')->contains($amenityId));

        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->putJson('/api/v1/admin/amenities/'.$amenityId, [
                'name' => 'Hồ bơi nước mặn nâng cấp '.$suffix,
                'scope' => 'service',
                'applicable_types' => ['hotel'],
                'icon' => 'sparkles',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.icon', 'sparkles');

        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/amenities/'.$amenityId)
            ->assertStatus(200);
    }

    public function test_admin_can_crud_service_inclusions_and_public_filters_by_kind_and_type(): void
    {
        $suffix = substr(uniqid(), -6);

        $createRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/inclusions', [
                'name' => 'Vé cáp treo khứ hồi '.$suffix,
                'kind' => 'include',
                'applicable_types' => ['tour'],
            ]);

        $createRes->assertStatus(201)->assertJsonPath('data.kind', 'include');
        $inclusionId = $createRes->json('data.id');

        $tourIncRes = $this->getJson('/api/v1/public/inclusions?kind=include&type=tour');
        $tourIncRes->assertStatus(200);
        $this->assertTrue(collect($tourIncRes->json('data'))->pluck('id')->contains($inclusionId));

        $vehicleIncRes = $this->getJson('/api/v1/public/inclusions?kind=include&type=vehicle');
        $vehicleIncRes->assertStatus(200);
        $this->assertFalse(collect($vehicleIncRes->json('data'))->pluck('id')->contains($inclusionId));

        $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson('/api/v1/admin/inclusions/'.$inclusionId)
            ->assertStatus(200);
    }
}
