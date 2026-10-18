<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Địa điểm du lịch (Locations)
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->foreignId('parent_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->text('image_url')->nullable();
            $table->string('country_code', 10)->default('VN');
            $table->text('description')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->timestamps();

            $table->index('is_popular');
        });

        // 2. Danh mục dịch vụ (Categories)
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->string('icon', 100)->nullable();
            $table->text('icon_url')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
        Schema::dropIfExists('locations');
    }
};
