<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'firebase_uid')) {
                $table->string('firebase_uid', 255)->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('users', 'avatar_url')) {
                $table->text('avatar_url')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role', 20)->default('tourist')->after('avatar_url');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status', 20)->default('active')->after('role');
            }
            if (!Schema::hasColumn('users', 'social_active')) {
                $table->boolean('social_active')->default(false)->after('status');
            }
            $table->string('password')->nullable()->change();

            $table->index('role');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['status']);
            $table->dropColumn(['firebase_uid', 'avatar_url', 'role', 'status', 'social_active']);
        });
    }
};
