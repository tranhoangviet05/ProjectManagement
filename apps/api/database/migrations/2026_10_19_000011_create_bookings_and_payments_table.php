<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Bảng Đặt chỗ (Bookings) - Đã tối ưu và tinh gọn theo các quyết định kiến trúc
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 20)->unique();      // Mã đơn hiển thị: STB-20261019-XXXX
            $table->string('qr_checkin_token', 64)->unique();  // Token bảo mật dùng render mã QR check-in

            // Khóa ngoại liên kết
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('provider_profiles')->cascadeOnDelete();
            $table->foreignId('room_type_id')->nullable()->constrained('hotel_room_types')->nullOnDelete(); // Phân loại phòng nếu là khách sạn/homestay
            $table->foreignId('coupon_id')->nullable()->constrained('coupons')->nullOnDelete();
            $table->foreignId('affiliate_post_id')->nullable()->constrained('posts')->nullOnDelete(); // Bài viết MXH dẫn đến đơn này

            // Thời gian dịch vụ & Quét mã Check-in
            $table->date('check_in_date');
            $table->date('check_out_date')->nullable();
            $table->timestamp('checked_in_at')->nullable(); // Thời điểm Provider quét mã QR thành công

            // Số lượng khách
            $table->unsignedInteger('num_adults')->default(1);
            $table->unsignedInteger('num_children')->default(0);

            // Chi phí & Giá tiền
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount_amount', 15, 2)->default(0.00);
            $table->string('coupon_code', 50)->nullable();
            $table->decimal('total_amount', 15, 2);

            // Trạng thái đơn booking: pending (chờ TT) -> paid (đã TT) -> ongoing (đã quét QR) -> completed / cancelled
            $table->enum('status', ['pending', 'paid', 'confirmed', 'ongoing', 'completed', 'cancelled'])->default('pending');

            // Thông tin người liên hệ
            $table->string('contact_name', 255);
            $table->string('contact_phone', 20);
            $table->string('contact_email', 255)->nullable();
            $table->text('special_requests')->nullable();

            // Hủy đơn
            $table->text('cancel_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index('booking_code');
            $table->index('qr_checkin_token');
        });

        // 2. Bảng Lịch sử Thanh toán (Payments) - Tách riêng độc lập
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->enum('payment_method', ['sepay', 'momo', 'vnpay', 'wallet', 'banking']);
            $table->decimal('amount', 15, 2);
            $table->string('currency', 5)->default('VND');
            $table->string('transaction_code', 100)->nullable()->index(); // Mã GD ngân hàng / SePay / MoMo
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->json('gateway_response')->nullable(); // Lưu trọn vẹn payload Webhook từ SePay để đối soát
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'status']);
        });

        // 3. Bảng Đánh giá Dịch vụ (Reviews)
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete()->unique();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating')->default(5); // 1 - 5 sao
            $table->text('content')->nullable();
            $table->json('images')->nullable(); // Ảnh đính kèm review
            $table->text('provider_reply')->nullable(); // Phản hồi của Provider
            $table->timestamp('provider_reply_at')->nullable();
            $table->timestamps();

            $table->index(['service_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('bookings');
    }
};
