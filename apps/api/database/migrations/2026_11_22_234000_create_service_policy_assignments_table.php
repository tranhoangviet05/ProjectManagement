<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_policy_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->foreignId('service_policy_id')->constrained('service_policies')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['service_id', 'service_policy_id'], 'service_policy_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_policy_assignments');
    }
};
