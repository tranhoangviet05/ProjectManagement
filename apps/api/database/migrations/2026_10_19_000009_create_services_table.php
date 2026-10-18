<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Dịch vụ (Tour, Khách sạn, Homestay, Thuê xe)
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('provider_profiles')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['tour', 'hotel', 'homestay', 'vehicle'])->default('tour');
            $table->enum('status', ['draft', 'pending_review', 'active', 'rejected'])->default('draft');
            $table->decimal('base_price', 15, 2);
            $table->string('price_unit', 50)->default('người'); // người, phòng/đêm, ngày, xe
            $table->unsignedInteger('max_guests')->default(1);
            $table->unsignedInteger('duration_days')->default(1);
            $table->unsignedInteger('duration_nights')->default(0);
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->json('amenities')->nullable(); // Tiện ích đi kèm
            $table->json('includes')->nullable();  // Bao gồm
            $table->json('excludes')->nullable();  // Không bao gồm
            $table->decimal('rating_avg', 3, 2)->default(0.00);
            $table->unsignedInteger('total_bookings')->default(0);
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'status']);
            $table->index('provider_id');
            $table->index('location_id');
        });

        // 2. Ảnh & Video dịch vụ
        Schema::create('service_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->text('url');
            $table->enum('type', ['image', 'video'])->default('image');
            $table->boolean('is_cover')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['service_id', 'is_cover']);
        });

        // 3. Lịch trình chi tiết (Dành cho Tour: Ngày 1, Ngày 2...)
        Schema::create('service_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->unsignedInteger('day_number');
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->json('activities')->nullable(); // Các hoạt động trong ngày
            $table->timestamps();

            $table->index(['service_id', 'day_number']);
        });

        // 4. Phân loại phòng khách sạn / homestay (Theo mục 7 của yêu cầu)
        Schema::create('hotel_room_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('name', 255); // VD: Phòng Standard 2 người, Phòng Deluxe 4 người
            $table->string('rank', 100)->default('standard');
            $table->text('description')->nullable();
            $table->decimal('base_price', 15, 2);
            $table->unsignedInteger('total_rooms')->default(1);
            $table->unsignedInteger('inventory')->default(1); // Số phòng còn trống
            $table->unsignedInteger('capacity_adults')->default(2);
            $table->unsignedInteger('capacity_children')->default(0);
            $table->json('amenities')->nullable(); // Điều hòa, nóng lạnh, ban công...
            $table->json('images')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->index('service_id');
        });

        // 5. Quản lý ngày mở bán & chỗ trống theo ngày
        Schema::create('service_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->date('available_date');
            $table->unsignedInteger('total_slots')->default(0);
            $table->unsignedInteger('booked_slots')->default(0);
            $table->decimal('price_override', 15, 2)->nullable(); // Giá theo ngày lễ/tết
            $table->boolean('is_blocked')->default(false);
            $table->timestamps();

            $table->unique(['service_id', 'available_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_availability');
        Schema::dropIfExists('hotel_room_types');
        Schema::dropIfExists('service_schedules');
        Schema::dropIfExists('service_media');
        Schema::dropIfExists('services');
    }
};
