<?php

namespace Database\Seeders;

use App\Models\ServicePolicy;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServicePolicySeeder extends Seeder
{
    /**
     * Khởi tạo bộ Chính sách dịch vụ chuẩn toàn sàn cho tất cả loại hình du lịch.
     */
    public function run(): void
    {
        $policies = [
            // 1. Nhóm Thanh toán (payment)
            [
                'name' => 'Đặt cọc giữ chỗ 30% (Bảo vệ Escrow)',
                'category' => 'payment',
                'icon' => 'shield-check',
                'types' => ['hotel', 'homestay'],
                'description' => 'Khách hàng chỉ cần thanh toán trước 30% giá trị đơn hàng qua hệ thống ký quỹ Escrow, phần còn lại thanh toán khi nhận phòng.',
            ],
            [
                'name' => 'Thanh toán khi nhận phòng / sử dụng dịch vụ',
                'category' => 'payment',
                'icon' => 'briefcase',
                'types' => ['hotel', 'homestay', 'vehicle'],
                'description' => 'Cho phép thanh toán trực tiếp tại quầy lễ tân hoặc khi nhận xe mà không cần trả toàn bộ trực tuyến.',
            ],
            [
                'name' => 'Thanh toán toàn bộ 100% khi đặt chỗ',
                'category' => 'payment',
                'icon' => 'lock',
                'types' => ['tour', 'train'],
                'description' => 'Áp dụng cho tour khởi hành cố định và vé tàu nhằm xác nhận giữ vé tức thì.',
            ],
            [
                'name' => 'Yêu cầu đặt cọc thế chân tài sản (CCCD / Tiền mặt)',
                'category' => 'payment',
                'icon' => 'shield-check',
                'types' => ['vehicle'],
                'description' => 'Khách thuê xe cần xuất trình CCCD gắn chip/Hộ chiếu và đặt cọc thế chân theo quy định khi bàn giao xe.',
            ],

            // 2. Nhóm Hủy & Đổi lịch (cancellation)
            [
                'name' => 'Miễn phí hủy phòng trước 48 giờ',
                'category' => 'cancellation',
                'icon' => 'clock',
                'types' => ['hotel', 'homestay'],
                'description' => 'Hoàn lại 100% tiền cọc nếu khách hàng hủy đặt phòng trước thời điểm nhận phòng ít nhất 48 giờ.',
            ],
            [
                'name' => 'Miễn phí hủy hoặc dời ngày trước 24 giờ',
                'category' => 'cancellation',
                'icon' => 'clock',
                'types' => ['tour', 'vehicle'],
                'description' => 'Hỗ trợ hoàn tiền hoặc đổi sang ngày khởi hành khác hoàn toàn miễn phí trước 24 giờ.',
            ],
            [
                'name' => 'Không hoàn hủy (Giá ưu đãi đặc biệt)',
                'category' => 'cancellation',
                'icon' => 'lock',
                'types' => ['hotel', 'homestay', 'tour', 'train'],
                'description' => 'Mức giá ưu đãi không áp dụng hoàn tiền khi hủy sau khi đã xác nhận đặt chỗ thành công.',
            ],
            [
                'name' => 'Hỗ trợ đổi tên / đổi lịch theo quy định đường sắt',
                'category' => 'cancellation',
                'icon' => 'compass',
                'types' => ['train'],
                'description' => 'Áp dụng phí đổi trả vé theo quy định hiện hành của Tổng công ty Đường sắt Việt Nam trước giờ tàu chạy.',
            ],

            // 3. Nhóm Nhận & Trả chỗ (checkin)
            [
                'name' => 'Nhận phòng từ 14:00 – Trả phòng trước 12:00',
                'category' => 'checkin',
                'icon' => 'clock',
                'types' => ['hotel', 'homestay'],
                'description' => 'Khung giờ nhận và trả phòng tiêu chuẩn; nhận sớm hoặc trả muộn tùy tình trạng phòng trống và có thể tính phụ phí.',
            ],
            [
                'name' => 'Check-in nhanh bằng mã QR Code trên ứng dụng',
                'category' => 'checkin',
                'icon' => 'zap',
                'types' => ['hotel', 'homestay', 'tour', 'vehicle', 'train'],
                'description' => 'Xuất trình vé điện tử QR trên ứng dụng Social Travel Booking để làm thủ tục nhanh chóng.',
            ],
            [
                'name' => 'Có mặt tại điểm tập trung trước giờ khởi hành 30 phút',
                'category' => 'checkin',
                'icon' => 'map-pin',
                'types' => ['tour', 'train'],
                'description' => 'Vui lòng có mặt đúng giờ tại điểm đón hoặc nhà ga để tránh lỡ lịch trình chung.',
            ],
            [
                'name' => 'Giao & nhận xe linh hoạt trong khung 07:00 – 21:00',
                'category' => 'checkin',
                'icon' => 'car',
                'types' => ['vehicle'],
                'description' => 'Hỗ trợ bàn giao xe tận sân bay, khách sạn hoặc điểm hẹn theo thời gian khách đăng ký.',
            ],

            // 4. Nhóm Quy định sử dụng (rules)
            [
                'name' => 'Xuất trình CCCD / Hộ chiếu hợp lệ khi nhận dịch vụ',
                'category' => 'rules',
                'icon' => 'shield-check',
                'types' => ['hotel', 'homestay', 'tour', 'vehicle', 'train'],
                'description' => 'Toàn bộ khách lưu trú hoặc hành khách cần mang theo giấy tờ tùy thân bản gốc để đối chiếu thông tin.',
            ],
            [
                'name' => 'Chính sách trẻ em: Miễn phí trẻ dưới 6 tuổi ngủ chung',
                'category' => 'rules',
                'icon' => 'baby',
                'types' => ['hotel', 'homestay', 'tour'],
                'description' => 'Trẻ em dưới 6 tuổi được miễn phí khi ngủ chung giường với bố mẹ; trẻ từ 6–11 tuổi tính phụ thu theo quy định.',
            ],
            [
                'name' => 'Không hút thuốc trong phòng / không gian kín',
                'category' => 'rules',
                'icon' => 'wind',
                'types' => ['hotel', 'homestay', 'vehicle', 'train'],
                'description' => 'Vui lòng sử dụng khu vực hút thuốc ngoài trời được bố trí riêng để đảm bảo không khí trong lành.',
            ],
            [
                'name' => 'Không mang theo thú cưng',
                'category' => 'rules',
                'icon' => 'paw-print',
                'types' => ['hotel', 'homestay', 'tour', 'train'],
                'description' => 'Cơ sở lưu trú / phương tiện không hỗ trợ mang theo vật nuôi nhằm đảm bảo vệ sinh chung.',
            ],
            [
                'name' => 'Cho phép mang theo thú cưng (có phụ thu vệ sinh)',
                'category' => 'rules',
                'icon' => 'paw-print',
                'types' => ['hotel', 'homestay', 'vehicle'],
                'description' => 'Chào đón thú cưng nhỏ gọn, vui lòng giữ gìn vệ sinh và thông báo trước cho nhà cung cấp.',
            ],
            [
                'name' => 'Yêu cầu bằng lái xe hợp lệ còn hiệu lực',
                'category' => 'rules',
                'icon' => 'hard-hat',
                'types' => ['vehicle'],
                'description' => 'Người điều khiển xe máy trên 50cc hoặc ô tô tự lái bắt buộc có GPLX hạng A1/A2/B1/B2 hợp lệ.',
            ],
        ];

        foreach ($policies as $index => $item) {
            ServicePolicy::updateOrCreate(
                ['slug' => Str::slug($item['category'].'-'.$item['name'])],
                [
                    'name' => $item['name'],
                    'category' => $item['category'],
                    'applicable_types' => $item['types'],
                    'icon' => $item['icon'],
                    'description' => $item['description'],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ]
            );
        }
    }
}
