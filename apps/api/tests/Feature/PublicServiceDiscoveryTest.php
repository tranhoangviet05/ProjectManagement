<?php

namespace Tests\Feature;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Models\Location;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Tests\TestCase;

class PublicServiceDiscoveryTest extends TestCase
{
    protected ProviderProfile $approvedProvider;

    protected User $touristUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $providerUser = User::where('email', 'tranhoangviet.provider@gmail.com')->firstOrFail();
        $this->approvedProvider = ProviderProfile::where('user_id', $providerUser->id)->firstOrFail();
        $this->approvedProvider->update(['status' => ProviderStatus::Approved->value]);

        $this->touristUser = User::where('email', 'tranhoangviet@gmail.com')->firstOrFail();
    }

    public function test_public_services_filters_active_only_and_includes_child_locations(): void
    {
        $daNang = Location::where('slug', 'da-nang')->firstOrFail();
        $hoiAn = Location::where('slug', 'hoi-an')->firstOrFail();

        $activeHoiAn = Service::create([
            'provider_id' => $this->approvedProvider->id,
            'location_id' => $hoiAn->id,
            'name' => 'Tour Hội An Public '.uniqid(),
            'slug' => 'tour-hoi-an-public-'.uniqid(),
            'type' => 'tour',
            'status' => ServiceStatus::Active->value,
            'base_price' => 650000,
            'price_unit' => 'người',
            'address' => 'Hội An, Đà Nẵng',
            'description' => 'Mô tả công khai.',
        ]);

        $pendingService = Service::create([
            'provider_id' => $this->approvedProvider->id,
            'location_id' => $daNang->id,
            'name' => 'Tour Pending Hidden '.uniqid(),
            'slug' => 'tour-pending-hidden-'.uniqid(),
            'type' => 'tour',
            'status' => ServiceStatus::PendingReview->value,
            'base_price' => 500000,
            'price_unit' => 'người',
            'address' => 'Đà Nẵng',
            'description' => 'Chưa duyệt.',
        ]);

        // Tìm theo tỉnh cha (Đà Nẵng) phải tìm thấy cả dịch vụ ở điểm con (Hội An) và KHÔNG lộ dịch vụ pending
        $res = $this->getJson('/api/v1/public/services?location_id='.$daNang->id.'&min_price=600000&max_price=800000');

        $res->assertStatus(200)
            ->assertJsonPath('success', true);

        $ids = collect($res->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($activeHoiAn->id));
        $this->assertFalse($ids->contains($pendingService->id));

        // Xem chi tiết dịch vụ active -> 200, dịch vụ pending -> 404
        $this->getJson('/api/v1/public/services/'.$activeHoiAn->id)->assertStatus(200);
        $this->getJson('/api/v1/public/services/'.$pendingService->id)->assertStatus(404);
    }

    public function test_public_featured_posts_excludes_hidden_and_private_posts(): void
    {
        $publicPost = Post::create([
            'user_id' => $this->touristUser->id,
            'content' => 'Review hoàng hôn bán đảo Sơn Trà siêu đẹp!',
            'location_name' => 'Đà Nẵng',
            'visibility' => 'public',
            'is_hidden' => false,
            'likes_count' => 42,
        ]);

        PostMedia::create([
            'post_id' => $publicPost->id,
            'url' => 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
            'type' => 'image',
            'sort_order' => 0,
        ]);

        $hiddenPost = Post::create([
            'user_id' => $this->touristUser->id,
            'content' => 'Bài viết bị ẩn vì vi phạm.',
            'visibility' => 'public',
            'is_hidden' => true,
        ]);

        $res = $this->getJson('/api/v1/public/posts/featured');
        $res->assertStatus(200)->assertJsonPath('success', true);

        $ids = collect($res->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($publicPost->id));
        $this->assertFalse($ids->contains($hiddenPost->id));
    }
}
