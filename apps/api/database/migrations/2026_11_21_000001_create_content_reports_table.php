<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('posts', 'is_hidden')) {
            Schema::table('posts', function (Blueprint $table) {
                $table->boolean('is_hidden')->default(false)->after('is_pinned');
            });
        }

        if (! Schema::hasColumn('comments', 'is_hidden')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->boolean('is_hidden')->default(false)->after('likes_count');
            });
        }

        Schema::create('content_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('reportable_type', 20); // 'post', 'comment'
            $table->unsignedBigInteger('reportable_id');
            $table->text('reason');
            $table->string('status', 30)->default('pending'); // 'pending', 'resolved_hidden', 'dismissed'
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution_note')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['reportable_type', 'reportable_id']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_reports');

        if (Schema::hasColumn('comments', 'is_hidden')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->dropColumn('is_hidden');
            });
        }

        if (Schema::hasColumn('posts', 'is_hidden')) {
            Schema::table('posts', function (Blueprint $table) {
                $table->dropColumn('is_hidden');
            });
        }
    }
};
