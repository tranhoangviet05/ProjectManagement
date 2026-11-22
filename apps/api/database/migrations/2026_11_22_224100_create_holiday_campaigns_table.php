<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holiday_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('badge_text', 80)->nullable();
            $table->string('banner_url', 1000)->nullable();
            $table->text('description')->nullable();
            $table->string('discount_type', 20)->default('percent'); // percent | fixed
            $table->decimal('discount_value', 12, 2)->default(0);
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->integer('priority')->default(0);
            $table->string('status', 20)->default('draft')->index(); // draft | active | ended
            $table->timestamps();

            $table->index(['status', 'starts_at', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holiday_campaigns');
    }
};
