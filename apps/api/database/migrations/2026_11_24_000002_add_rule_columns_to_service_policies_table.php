<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_policies', function (Blueprint $table) {
            if (! Schema::hasColumn('service_policies', 'rule_key')) {
                $table->string('rule_key', 60)->nullable()->index()->after('category');
            }
            if (! Schema::hasColumn('service_policies', 'rule_config')) {
                $table->json('rule_config')->nullable()->after('rule_key');
            }
        });
    }

    public function down(): void
    {
        Schema::table('service_policies', function (Blueprint $table) {
            if (Schema::hasColumn('service_policies', 'rule_config')) {
                $table->dropColumn('rule_config');
            }
            if (Schema::hasColumn('service_policies', 'rule_key')) {
                $table->dropIndex(['rule_key']);
                $table->dropColumn('rule_key');
            }
        });
    }
};
