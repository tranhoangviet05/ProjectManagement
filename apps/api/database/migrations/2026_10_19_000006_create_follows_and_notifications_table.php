<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mối quan hệ theo dõi (Follows)
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('following_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['follower_id', 'following_id']);
            $table->index('following_id');
        });

        // 2. Thông báo mạng xã hội (Social Notifications - tương thích Reverb Realtime)
        Schema::create('social_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Người nhận thông báo
            $table->foreignId('actor_id')->constrained('users')->cascadeOnDelete(); // Người tạo hành động
            $table->string('type', 50); // like_post, comment_post, reply_comment, follow_user, affiliate_booking
            $table->foreignId('post_id')->nullable()->constrained('posts')->cascadeOnDelete();
            $table->foreignId('comment_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->json('data')->nullable(); // Dữ liệu bổ sung: preview text, custom message
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_read', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_notifications');
        Schema::dropIfExists('follows');
    }
};
