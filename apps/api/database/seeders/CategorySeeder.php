<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Dữ liệu khởi tạo cho các chủ đề / danh mục trải nghiệm của dịch vụ,
     * phân biệt rõ loại hình dịch vụ áp dụng (applicable_types).
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Biển đảo & Lặn ngắm san hô',
                'slug' => 'bien-dao-lan-ngam-san-ho',
                'applicable_types' => ['tour'],
                'icon' => 'waves',
                'description' => 'Tour và dịch vụ trải nghiệm biển, đảo, lặn ngắm san hô, cano ngắm vịnh.',
            ],
            [
                'name' => 'Trekking, Cắm trại & Săn mây',
                'slug' => 'trekking-cam-trai-san-may',
                'applicable_types' => ['tour', 'homestay'],
                'icon' => 'mountain',
                'description' => 'Chinh phục các cung đường trekking, cắm trại glamping và săn mây thiên nhiên.',
            ],
            [
                'name' => 'Food Tour & Ẩm thực đường phố',
                'slug' => 'food-tour-am-thuc-duong-pho',
                'applicable_types' => ['tour'],
                'icon' => 'utensils',
                'description' => 'Khám phá văn hóa ẩm thực địa phương, chợ đêm và món ngon truyền thống.',
            ],
            [
                'name' => 'Văn hóa, Lịch sử & Tâm linh',
                'slug' => 'van-hoa-lich-su-tam-linh',
                'applicable_types' => ['tour'],
                'icon' => 'landmark',
                'description' => 'Thăm quan di tích lịch sử, phố cổ, đền chùa và làng nghề truyền thống.',
            ],
            [
                'name' => 'Nghỉ dưỡng & Chữa lành',
                'slug' => 'nghi-duong-chua-lanh-wellness',
                'applicable_types' => ['hotel', 'homestay', 'tour'],
                'icon' => 'heart-pulse',
                'description' => 'Trải nghiệm suối khoáng nóng onsen, spa, yoga và không gian thanh tịnh.',
            ],
            [
                'name' => 'Khách sạn & Khu nghỉ dưỡng',
                'slug' => 'khach-san-khu-nghi-duong',
                'applicable_types' => ['hotel'],
                'icon' => 'building-2',
                'description' => 'Lưu trú tại khách sạn 3-5 sao, resort ven biển hoặc trung tâm thành phố.',
            ],
            [
                'name' => 'Homestay, Villa & Bungalow',
                'slug' => 'homestay-villa-bungalow',
                'applicable_types' => ['homestay'],
                'icon' => 'home',
                'description' => 'Không gian lưu trú riêng tư, gần gũi thiên nhiên dành cho gia đình và nhóm bạn.',
            ],
            [
                'name' => 'Du thuyền & Thể thao nước',
                'slug' => 'du-thuyen-the-thao-nuoc',
                'applicable_types' => ['tour', 'hotel'],
                'icon' => 'ship',
                'description' => 'Du thuyền ngắm hoàng hôn, chèo SUP, kayak, dù bay và mô tô nước.',
            ],
            [
                'name' => 'Công viên giải trí & Vé tham quan',
                'slug' => 'cong-vien-giai-tri-ve-tham-quan',
                'applicable_types' => ['tour'],
                'icon' => 'ticket',
                'description' => 'Vé vào cổng khu vui chơi, cáp treo, thủy cung và show diễn nghệ thuật.',
            ],
            [
                'name' => 'Workshop & Trải nghiệm bản địa',
                'slug' => 'workshop-trai-nghiem-ban-dia',
                'applicable_types' => ['tour'],
                'icon' => 'palette',
                'description' => 'Lớp học nấu ăn, làm gốm, pha chế cà phê và giao lưu đời sống người dân địa phương.',
            ],
            [
                'name' => 'Thuê xe & Đưa đón sân bay',
                'slug' => 'thue-xe-dua-don-san-bay',
                'applicable_types' => ['vehicle'],
                'icon' => 'car',
                'description' => 'Dịch vụ thuê xe tự lái, xe du lịch hợp đồng và đưa đón sân bay đúng giờ.',
            ],
            [
                'name' => 'Vé tàu hỏa & Đường sắt ngắm cảnh',
                'slug' => 've-tau-hoa-duong-sat-ngam-canh',
                'applicable_types' => ['train'],
                'icon' => 'train-front',
                'description' => 'Vé tàu hỏa Bắc – Nam, khoang giường nằm du lịch và tuyến đường sắt ven biển.',
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => $cat['slug']],
                [
                    'name' => $cat['name'],
                    'applicable_types' => $cat['applicable_types'],
                    'icon' => $cat['icon'],
                    'description' => $cat['description'],
                ]
            );
        }
    }
}
