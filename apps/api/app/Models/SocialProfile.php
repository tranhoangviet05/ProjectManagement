<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'username',
        'display_name',
        'bio',
        'avatar_url',
        'cover_photo_url',
        'website_url',
        'is_verified',
        'followers_count',
        'following_count',
        'posts_count',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'followers_count' => 'integer',
            'following_count' => 'integer',
            'posts_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
