<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('content')->nullable();
            
            // Địa điểm check-in
            $table->string('location_name', 255)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Link dịch vụ cụ thể trên app (Affiliate marketing)
            $table->unsignedBigInteger('service_id')->nullable();
            $table->string('service_type', 50)->nullable(); // tour, hotel, homestay, vehicle
            $table->string('affiliate_code', 50)->nullable()->index();

            // Quyền riêng tư & Trạng thái
            $table->enum('visibility', ['public', 'followers', 'private'])->default('public');
            $table->boolean('is_pinned')->default(false);

            // Chỉ số tương tác đếm sẵn (Denormalized counters)
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('shares_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('affiliate_clicks_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'created_at']);
            $table->index(['visibility', 'created_at']);
            $table->index('service_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
