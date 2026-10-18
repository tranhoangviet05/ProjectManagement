<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->unique();
            $table->string('username', 50)->unique();
            $table->string('display_name', 100)->nullable();
            $table->text('bio')->nullable();
            $table->text('avatar_url')->nullable();
            $table->text('cover_photo_url')->nullable();
            $table->string('website_url', 255)->nullable();
            $table->boolean('is_verified')->default(false);
            $table->unsignedInteger('followers_count')->default(0);
            $table->unsignedInteger('following_count')->default(0);
            $table->unsignedInteger('posts_count')->default(0);
            $table->timestamps();

            $table->index('username');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_profiles');
    }
};
