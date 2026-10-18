<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Hồ sơ Khách du lịch (Thông tin thật dùng cho booking)
        Schema::create('tourist_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->unique();
            $table->string('name', 255)->nullable();
            $table->string('phone_number', 20)->nullable();
            $table->string('gender', 20)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('nationality', 100)->nullable();
            $table->string('id_card_number', 30)->nullable(); // CCCD / Hộ chiếu
            $table->timestamps();
        });

        // 2. Hồ sơ Nhà cung cấp dịch vụ (Doanh nghiệp / Hộ kinh doanh)
        Schema::create('provider_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->unique();
            $table->string('business_name', 255);
            $table->string('business_type', 100)->nullable(); // Công ty du lịch, Khách sạn, Homestay...
            $table->text('address')->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_profiles');
        Schema::dropIfExists('tourist_profiles');
    }
};
