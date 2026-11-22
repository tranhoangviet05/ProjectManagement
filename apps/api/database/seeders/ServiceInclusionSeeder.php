<?php

namespace Database\Seeders;

use App\Models\ServiceInclusion;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceInclusionSeeder extends Seeder
{
    /**
     * Khởi tạo đầy đủ dữ liệu cho mục Bao gồm (include) và Không bao gồm (exclude)
     * phân biệt theo từng loại hình dịch vụ.
     */
    public function run(): void
    {
        $includes = [
            // Chỗ ở
            ['name' => 'Bữa sáng buffet / gọi món hằng ngày', 'types' => ['hotel', 'homestay']],
            ['name' => 'Nước uống chào mừng khi nhận phòng', 'types' => ['hotel', 'homestay']],
            ['name' => 'Trà, cà phê và 2 chai nước suối mỗi ngày', 'types' => ['hotel', 'homestay']],
            ['name' => 'Sử dụng miễn phí hồ bơi & phòng tập Gym', 'types' => ['hotel', 'homestay']],
            ['name' => 'Dọn phòng hằng ngày & thay khăn tắm', 'types' => ['hotel', 'homestay']],
            ['name' => 'Thuế VAT & Phí dịch vụ theo quy định', 'types' => ['hotel', 'homestay', 'tour', 'vehicle', 'train']],
            ['name' => 'Miễn phí hủy phòng trước 48 giờ', 'types' => ['hotel', 'homestay']],

            // Tour & Giải trí
            ['name' => 'Vé vào cổng các điểm tham quan trong lịch trình', 'types' => ['tour']],
            ['name' => 'Xe du lịch đưa đón khứ hồi tại điểm hẹn', 'types' => ['tour']],
            ['name' => 'Hướng dẫn viên tiếng Việt nhiệt tình suốt tuyến', 'types' => ['tour']],
            ['name' => 'Bữa trưa / bữa tối đặc sản địa phương theo chương trình', 'types' => ['tour']],
            ['name' => 'Nước suối đóng chai (1-2 chai/khách/ngày)', 'types' => ['tour', 'train']],
            ['name' => 'Bảo hiểm du lịch trọn gói theo hành trình', 'types' => ['tour', 'train']],
            ['name' => 'Dụng cụ hỗ trợ (áo phao, kính lặn, gậy trekking)', 'types' => ['tour']],

            // Thuê xe
            ['name' => 'Bảo hiểm trách nhiệm dân sự & hành khách', 'types' => ['vehicle']],
            ['name' => '2 mũ bảo hiểm & 2 áo mưa tiện lợi', 'types' => ['vehicle']],
            ['name' => 'Giao và nhận xe miễn phí trong bán kính 5km', 'types' => ['vehicle']],
            ['name' => 'Bảo dưỡng định kỳ & kiểm tra an toàn trước khi giao', 'types' => ['vehicle']],
            ['name' => '1 lít xăng khởi hành ban đầu', 'types' => ['vehicle']],

            // Vé tàu
            ['name' => '7kg hành lý xách tay & 20kg hành lý ký gửi tiêu chuẩn', 'types' => ['train']],
            ['name' => 'Chỗ ngồi / giường nằm đúng số toa đã chọn', 'types' => ['train']],
            ['name' => 'Phí xuất vé điện tử & mã QR lên tàu', 'types' => ['train']],
        ];

        $excludes = [
            // Chung & Chỗ ở
            ['name' => 'Chi phí cá nhân (giặt ủi, điện thoại, minibar)', 'types' => ['hotel', 'homestay', 'tour']],
            ['name' => 'Đồ uống có cồn & gọi món ngoài thực đơn', 'types' => ['hotel', 'homestay', 'tour', 'train']],
            ['name' => 'Phụ thu nhận phòng sớm hoặc trả phòng muộn', 'types' => ['hotel', 'homestay']],
            ['name' => 'Phụ thu giai đoạn Lễ, Tết và cuối tuần cao điểm', 'types' => ['hotel', 'homestay', 'tour', 'vehicle']],
            ['name' => 'Phí phát sinh khi mang theo thú cưng', 'types' => ['hotel', 'homestay']],
            ['name' => 'Chi phí đưa đón sân bay ngoài khung giờ quy định', 'types' => ['hotel', 'homestay']],
            ['name' => 'Thuế VAT nếu yêu cầu xuất hóa đơn đỏ bổ sung', 'types' => ['hotel', 'homestay', 'tour', 'vehicle']],

            // Tour & Giải trí
            ['name' => 'Tiền bồi dưỡng (tip) cho hướng dẫn viên & tài xế', 'types' => ['tour']],
            ['name' => 'Vé máy bay / tàu xe di chuyển đến điểm tập trung', 'types' => ['tour']],
            ['name' => 'Chi phí tham gia các trò chơi tự túc ngoài lịch trình', 'types' => ['tour']],
            ['name' => 'Phụ thu phòng đơn (nếu đi 1 mình hoặc ở riêng)', 'types' => ['tour']],

            // Thuê xe
            ['name' => 'Chi phí xăng dầu / sạc điện trong quá trình sử dụng', 'types' => ['vehicle']],
            ['name' => 'Phí cầu đường, cao tốc, bến bãi và gửi xe', 'types' => ['vehicle']],
            ['name' => 'Tiền phạt vi phạm giao thông phát sinh (nếu có)', 'types' => ['vehicle']],
            ['name' => 'Phụ thu trả xe quá giờ hoặc khác địa điểm quy định', 'types' => ['vehicle']],

            // Vé tàu
            ['name' => 'Suất ăn chính & đồ uống gọi thêm trên tàu', 'types' => ['train']],
            ['name' => 'Phí đổi trả vé sát giờ tàu chạy theo quy định đường sắt', 'types' => ['train']],
            ['name' => 'Hành lý quá khổ hoặc quá trọng lượng quy định', 'types' => ['train']],
        ];

        foreach ($includes as $index => $item) {
            ServiceInclusion::updateOrCreate(
                ['slug' => Str::slug('include-'.$item['name'])],
                [
                    'name' => $item['name'],
                    'kind' => 'include',
                    'applicable_types' => $item['types'],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ]
            );
        }

        foreach ($excludes as $index => $item) {
            ServiceInclusion::updateOrCreate(
                ['slug' => Str::slug('exclude-'.$item['name'])],
                [
                    'name' => $item['name'],
                    'kind' => 'exclude',
                    'applicable_types' => $item['types'],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ]
            );
        }
    }
}
