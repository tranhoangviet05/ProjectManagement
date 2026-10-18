<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mã giảm giá (Coupons)
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->enum('type', ['percent', 'fixed'])->default('percent');
            $table->decimal('discount_value', 15, 2);
            $table->decimal('min_order_amount', 15, 2)->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->unsignedInteger('per_user_limit')->default(1);
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('code');
        });

        // 2. Ví điện tử (Wallets)
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->unique();
            $table->decimal('balance', 15, 2)->default(0.00);
            $table->decimal('locked_balance', 15, 2)->default(0.00); // Số dư tạm khóa chờ quyết toán
            $table->string('currency', 5)->default('VND');
            $table->timestamps();
        });

        // 3. Lịch sử biến động số dư ví (Wallet Transactions)
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->cascadeOnDelete();
            $table->enum('type', ['deposit', 'booking_payment', 'refund', 'commission', 'affiliate_reward', 'withdraw']);
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('note', 255)->nullable();
            $table->string('reference_id', 100)->nullable(); // ID booking hoặc mã SePay
            $table->timestamps();

            $table->index(['wallet_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('coupons');
    }
};
