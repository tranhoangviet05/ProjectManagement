<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    public function test_middleware_sanitizes_input_and_logs_in_admin(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => '  ADMIN@GMAIL.COM  ',
            'password' => 'Admin@123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.role', 'admin')
            ->assertJsonPath('data.email', 'admin@gmail.com');

        $token = $response->json('token');
        $this->assertNotEmpty($token);

        // Kiểm tra route /api/v1/auth/me với Bearer Token
        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.role', 'admin');
    }

    public function test_role_middleware_blocks_tourist_from_admin_routes(): void
    {
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'tranhoangviet@gmail.com',
            'password' => 'Tranhoangviet@2005',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonPath('data.role', 'tourist');

        $touristToken = $loginResponse->json('token');

        // Tourist truy cập /api/v1/tourist/ping -> 200 OK
        $this->withHeader('Authorization', 'Bearer ' . $touristToken)
            ->getJson('/api/v1/tourist/ping')
            ->assertStatus(200);

        // Tourist cố truy cập /api/v1/admin/ping -> 403 Forbidden bởi CheckRoleMiddleware
        $this->withHeader('Authorization', 'Bearer ' . $touristToken)
            ->getJson('/api/v1/admin/ping')
            ->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_provider_login_returns_business_profile_and_wallet(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'tranhoangviet.provider@gmail.com',
            'password' => 'Tranhoangviet@2005',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.role', 'provider')
            ->assertJsonPath('data.provider_profile.business_name', 'Đà Nẵng Ocean Travel & Retreat');
    }
}
