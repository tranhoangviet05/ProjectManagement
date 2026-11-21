<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\ContentReport;
use App\Models\Post;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Tests\TestCase;

class AdminReportModerationTest extends TestCase
{
    protected User $adminUser;

    protected string $adminToken;

    protected User $touristUser;

    protected string $touristToken;

    protected User $providerUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->adminUser = User::where('email', 'admin@gmail.com')->firstOrFail();
        $this->adminToken = $this->adminUser->createToken('test-admin-reports')->plainTextToken;

        $this->touristUser = User::where('email', 'tranhoangviet@gmail.com')->firstOrFail();
        $this->touristToken = $this->touristUser->createToken('test-tourist-reports')->plainTextToken;

        $this->providerUser = User::where('email', 'tranhoangviet.provider@gmail.com')->firstOrFail();
    }

    public function test_admin_can_list_view_and_hide_reported_post(): void
    {
        $post = Post::create([
            'user_id' => $this->touristUser->id,
            'content' => 'Bài viết chứa link quảng cáo lừa đảo.',
            'location_name' => 'Đà Nẵng',
            'visibility' => 'public',
        ]);

        $report = ContentReport::create([
            'reporter_id' => $this->providerUser->id,
            'reportable_type' => 'post',
            'reportable_id' => $post->id,
            'reason' => 'Spam link lừa đảo đặt cọc ngoài sàn.',
            'status' => 'pending',
        ]);

        $listRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/reports?status=pending');

        $listRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('counts.pending', 1);

        $showRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/admin/reports/'.$report->id);

        $showRes->assertStatus(200)
            ->assertJsonPath('data.target.id', $post->id)
            ->assertJsonPath('data.target.is_hidden', false);

        $resolveRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/reports/'.$report->id.'/resolve', [
                'action' => 'hide',
                'resolution_note' => 'Đã xác minh vi phạm quy định cộng đồng.',
            ]);

        $resolveRes->assertStatus(200)
            ->assertJsonPath('data.status', 'resolved_hidden')
            ->assertJsonPath('data.target.is_hidden', true);

        $this->assertTrue($post->fresh()->is_hidden);
    }

    public function test_admin_can_dismiss_reported_comment_and_non_admin_is_forbidden(): void
    {
        $post = Post::create([
            'user_id' => $this->touristUser->id,
            'content' => 'Chia sẻ kinh nghiệm du lịch Hội An.',
            'visibility' => 'public',
        ]);

        $comment = Comment::create([
            'post_id' => $post->id,
            'user_id' => $this->providerUser->id,
            'content' => 'Cảm ơn bài viết rất hữu ích!',
        ]);

        $report = ContentReport::create([
            'reporter_id' => $this->touristUser->id,
            'reportable_type' => 'comment',
            'reportable_id' => $comment->id,
            'reason' => 'Báo cáo nhầm.',
            'status' => 'pending',
        ]);

        $dismissRes = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/admin/reports/'.$report->id.'/resolve', [
                'action' => 'dismiss',
                'resolution_note' => 'Bình luận hợp lệ, không vi phạm.',
            ]);

        $dismissRes->assertStatus(200)
            ->assertJsonPath('data.status', 'dismissed');

        $this->assertFalse($comment->fresh()->is_hidden);

        $this->withHeader('Authorization', 'Bearer '.$this->touristToken)
            ->getJson('/api/v1/admin/reports')
            ->assertStatus(403);
    }
}
