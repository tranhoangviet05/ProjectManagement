<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AmenitySeeder extends Seeder
{
    /**
     * Khởi tạo bộ dữ liệu đầy đủ cho Tiện nghi dịch vụ (scope = service)
     * và Tiện nghi phòng (scope = room) phân biệt theo từng loại hình dịch vụ.
     */
    public function run(): void
    {
        $serviceAmenities = [
            // Chung cho Chỗ ở & Trải nghiệm
            ['name' => 'Wifi tốc độ cao miễn phí', 'icon' => 'wifi', 'types' => ['hotel', 'homestay', 'tour', 'train']],
            ['name' => 'Bãi đậu xe miễn phí', 'icon' => 'car', 'types' => ['hotel', 'homestay', 'tour']],
            ['name' => 'Đưa đón sân bay / ga tàu', 'icon' => 'plane', 'types' => ['hotel', 'homestay', 'tour']],
            ['name' => 'Lễ tân & Hỗ trợ 24/7', 'icon' => 'clock', 'types' => ['hotel', 'homestay', 'vehicle']],
            ['name' => 'Cho phép mang theo thú cưng', 'icon' => 'paw-print', 'types' => ['hotel', 'homestay', 'vehicle']],
            ['name' => 'Hỗ trợ người khuyết tật', 'icon' => 'accessibility', 'types' => ['hotel', 'tour', 'train']],
            ['name' => 'Tủ giữ hành lý miễn phí', 'icon' => 'luggage', 'types' => ['hotel', 'homestay', 'train']],
            ['name' => 'Camera an ninh & Bảo vệ 24/7', 'icon' => 'shield-check', 'types' => ['hotel', 'homestay', 'vehicle']],

            // Chỗ ở: Khách sạn / Resort / Homestay / Villa
            ['name' => 'Hồ bơi vô cực ngoài trời', 'icon' => 'waves', 'types' => ['hotel', 'homestay']],
            ['name' => 'Bãi biển riêng', 'icon' => 'umbrella', 'types' => ['hotel', 'homestay']],
            ['name' => 'Nhà hàng & Quầy bar', 'icon' => 'utensils', 'types' => ['hotel', 'tour']],
            ['name' => 'Quán cà phê & Lounge', 'icon' => 'coffee', 'types' => ['hotel', 'homestay', 'train']],
            ['name' => 'Spa, Massage & Xông hơi', 'icon' => 'sparkles', 'types' => ['hotel', 'homestay']],
            ['name' => 'Phòng tập Gym & Fitness', 'icon' => 'dumbbell', 'types' => ['hotel']],
            ['name' => 'Khu vui chơi trẻ em', 'icon' => 'baby', 'types' => ['hotel', 'homestay']],
            ['name' => 'Thang máy hiện đại', 'icon' => 'building-2', 'types' => ['hotel']],
            ['name' => 'Tiện nghi tiệc nướng BBQ', 'icon' => 'flame', 'types' => ['homestay', 'hotel']],
            ['name' => 'Bếp chung & Khu ăn uống', 'icon' => 'chef-hat', 'types' => ['homestay']],
            ['name' => 'Sân vườn & Góc check-in', 'icon' => 'trees', 'types' => ['homestay', 'hotel']],
            ['name' => 'Phòng họp & Hội nghị', 'icon' => 'briefcase', 'types' => ['hotel']],
            ['name' => 'Dịch vụ giặt ủi', 'icon' => 'shirt', 'types' => ['hotel', 'homestay']],
            ['name' => 'Cho thuê xe đạp miễn phí', 'icon' => 'bike', 'types' => ['hotel', 'homestay']],

            // Tour & Giải trí
            ['name' => 'Hướng dẫn viên bản địa chuyên nghiệp', 'icon' => 'compass', 'types' => ['tour']],
            ['name' => 'Xe du lịch đời mới máy lạnh', 'icon' => 'bus', 'types' => ['tour']],
            ['name' => 'Tàu cao tốc / Cano tham quan', 'icon' => 'ship', 'types' => ['tour']],
            ['name' => 'Áo phao & Dụng cụ lặn ngắm san hô', 'icon' => 'life-buoy', 'types' => ['tour']],
            ['name' => 'Bộ sơ cứu & Y tế chuyên dụng', 'icon' => 'heart-pulse', 'types' => ['tour', 'train']],
            ['name' => 'Hỗ trợ chụp ảnh check-in hành trình', 'icon' => 'camera', 'types' => ['tour']],
            ['name' => 'Lều trại Glamping & Đèn sưởi', 'icon' => 'tent', 'types' => ['tour']],

            // Thuê xe
            ['name' => 'Giao & nhận xe tận nơi miễn phí', 'icon' => 'map-pin', 'types' => ['vehicle']],
            ['name' => 'Trang bị 2 mũ bảo hiểm đạt chuẩn', 'icon' => 'hard-hat', 'types' => ['vehicle']],
            ['name' => 'Định vị GPS & Camera hành trình', 'icon' => 'navigation', 'types' => ['vehicle']],
            ['name' => 'Ghế an toàn cho trẻ em trên xe', 'icon' => 'baby', 'types' => ['vehicle']],
            ['name' => 'Cổng sạc USB & Giá đỡ điện thoại', 'icon' => 'zap', 'types' => ['vehicle']],
            ['name' => 'Hỗ trợ cứu hộ kỹ thuật 24/7', 'icon' => 'wrench', 'types' => ['vehicle']],

            // Vé tàu
            ['name' => 'Toa xe điều hòa 2 chiều êm ái', 'icon' => 'snowflake', 'types' => ['train']],
            ['name' => 'Ổ cắm điện & Cổng sạc tại ghế', 'icon' => 'plug', 'types' => ['train']],
            ['name' => 'Khoang giường nằm riêng tư', 'icon' => 'bed-double', 'types' => ['train']],
            ['name' => 'Toa Canteen phục vụ đồ ăn & nước', 'icon' => 'utensils', 'types' => ['train']],
            ['name' => 'Cửa sổ kính lớn ngắm cảnh', 'icon' => 'sun', 'types' => ['train']],
        ];

        $roomAmenities = [
            ['name' => 'Điều hòa 2 chiều', 'icon' => 'snowflake', 'types' => ['hotel', 'homestay']],
            ['name' => 'Wifi riêng tốc độ cao', 'icon' => 'wifi', 'types' => ['hotel', 'homestay']],
            ['name' => 'Smart TV màn hình phẳng (Netflix)', 'icon' => 'tv', 'types' => ['hotel', 'homestay']],
            ['name' => 'Bồn tắm nằm sang trọng', 'icon' => 'bath', 'types' => ['hotel', 'homestay']],
            ['name' => 'Vòi sen nước nóng & Đồ vệ sinh', 'icon' => 'droplets', 'types' => ['hotel', 'homestay']],
            ['name' => 'Máy sấy tóc', 'icon' => 'wind', 'types' => ['hotel', 'homestay']],
            ['name' => 'Ban công / Cửa sổ view thoáng', 'icon' => 'sun', 'types' => ['hotel', 'homestay']],
            ['name' => 'Tủ lạnh mini / Minibar', 'icon' => 'refrigerator', 'types' => ['hotel', 'homestay']],
            ['name' => 'Ấm đun siêu tốc & Trà, cà phê', 'icon' => 'coffee', 'types' => ['hotel', 'homestay']],
            ['name' => 'Két sắt an toàn điện tử', 'icon' => 'lock', 'types' => ['hotel']],
            ['name' => 'Bàn làm việc & Đèn đọc sách', 'icon' => 'lamp-desk', 'types' => ['hotel', 'homestay']],
            ['name' => 'Tủ quần áo & Móc treo', 'icon' => 'shirt', 'types' => ['hotel', 'homestay']],
            ['name' => 'Bàn là hơi nước', 'icon' => 'sparkles', 'types' => ['hotel', 'homestay']],
            ['name' => 'Máy giặt riêng trong phòng', 'icon' => 'washing-machine', 'types' => ['homestay']],
            ['name' => 'Bếp từ & Dụng cụ nấu ăn đầy đủ', 'icon' => 'utensils', 'types' => ['homestay']],
            ['name' => 'Phòng cách âm tiêu chuẩn', 'icon' => 'volume-x', 'types' => ['hotel', 'homestay']],
            ['name' => 'Rèm cản sáng 2 lớp', 'icon' => 'moon', 'types' => ['hotel', 'homestay']],
            ['name' => 'Áo choàng tắm & Dép đi trong phòng', 'icon' => 'footprints', 'types' => ['hotel']],
            ['name' => 'Nệm lò xo & Gối lông vũ cao cấp', 'icon' => 'bed-double', 'types' => ['hotel', 'homestay']],
            ['name' => 'Nước suối đóng chai miễn phí mỗi ngày', 'icon' => 'glass-water', 'types' => ['hotel', 'homestay']],
        ];

        foreach ($serviceAmenities as $index => $item) {
            Amenity::updateOrCreate(
                ['slug' => Str::slug('service-'.$item['name'])],
                [
                    'name' => $item['name'],
                    'scope' => 'service',
                    'applicable_types' => $item['types'],
                    'icon' => $item['icon'],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ]
            );
        }

        foreach ($roomAmenities as $index => $item) {
            Amenity::updateOrCreate(
                ['slug' => Str::slug('room-'.$item['name'])],
                [
                    'name' => $item['name'],
                    'scope' => 'room',
                    'applicable_types' => $item['types'],
                    'icon' => $item['icon'],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ]
            );
        }
    }
}
