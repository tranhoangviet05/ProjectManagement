<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('holiday_campaign_id')->constrained('holiday_campaigns')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('discount_type', 20)->default('percent'); // percent | fixed
            $table->decimal('discount_value', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['holiday_campaign_id', 'service_id'], 'campaign_service_unique');
            $table->index(['is_active', 'holiday_campaign_id'], 'service_promotions_active_campaign_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_promotions');
    }
};
