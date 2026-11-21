<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\ContentReport;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminContentModerationTest extends TestCase
{
    public function test_unauthenticated_and_non_admin_are_rejected(): void
    {
        $this->getJson('/api/v1/admin/reports')->assertStatus(401);

        $tourist = User::updateOrCreate(
            ['email' => 'tourist.moderation.test@gmail.com'],
            [
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Tourist->value,
                'status' => 'active',
            ]
        );
        $token = $tourist->createToken('tourist')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/reports')
            ->assertStatus(403);
    }

    public function test_admin_can_list_hide_content_and_dismiss_reports(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin.moderation.test@gmail.com'],
            [
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Admin->value,
                'status' => 'active',
            ]
        );
        $reporter = User::updateOrCreate(
            ['email' => 'reporter.moderation.test@gmail.com'],
            [
                'password' => Hash::make('Password@123'),
                'role' => UserRole::Tourist->value,
                'status' => 'active',
            ]
        );

        $report1 = ContentReport::create([
            'reporter_id' => $reporter->id,
            'target_type' => 'post',
            'target_id' => 101,
            'reason' => 'Spam quảng cáo',
            'status' => 'pending',
        ]);

        $report2 = ContentReport::create([
            'reporter_id' => $reporter->id,
            'target_type' => 'comment',
            'target_id' => 202,
            'reason' => 'Ngôn từ không phù hợp',
            'status' => 'pending',
        ]);

        $token = $admin->createToken('admin')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/reports?status=pending')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/v1/admin/reports/{$report1->id}/hide-content", [
                'admin_note' => 'Vi phạm tiêu chuẩn cộng đồng',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'resolved_hidden');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/v1/admin/reports/{$report2->id}/dismiss", [
                'admin_note' => 'Không đủ cơ sở vi phạm',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'dismissed');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/reports/999999')
            ->assertStatus(404);
    }
}
