<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Hồ sơ khách du lịch (dùng cho booking, bảo hiểm).
     */
    public function touristProfile(): HasOne
    {
        return $this->hasOne(TouristProfile::class);
    }

    /**
     * Hồ sơ nhà cung cấp dịch vụ (tour, khách sạn).
     */
    public function providerProfile(): HasOne
    {
        return $this->hasOne(ProviderProfile::class);
    }

    /**
     * Danh sách đơn đặt chỗ của người dùng.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class)->latest();
    }

    /**
     * Hồ sơ mạng xã hội của người dùng (tách biệt với thông tin booking).
     */
    public function socialProfile(): HasOne
    {
        return $this->hasOne(SocialProfile::class);
    }

    /**
     * Danh sách bài viết do người dùng đăng.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class)->latest();
    }

    /**
     * Các bình luận do người dùng viết.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Danh sách bài viết người dùng đã thả tim.
     */
    public function likedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'likes')->withTimestamps();
    }

    /**
     * Danh sách bài viết người dùng đã lưu (bookmark).
     */
    public function savedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'saved_posts')->withTimestamps();
    }

    /**
     * Những người đang theo dõi người dùng này (Followers).
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')->withTimestamps();
    }

    /**
     * Những người mà người dùng này đang theo dõi (Following).
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')->withTimestamps();
    }

    /**
     * Các thông báo mạng xã hội nhận được.
     */
    public function socialNotifications(): HasMany
    {
        return $this->hasMany(SocialNotification::class)->latest();
    }
}
