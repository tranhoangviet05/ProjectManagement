<?php

use App\Models\ServiceAvailability;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Bảng service_availability chỉ dành cho Giải trí (tour) và Vé tàu
        ServiceAvailability::query()
            ->whereHas('service', function ($q) {
                $q->where('type', '!=', 'tour')
                    ->whereDoesntHave('category', function ($c) {
                        $c->where('slug', 'ilike', '%tau%')
                            ->orWhere('name', 'ilike', '%vé tàu%');
                    });
            })
            ->delete();
    }

    public function down(): void
    {
        // Không khôi phục dữ liệu lịch trống dư thừa của Chỗ ở / Thuê xe
    }
};
