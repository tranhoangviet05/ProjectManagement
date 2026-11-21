<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Dữ liệu khởi tạo cho các chủ đề / danh mục trải nghiệm của dịch vụ.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Biển đảo & Lặn ngắm san hô',
                'slug' => 'bien-dao-lan-ngam-san-ho',
                'icon' => 'waves',
                'description' => 'Tour và dịch vụ trải nghiệm biển, đảo, lặn ngắm san hô, cano ngắm vịnh.',
            ],
            [
                'name' => 'Trekking, Cắm trại & Săn mây',
                'slug' => 'trekking-cam-trai-san-may',
                'icon' => 'mountain',
                'description' => 'Chinh phục các cung đường trekking, cắm trại glamping và săn mây thiên nhiên.',
            ],
            [
                'name' => 'Food Tour & Ẩm thực đường phố',
                'slug' => 'food-tour-am-thuc-duong-pho',
                'icon' => 'utensils',
                'description' => 'Khám phá văn hóa ẩm thực địa phương, chợ đêm và món ngon truyền thống.',
            ],
            [
                'name' => 'Văn hóa, Lịch sử & Tâm linh',
                'slug' => 'van-hoa-lich-su-tam-linh',
                'icon' => 'landmark',
                'description' => 'Thăm quan di tích lịch sử, phố cổ, đền chùa và làng nghề truyền thống.',
            ],
            [
                'name' => 'Nghỉ dưỡng & Chữa lành',
                'slug' => 'nghi-duong-chua-lanh-wellness',
                'icon' => 'heart-pulse',
                'description' => 'Trải nghiệm suối khoáng nóng onsen, spa, yoga và không gian thanh tịnh.',
            ],
            [
                'name' => 'Khách sạn & Khu nghỉ dưỡng',
                'slug' => 'khach-san-khu-nghi-duong',
                'icon' => 'building-2',
                'description' => 'Lưu trú tại khách sạn 3-5 sao, resort ven biển hoặc trung tâm thành phố.',
            ],
            [
                'name' => 'Homestay, Villa & Bungalow',
                'slug' => 'homestay-villa-bungalow',
                'icon' => 'home',
                'description' => 'Không gian lưu trú riêng tư, gần gũi thiên nhiên dành cho gia đình và nhóm bạn.',
            ],
            [
                'name' => 'Du thuyền & Thể thao nước',
                'slug' => 'du-thuyen-the-thao-nuoc',
                'icon' => 'ship',
                'description' => 'Du thuyền ngắm hoàng hôn, chèo SUP, kayak, dù bay và mô tô nước.',
            ],
            [
                'name' => 'Công viên giải trí & Vé tham quan',
                'slug' => 'cong-vien-giai-tri-ve-tham-quan',
                'icon' => 'ticket',
                'description' => 'Vé vào cổng khu vui chơi, cáp treo, thủy cung và show diễn nghệ thuật.',
            ],
            [
                'name' => 'Workshop & Trải nghiệm bản địa',
                'slug' => 'workshop-trai-nghiem-ban-dia',
                'icon' => 'palette',
                'description' => 'Lớp học nấu ăn, làm gốm, pha chế cà phê và giao lưu đời sống người dân địa phương.',
            ],
            [
                'name' => 'Thuê xe & Đưa đón sân bay',
                'slug' => 'thue-xe-dua-don-san-bay',
                'icon' => 'car',
                'description' => 'Dịch vụ thuê xe tự lái, xe du lịch hợp đồng và đưa đón sân bay đúng giờ.',
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => $cat['slug']],
                [
                    'name' => $cat['name'],
                    'icon' => $cat['icon'],
                    'description' => $cat['description'],
                ]
            );
        }
    }
}
