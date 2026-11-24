<?php

namespace Database\Seeders;

use App\Models\ServicePolicy;
use Illuminate\Database\Seeder;

class ServicePolicySeeder extends Seeder
{
    /**
     * Khởi tạo bộ Chính sách dịch vụ chuẩn toàn sàn kèm rule_key & rule_config
     * để hệ thống xử lý tự động về đặt cọc, giờ nhận/trả phòng, hoàn hủy và thú cưng.
     */
    public function run(): void
    {
        $policies = [
            // 1. Nhóm Thanh toán (payment)
            [
                'slug' => 'dat-coc-giu-cho-30',
                'name' => 'Đặt cọc giữ chỗ 30% (Bảo vệ Escrow)',
                'category' => 'payment',
                'rule_key' => 'deposit_rate',
                'rule_config' => ['rate' => 30],
                'icon' => 'shield-check',
                'types' => ['hotel', 'homestay'],
                'description' => 'Khách hàng chỉ cần thanh toán trước 30% giá trị đơn hàng qua hệ thống ký quỹ Escrow, phần còn lại thanh toán khi nhận phòng.',
            ],
            [
                'slug' => 'thanh-toan-khi-nhan-phong',
                'name' => 'Thanh toán khi nhận phòng / sử dụng dịch vụ',
                'category' => 'payment',
                'rule_key' => 'deposit_rate',
                'rule_config' => ['rate' => 0],
                'icon' => 'briefcase',
                'types' => ['hotel', 'homestay', 'vehicle'],
                'description' => 'Cho phép thanh toán trực tiếp tại quầy lễ tân hoặc khi nhận xe mà không cần trả toàn bộ trực tuyến.',
            ],
            [
                'slug' => 'thanh-toan-toan-bo-100',
                'name' => 'Thanh toán toàn bộ 100% khi đặt chỗ',
                'category' => 'payment',
                'rule_key' => 'deposit_rate',
                'rule_config' => ['rate' => 100],
                'icon' => 'lock',
                'types' => ['tour', 'train'],
                'description' => 'Áp dụng cho tour khởi hành cố định và vé tàu nhằm xác nhận giữ vé tức thì.',
            ],
            [
                'slug' => 'yeu-cau-dat-coc-the-chan-tai-san',
                'name' => 'Yêu cầu đặt cọc thế chân tài sản (CCCD / Tiền mặt)',
                'category' => 'payment',
                'rule_key' => 'security_deposit',
                'rule_config' => ['required' => true, 'methods' => ['cccd', 'cash']],
                'icon' => 'shield-check',
                'types' => ['vehicle'],
                'description' => 'Khách thuê xe cần xuất trình CCCD gắn chip/Hộ chiếu và đặt cọc thế chân theo quy định khi bàn giao xe.',
            ],

            // 2. Nhóm Hủy & Đổi lịch (cancellation)
            [
                'slug' => 'mien-phi-huy-phong-truoc-48-gio',
                'name' => 'Miễn phí hủy phòng trước 48 giờ',
                'category' => 'cancellation',
                'rule_key' => 'cancellation',
                'rule_config' => ['refundable' => true, 'free_cancel_hours' => 48],
                'icon' => 'clock',
                'types' => ['hotel', 'homestay'],
                'description' => 'Hoàn lại 100% tiền cọc nếu khách hàng hủy đặt phòng trước thời điểm nhận phòng ít nhất 48 giờ.',
            ],
            [
                'slug' => 'mien-phi-huy-doi-ngay-24h',
                'name' => 'Miễn phí hủy hoặc dời ngày trước 24 giờ',
                'category' => 'cancellation',
                'rule_key' => 'cancellation',
                'rule_config' => ['refundable' => true, 'free_cancel_hours' => 24, 'allow_reschedule' => true],
                'icon' => 'clock',
                'types' => ['tour', 'vehicle'],
                'description' => 'Hỗ trợ hoàn tiền hoặc đổi sang ngày khởi hành khác hoàn toàn miễn phí trước 24 giờ.',
            ],
            [
                'slug' => 'khong-hoan-huy',
                'name' => 'Không hoàn hủy (Giá ưu đãi đặc biệt)',
                'category' => 'cancellation',
                'rule_key' => 'cancellation',
                'rule_config' => ['refundable' => false, 'free_cancel_hours' => 0],
                'icon' => 'lock',
                'types' => ['hotel', 'homestay', 'tour', 'train'],
                'description' => 'Mức giá ưu đãi không áp dụng hoàn tiền khi hủy sau khi đã xác nhận đặt chỗ thành công.',
            ],
            [
                'slug' => 'ho-tro-doi-ten-doi-lich-duong-sat',
                'name' => 'Hỗ trợ đổi tên / đổi lịch theo quy định đường sắt',
                'category' => 'cancellation',
                'rule_key' => 'cancellation',
                'rule_config' => ['refundable' => true, 'free_cancel_hours' => 24, 'allow_reschedule' => true],
                'icon' => 'compass',
                'types' => ['train'],
                'description' => 'Áp dụng phí đổi trả vé theo quy định hiện hành của Tổng công ty Đường sắt Việt Nam trước giờ tàu chạy.',
            ],

            // 3. Nhóm Nhận & Trả chỗ (checkin)
            [
                'slug' => 'nhan-phong-14h-tra-phong-12h',
                'name' => 'Nhận phòng từ 14:00 – Trả phòng trước 12:00',
                'category' => 'checkin',
                'rule_key' => 'checkin_checkout',
                'rule_config' => ['checkin_time' => '14:00', 'checkout_time' => '12:00'],
                'icon' => 'clock',
                'types' => ['hotel', 'homestay'],
                'description' => 'Khung giờ nhận và trả phòng tiêu chuẩn; nhận sớm hoặc trả muộn tùy tình trạng phòng trống và có thể tính phụ phí.',
            ],
            [
                'slug' => 'check-in-nhanh-qr-code',
                'name' => 'Check-in nhanh bằng mã QR Code trên ứng dụng',
                'category' => 'checkin',
                'rule_key' => 'qr_checkin',
                'rule_config' => ['enabled' => true],
                'icon' => 'zap',
                'types' => ['hotel', 'homestay', 'tour', 'vehicle', 'train'],
                'description' => 'Xuất trình vé điện tử QR trên ứng dụng Social Travel Booking để làm thủ tục nhanh chóng.',
            ],
            [
                'slug' => 'co-mat-truoc-30-phut',
                'name' => 'Có mặt tại điểm tập trung trước giờ khởi hành 30 phút',
                'category' => 'checkin',
                'rule_key' => 'arrival_notice',
                'rule_config' => ['minutes_before' => 30],
                'icon' => 'map-pin',
                'types' => ['tour', 'train'],
                'description' => 'Vui lòng có mặt đúng giờ tại điểm đón hoặc nhà ga để tránh lỡ lịch trình chung.',
            ],
            [
                'slug' => 'giao-nhan-xe-linh-hoat-07h-21h',
                'name' => 'Giao & nhận xe linh hoạt trong khung 07:00 – 21:00',
                'category' => 'checkin',
                'rule_key' => 'checkin_checkout',
                'rule_config' => ['checkin_time' => '07:00', 'checkout_time' => '21:00'],
                'icon' => 'car',
                'types' => ['vehicle'],
                'description' => 'Hỗ trợ bàn giao xe tận sân bay, khách sạn hoặc điểm hẹn theo thời gian khách đăng ký.',
            ],

            // 4. Nhóm Quy định sử dụng (rules)
            [
                'slug' => 'xuat-trinh-cccd-ho-chieu',
                'name' => 'Xuất trình CCCD / Hộ chiếu hợp lệ khi nhận dịch vụ',
                'category' => 'rules',
                'rule_key' => 'id_required',
                'rule_config' => ['required' => true],
                'icon' => 'shield-check',
                'types' => ['hotel', 'homestay', 'tour', 'vehicle', 'train'],
                'description' => 'Toàn bộ khách lưu trú hoặc hành khách cần mang theo giấy tờ tùy thân bản gốc để đối chiếu thông tin.',
            ],
            [
                'slug' => 'chinh-sach-tre-em-mien-phi-duoi-6',
                'name' => 'Chính sách trẻ em: Miễn phí trẻ dưới 6 tuổi ngủ chung',
                'category' => 'rules',
                'rule_key' => 'children_policy',
                'rule_config' => ['free_under_age' => 6, 'surcharge_min_age' => 6, 'surcharge_max_age' => 11],
                'icon' => 'baby',
                'types' => ['hotel', 'homestay', 'tour'],
                'description' => 'Trẻ em dưới 6 tuổi được miễn phí khi ngủ chung giường với bố mẹ; trẻ từ 6–11 tuổi tính phụ thu theo quy định.',
            ],
            [
                'slug' => 'khong-hut-thuoc',
                'name' => 'Không hút thuốc trong phòng / không gian kín',
                'category' => 'rules',
                'rule_key' => 'smoking_policy',
                'rule_config' => ['allow_smoking' => false],
                'icon' => 'wind',
                'types' => ['hotel', 'homestay', 'vehicle', 'train'],
                'description' => 'Vui lòng sử dụng khu vực hút thuốc ngoài trời được bố trí riêng để đảm bảo không khí trong lành.',
            ],
            [
                'slug' => 'khong-mang-theo-thu-cung',
                'name' => 'Không mang theo thú cưng',
                'category' => 'rules',
                'rule_key' => 'pet_policy',
                'rule_config' => ['allow_pets' => false],
                'icon' => 'paw-print',
                'types' => ['hotel', 'homestay', 'tour', 'train'],
                'description' => 'Cơ sở lưu trú / phương tiện không hỗ trợ mang theo vật nuôi nhằm đảm bảo vệ sinh chung.',
            ],
            [
                'slug' => 'cho-phep-mang-theo-thu-cung-co-phu-thu',
                'name' => 'Cho phép mang theo thú cưng (có phụ thu vệ sinh)',
                'category' => 'rules',
                'rule_key' => 'pet_policy',
                'rule_config' => ['allow_pets' => true, 'has_surcharge' => true],
                'icon' => 'paw-print',
                'types' => ['hotel', 'homestay', 'vehicle'],
                'description' => 'Chào đón thú cưng nhỏ gọn, vui lòng giữ gìn vệ sinh và thông báo trước cho nhà cung cấp.',
            ],
            [
                'slug' => 'yeu-cau-bang-lai-xe-hop-le',
                'name' => 'Yêu cầu bằng lái xe hợp lệ còn hiệu lực',
                'category' => 'rules',
                'rule_key' => 'driver_license',
                'rule_config' => ['required' => true],
                'icon' => 'hard-hat',
                'types' => ['vehicle'],
                'description' => 'Người điều khiển xe máy trên 50cc hoặc ô tô tự lái bắt buộc có GPLX hạng A1/A2/B1/B2 hợp lệ.',
            ],
        ];

        foreach ($policies as $index => $item) {
            ServicePolicy::updateOrCreate(
                ['name' => $item['name']],
                [
                    'slug' => $item['slug'],
                    'category' => $item['category'],
                    'rule_key' => $item['rule_key'],
                    'rule_config' => $item['rule_config'],
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
