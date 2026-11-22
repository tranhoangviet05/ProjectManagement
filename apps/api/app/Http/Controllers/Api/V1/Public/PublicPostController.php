<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicPostController extends Controller
{
    /**
     * GET /api/v1/public/posts/featured
     * Lấy danh sách bài viết cộng đồng nổi bật (công khai & không bị ẩn) cho Trang chủ & Tab Khám phá.
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->query('limit', 12), 1), 30);

        $posts = Post::query()
            ->where('visibility', 'public')
            ->where('is_hidden', false)
            ->with([
                'user:id,email,role',
                'user.socialProfile:id,user_id,username,display_name,avatar_url',
                'user.touristProfile:id,user_id,name',
                'user.providerProfile:id,user_id,business_name',
                'media',
                'service:id,name,type,base_price,price_unit',
            ])
            ->orderByDesc('is_pinned')
            ->orderByDesc('likes_count')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(function (Post $post) {
                $firstMedia = $post->media->first();
                $username = $post->user?->socialProfile?->username
                    ?? explode('@', $post->user?->email ?? 'traveler')[0];

                return [
                    'id' => $post->id,
                    'content' => $post->content,
                    'location_name' => $post->location_name,
                    'likes_count' => (int) $post->likes_count,
                    'comments_count' => (int) $post->comments_count,
                    'shares_count' => (int) $post->shares_count,
                    'created_at' => $post->created_at,
                    'has_media' => $post->media->isNotEmpty(),
                    'cover_media' => $firstMedia ? [
                        'id' => $firstMedia->id,
                        'url' => $firstMedia->url,
                        'type' => $firstMedia->type ?? 'image',
                    ] : null,
                    'media' => $post->media->map(fn ($m) => [
                        'id' => $m->id,
                        'url' => $m->url,
                        'type' => $m->type ?? 'image',
                    ])->values(),
                    'author' => [
                        'id' => $post->user?->id,
                        'name' => $post->user?->display_name ?? 'Du khách',
                        'username' => $username,
                        'avatar_url' => $post->user?->avatar_url,
                    ],
                    'service' => $post->service ? [
                        'id' => $post->service->id,
                        'name' => $post->service->name,
                        'type' => $post->service->type,
                        'base_price' => (float) $post->service->base_price,
                        'price_unit' => $post->service->price_unit,
                    ] : null,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $posts,
        ]);
    }
}
