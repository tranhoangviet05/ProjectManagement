<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tourist_profiles', function (Blueprint $table) {
            $table->dropColumn(['nationality', 'id_card_number']);
        });
    }

    public function down(): void
    {
        Schema::table('tourist_profiles', function (Blueprint $table) {
            $table->string('nationality', 100)->nullable();
            $table->string('id_card_number', 30)->nullable();
        });
    }
};
