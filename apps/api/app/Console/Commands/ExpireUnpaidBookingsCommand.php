<?php

namespace App\Console\Commands;

use App\Services\BookingService;
use Illuminate\Console\Command;

class ExpireUnpaidBookingsCommand extends Command
{
    protected $signature = 'bookings:expire-unpaid';

    protected $description = 'Tự động hủy các đơn chờ thanh toán quá 10 phút và hoàn trả lại slot trống';

    public function handle(BookingService $bookingService): int
    {
        $expiredCount = $bookingService->expireStaleHolds();
        $this->info("Đã tự động hủy {$expiredCount} đơn quá hạn thanh toán.");

        return self::SUCCESS;
    }
}
