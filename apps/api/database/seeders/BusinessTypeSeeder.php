<?php

namespace Database\Seeders;

use App\Models\BusinessType;
use Illuminate\Database\Seeder;

class BusinessTypeSeeder extends Seeder
{
    /**
     * Dữ liệu khởi tạo cho các loại hình doanh nghiệp đối tác (Provider).
     */
    public function run(): void
    {
        // Chuyển đổi bản ghi cũ 'homestay-villa' sang 'homestay' để giữ nguyên khóa ngoại nếu đã dùng
        BusinessType::where('slug', 'homestay-villa')->update([
            'type' => 'Chỗ ở',
            'name' => 'Homestay',
            'slug' => 'homestay',
        ]);

        $types = [
            // Nhóm: Chỗ ở (Khách sạn & Homestay: phòng/đêm | Villa & Resort: đêm)
            [
                'type' => 'Chỗ ở',
                'name' => 'Khách sạn',
                'slug' => 'khach-san',
            ],
            [
                'type' => 'Chỗ ở',
                'name' => 'Homestay',
                'slug' => 'homestay',
            ],
            [
                'type' => 'Chỗ ở',
                'name' => 'Villa',
                'slug' => 'villa',
            ],
            [
                'type' => 'Chỗ ở',
                'name' => 'Resort',
                'slug' => 'resort',
            ],

            // Nhóm: Giải trí
            [
                'type' => 'Giải trí',
                'name' => 'Tour du lịch & Trải nghiệm',
                'slug' => 'tour-du-lich-trai-nghiem',
            ],

            // Nhóm: Phương tiện
            [
                'type' => 'Phương tiện',
                'name' => 'Phương tiện di chuyển',
                'slug' => 'phuong-tien-di-chuyen',
            ],
            [
                'type' => 'Phương tiện',
                'name' => 'Vé tàu',
                'slug' => 've-tau',
            ],

            // Nhóm: Ăn uống
            [
                'type' => 'Ăn uống',
                'name' => 'Nhà hàng & Ẩm thực',
                'slug' => 'nha-hang-am-thuc',
            ],
        ];

        foreach ($types as $item) {
            BusinessType::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'type' => $item['type'],
                    'name' => $item['name'],
                ]
            );
        }
    }
}
