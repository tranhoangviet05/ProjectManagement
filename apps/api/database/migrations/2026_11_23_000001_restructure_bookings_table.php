<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Cho phép user_id NULL (hỗ trợ đặt chỗ không cần đăng nhập)
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL');
            DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check');
        }

        // 2. Xóa các cột dư thừa & đổi tên cột tổng quát cho cả 4 loại hình dịch vụ
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'affiliate_post_id')) {
                $table->dropForeign(['affiliate_post_id']);
                $table->dropColumn('affiliate_post_id');
            }
            if (Schema::hasColumn('bookings', 'num_adults')) {
                $table->dropColumn('num_adults');
            }
            if (Schema::hasColumn('bookings', 'num_children')) {
                $table->dropColumn('num_children');
            }
            if (Schema::hasColumn('bookings', 'coupon_code')) {
                $table->dropColumn('coupon_code');
            }
        });

        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'check_in_date')) {
                $table->renameColumn('check_in_date', 'start_date');
            }
            if (Schema::hasColumn('bookings', 'check_out_date')) {
                $table->renameColumn('check_out_date', 'end_date');
            }
            if (Schema::hasColumn('bookings', 'discount_amount')) {
                $table->renameColumn('discount_amount', 'coupon_discount_amount');
            }
        });

        // 3. Bổ sung các cột mới: service_promotion_id, quantity, duration_units, 2 loại giảm giá, cọc 0%/30%/100%, giữ chỗ 10p, metadata
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('service_promotion_id')
                ->nullable()
                ->after('room_type_id')
                ->constrained('service_promotions')
                ->nullOnDelete();

            $table->unsignedInteger('quantity')->default(1)->after('end_date');
            $table->unsignedInteger('duration_units')->default(1)->after('quantity');

            $table->decimal('promotion_discount_amount', 15, 2)->default(0.00)->after('subtotal');
            $table->unsignedTinyInteger('deposit_rate')->default(100)->after('total_amount');
            $table->decimal('deposit_amount', 15, 2)->default(0.00)->after('deposit_rate');
            $table->decimal('remaining_amount', 15, 2)->default(0.00)->after('deposit_amount');

            $table->jsonb('metadata')->nullable()->after('special_requests');
            $table->timestamp('payment_expires_at')->nullable()->after('status');

            $table->index(['status', 'payment_expires_at'], 'bookings_status_payment_expires_idx');
        });

        // 4. Chuẩn hóa vòng đời trạng thái toàn sàn trên PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::table('bookings')->where('status', 'pending')->update(['status' => 'pending_payment']);
            DB::table('bookings')->where('status', 'paid')->update(['status' => 'confirmed']);
            DB::table('bookings')->where('status', 'ongoing')->update(['status' => 'checked_in']);

            DB::statement("ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending_payment'");
            DB::statement("ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending_payment', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded'))");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check');
        }

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('bookings_status_payment_expires_idx');
            $table->dropForeign(['service_promotion_id']);
            $table->dropColumn([
                'service_promotion_id',
                'quantity',
                'duration_units',
                'promotion_discount_amount',
                'deposit_rate',
                'deposit_amount',
                'remaining_amount',
                'metadata',
                'payment_expires_at',
            ]);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->renameColumn('start_date', 'check_in_date');
            $table->renameColumn('end_date', 'check_out_date');
            $table->renameColumn('coupon_discount_amount', 'discount_amount');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('affiliate_post_id')->nullable()->constrained('posts')->nullOnDelete();
            $table->unsignedInteger('num_adults')->default(1);
            $table->unsignedInteger('num_children')->default(0);
            $table->string('coupon_code', 50)->nullable();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::table('bookings')->where('status', 'pending_payment')->update(['status' => 'pending']);
            DB::table('bookings')->where('status', 'checked_in')->update(['status' => 'ongoing']);
            DB::table('bookings')->where('status', 'refunded')->update(['status' => 'cancelled']);
            DB::statement("ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending'");
            DB::statement("ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending', 'paid', 'confirmed', 'ongoing', 'completed', 'cancelled'))");
        }
    }
};
