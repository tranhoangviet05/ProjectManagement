<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Khởi tạo toàn bộ 34 Tỉnh/Thành phố trực thuộc Trung ương Việt Nam (theo Nghị quyết 202/2025/QH15, cập nhật 2026)
     * kèm các địa điểm du lịch trọng điểm có gắn parent_id tương ứng.
     */
    public function run(): void
    {
        // 1. 34 Đơn vị hành chính cấp Tỉnh / Thành phố trực thuộc TW (6 Thành phố + 28 Tỉnh)
        $provinces = [
            // 6 Thành phố trực thuộc Trung ương
            ['name' => 'Thành phố Hà Nội', 'slug' => 'ha-noi', 'is_popular' => true, 'description' => 'Thủ đô nghìn năm văn hiến với Hồ Gươm, Phố cổ và ẩm thực đặc sắc.'],
            ['name' => 'Thành phố Huế', 'slug' => 'hue', 'is_popular' => true, 'description' => 'Cố đô di sản văn hóa thế giới với Kinh thành Huế, sông Hương và lăng tẩm.'],
            ['name' => 'Thành phố Hải Phòng', 'slug' => 'hai-phong', 'is_popular' => true, 'description' => 'Thành phố cảng năng động (hợp nhất Hải Dương & Hải Phòng), cửa ngõ ra Vịnh Lan Hạ - Cát Bà.'],
            ['name' => 'Thành phố Đà Nẵng', 'slug' => 'da-nang', 'is_popular' => true, 'description' => 'Đô thị biển đáng sống miền Trung (hợp nhất Quảng Nam & Đà Nẵng) với Mỹ Khê, Sơn Trà và Phố cổ Hội An.'],
            ['name' => 'Thành phố Hồ Chí Minh', 'slug' => 'tp-ho-chi-minh', 'is_popular' => true, 'description' => 'Trung tâm kinh tế - du lịch sôi động nhất cả nước (hợp nhất TP.HCM, Bình Dương & Bà Rịa - Vũng Tàu).'],
            ['name' => 'Thành phố Cần Thơ', 'slug' => 'can-tho', 'is_popular' => true, 'description' => 'Thủ phủ miền Tây sông nước (hợp nhất Cần Thơ, Hậu Giang & Sóc Trăng) nổi tiếng với Chợ nổi Cái Răng.'],

            // 28 Tỉnh
            ['name' => 'Tỉnh Quảng Ninh', 'slug' => 'quang-ninh', 'is_popular' => true, 'description' => 'Sở hữu kỳ quan thiên nhiên thế giới Vịnh Hạ Long, Yên Tử và đảo Cô Tô.'],
            ['name' => 'Tỉnh Cao Bằng', 'slug' => 'cao-bang', 'is_popular' => false, 'description' => 'Vùng non nước biên cương với Thác Bản Giốc và Khu di tích Pác Bó.'],
            ['name' => 'Tỉnh Lạng Sơn', 'slug' => 'lang-son', 'is_popular' => false, 'description' => 'Cửa ngõ Đông Bắc với Mẫu Sơn, Thành Nhà Mạc và ẩm thực xứ Lạng.'],
            ['name' => 'Tỉnh Lai Châu', 'slug' => 'lai-chau', 'is_popular' => false, 'description' => 'Vùng núi Tây Bắc hùng vĩ với đèo Ô Quy Hồ, đỉnh Pu Ta Leng và bản Sin Suối Hồ.'],
            ['name' => 'Tỉnh Điện Biên', 'slug' => 'dien-bien', 'is_popular' => false, 'description' => 'Mảnh đất lịch sử Điện Biên Phủ cùng hoa ban trắng và cực Tây A Pa Chải.'],
            ['name' => 'Tỉnh Sơn La', 'slug' => 'son-la', 'is_popular' => false, 'description' => 'Thiên đường cao nguyên Mộc Châu, Tà Xùa săn mây và lòng hồ thủy điện.'],
            ['name' => 'Tỉnh Thanh Hóa', 'slug' => 'thanh-hoa', 'is_popular' => false, 'description' => 'Nổi tiếng với Khu bảo tồn Pù Luông, biển Sầm Sơn và Thành Nhà Hồ.'],
            ['name' => 'Tỉnh Nghệ An', 'slug' => 'nghe-an', 'is_popular' => false, 'description' => 'Quê hương Bác Hồ với biển Cửa Lò, đồi chè Thanh Chương và Vườn quốc gia Pù Mát.'],
            ['name' => 'Tỉnh Hà Tĩnh', 'slug' => 'ha-tinh', 'is_popular' => false, 'description' => 'Vùng đất địa linh nhân kiệt với biển Thiên Cầm và hồ Kẻ Gỗ.'],
            ['name' => 'Tỉnh Tuyên Quang', 'slug' => 'tuyen-quang', 'is_popular' => false, 'description' => 'Vùng chiến khu lịch sử & cực Bắc hùng vĩ (hợp nhất Hà Giang & Tuyên Quang).'],
            ['name' => 'Tỉnh Lào Cai', 'slug' => 'lao-cai', 'is_popular' => true, 'description' => 'Thủ phủ du lịch Tây Bắc (hợp nhất Lào Cai & Yên Bái) với Sa Pa, Fansipan và Mù Cang Chải.'],
            ['name' => 'Tỉnh Thái Nguyên', 'slug' => 'thai-nguyen', 'is_popular' => false, 'description' => 'Trung tâm vùng Việt Bắc (hợp nhất Bắc Kạn & Thái Nguyên) với Hồ Ba Bể và đồi chè Tân Cương.'],
            ['name' => 'Tỉnh Phú Thọ', 'slug' => 'phu-tho', 'is_popular' => false, 'description' => 'Đất Tổ Hùng Vương (hợp nhất Vĩnh Phúc, Hòa Bình & Phú Thọ) với Tam Đảo, Mai Châu và Đền Hùng.'],
            ['name' => 'Tỉnh Bắc Ninh', 'slug' => 'bac-ninh', 'is_popular' => false, 'description' => 'Miền quan họ Kinh Bắc (hợp nhất Bắc Giang & Bắc Ninh) với chùa Dâu, Tây Yên Tử.'],
            ['name' => 'Tỉnh Hưng Yên', 'slug' => 'hung-yen', 'is_popular' => false, 'description' => 'Vùng đồng bằng Bắc Bộ (hợp nhất Thái Bình & Hưng Yên) với Phố Hiến và biển Cồn Vành.'],
            ['name' => 'Tỉnh Ninh Bình', 'slug' => 'ninh-binh', 'is_popular' => true, 'description' => 'Vùng đất Cố đô Hoa Lư (hợp nhất Hà Nam, Nam Định & Ninh Bình) với Quần thể Tràng An - Tam Cốc.'],
            ['name' => 'Tỉnh Quảng Trị', 'slug' => 'quang-tri', 'is_popular' => false, 'description' => 'Miền di sản hang động & lịch sử (hợp nhất Quảng Bình & Quảng Trị) với Phong Nha - Kẻ Bàng.'],
            ['name' => 'Tỉnh Quảng Ngãi', 'slug' => 'quang-ngai', 'is_popular' => false, 'description' => 'Duyên hải Nam Trung Bộ (hợp nhất Bình Định & Quảng Ngãi) với Quy Nhơn - Kỳ Co và đảo Lý Sơn.'],
            ['name' => 'Tỉnh Khánh Hòa', 'slug' => 'khanh-hoa', 'is_popular' => true, 'description' => 'Thủ phủ biển đảo Nam Trung Bộ (hợp nhất Ninh Thuận, Phú Yên & Khánh Hòa) với Nha Trang và Vĩnh Hy.'],
            ['name' => 'Tỉnh Đắk Lắk', 'slug' => 'dak-lak', 'is_popular' => false, 'description' => 'Trái tim Tây Nguyên (hợp nhất Đắk Nông & Đắk Lắk) với văn hóa cồng chiêng, Buôn Ma Thuột và Hồ Tà Đùng.'],
            ['name' => 'Tỉnh Lâm Đồng', 'slug' => 'lam-dong', 'is_popular' => true, 'description' => 'Kết nối cao nguyên và biển xanh (hợp nhất Bình Thuận & Lâm Đồng) với Đà Lạt và Mũi Né.'],
            ['name' => 'Tỉnh Gia Lai', 'slug' => 'gia-lai', 'is_popular' => false, 'description' => 'Vùng đại ngàn Bắc Tây Nguyên (hợp nhất Kon Tum & Gia Lai) với Măng Đen và Biển Hồ Pleiku.'],
            ['name' => 'Tỉnh Đồng Nai', 'slug' => 'dong-nai', 'is_popular' => false, 'description' => 'Cửa ngõ Đông Nam Bộ (hợp nhất Bình Phước & Đồng Nai) với Vườn quốc gia Cát Tiên và Bù Gia Mập.'],
            ['name' => 'Tỉnh Tây Ninh', 'slug' => 'tay-ninh', 'is_popular' => false, 'description' => 'Vùng đất Núi Bà Đen và sông Vàm Cỏ (hợp nhất Long An & Tây Ninh).'],
            ['name' => 'Tỉnh Vĩnh Long', 'slug' => 'vinh-long', 'is_popular' => false, 'description' => 'Xứ dừa và miệt vườn sông Tiền (hợp nhất Bến Tre, Trà Vinh & Vĩnh Long).'],
            ['name' => 'Tỉnh Đồng Tháp', 'slug' => 'dong-thap', 'is_popular' => false, 'description' => 'Đất Sen Hồng và miệt vườn trái cây (hợp nhất Tiền Giang & Đồng Tháp).'],
            ['name' => 'Tỉnh An Giang', 'slug' => 'an-giang', 'is_popular' => true, 'description' => 'Vùng Thất Sơn và biển đảo Tây Nam (hợp nhất Kiên Giang & An Giang) với Phú Quốc và Rừng Tràm Trà Sư.'],
            ['name' => 'Tỉnh Cà Mau', 'slug' => 'ca-mau', 'is_popular' => false, 'description' => 'Vùng đất cực Nam Tổ quốc (hợp nhất Bạc Liêu & Cà Mau) với Mũi Cà Mau và Rừng U Minh Hạ.'],
        ];

        $provinceMap = [];
        foreach ($provinces as $prov) {
            $loc = Location::updateOrCreate(
                ['slug' => $prov['slug']],
                [
                    'name' => $prov['name'],
                    'parent_id' => null,
                    'country_code' => 'VN',
                    'description' => $prov['description'],
                    'is_popular' => $prov['is_popular'],
                ]
            );
            $provinceMap[$prov['slug']] = $loc->id;
        }

        // 2. Các địa điểm du lịch trọng điểm trực thuộc Tỉnh/Thành phố (gắn parent_id)
        $subLocations = [
            // Thành phố Đà Nẵng (bao gồm Quảng Nam)
            ['name' => 'Hội An', 'slug' => 'hoi-an', 'parent_slug' => 'da-nang', 'is_popular' => true, 'description' => 'Phố cổ Hội An di sản văn hóa thế giới với đèn lồng và sông Hoài.'],
            ['name' => 'Cù Lao Chàm', 'slug' => 'cu-lao-cham', 'parent_slug' => 'da-nang', 'is_popular' => true, 'description' => 'Khu dự trữ sinh quyển thế giới nổi tiếng với lặn ngắm san hô.'],
            ['name' => 'Bán đảo Sơn Trà', 'slug' => 'ban-dao-son-tra', 'parent_slug' => 'da-nang', 'is_popular' => true, 'description' => 'Lá phổi xanh của Đà Nẵng với Chùa Linh Ứng và Bãi Bụt.'],
            ['name' => 'Bà Nà Hills', 'slug' => 'ba-na-hills', 'parent_slug' => 'da-nang', 'is_popular' => true, 'description' => 'Khu du lịch trên núi Chúa với Cầu Vàng biểu tượng.'],

            // Tỉnh Lâm Đồng (bao gồm Bình Thuận)
            ['name' => 'Đà Lạt', 'slug' => 'da-lat', 'parent_slug' => 'lam-dong', 'is_popular' => true, 'description' => 'Thành phố ngàn hoa với khí hậu mát mẻ quanh năm, rừng thông và săn mây.'],
            ['name' => 'Mũi Né - Phan Thiết', 'slug' => 'mui-ne-phan-thiet', 'parent_slug' => 'lam-dong', 'is_popular' => true, 'description' => 'Thủ phủ resort biển với Đồi Cát Bay và Bàu Trắng.'],

            // Tỉnh An Giang (bao gồm Kiên Giang)
            ['name' => 'Phú Quốc', 'slug' => 'phu-quoc', 'parent_slug' => 'an-giang', 'is_popular' => true, 'description' => 'Đảo Ngọc thiên đường nghỉ dưỡng biển đảo hàng đầu Việt Nam.'],
            ['name' => 'Quần đảo Nam Du', 'slug' => 'nam-du', 'parent_slug' => 'an-giang', 'is_popular' => false, 'description' => 'Quần đảo hoang sơ với làn nước ngọc bích ở biển Tây Nam.'],
            ['name' => 'Châu Đốc - Trà Sư', 'slug' => 'chau-doc-tra-su', 'parent_slug' => 'an-giang', 'is_popular' => false, 'description' => 'Rừng tràm Trà Sư xanh mướt và Miếu Bà Chúa Xứ Núi Sam.'],

            // Tỉnh Khánh Hòa (bao gồm Ninh Thuận, Phú Yên)
            ['name' => 'Nha Trang', 'slug' => 'nha-trang', 'parent_slug' => 'khanh-hoa', 'is_popular' => true, 'description' => 'Vịnh biển đẹp hàng đầu thế giới với VinWonders và các đảo Hòn Mun, Hòn Tằm.'],
            ['name' => 'Vịnh Vĩnh Hy', 'slug' => 'vinh-hy', 'parent_slug' => 'khanh-hoa', 'is_popular' => true, 'description' => 'Một trong bốn vịnh biển đẹp nhất Việt Nam bên Vườn quốc gia Núi Chúa.'],
            ['name' => 'Tuy Hòa - Gành Đá Đĩa', 'slug' => 'tuy-hoa-ganh-da-dia', 'parent_slug' => 'khanh-hoa', 'is_popular' => false, 'description' => 'Xứ hoa vàng cỏ xanh với danh thắng Gành Đá Đĩa và Mũi Điện.'],

            // Tỉnh Lào Cai (bao gồm Yên Bái)
            ['name' => 'Sa Pa', 'slug' => 'sa-pa', 'parent_slug' => 'lao-cai', 'is_popular' => true, 'description' => 'Thị xã trong mây dưới chân đỉnh Fansipan, ruộng bậc thang Mường Hoa.'],
            ['name' => 'Mù Cang Chải', 'slug' => 'mu-cang-chai', 'parent_slug' => 'lao-cai', 'is_popular' => true, 'description' => 'Danh thắng quốc gia ruộng bậc thang kỳ vĩ mùa lúa chín.'],

            // Tỉnh Tuyên Quang (bao gồm Hà Giang)
            ['name' => 'Cao nguyên đá Đồng Văn', 'slug' => 'dong-van', 'parent_slug' => 'tuyen-quang', 'is_popular' => true, 'description' => 'Công viên địa chất toàn cầu với đèo Mã Pí Lèng và Sông Nho Quế.'],

            // Tỉnh Quảng Ninh & TP Hải Phòng
            ['name' => 'Vịnh Hạ Long', 'slug' => 'vinh-ha-long', 'parent_slug' => 'quang-ninh', 'is_popular' => true, 'description' => 'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ.'],
            ['name' => 'Đảo Cô Tô', 'slug' => 'co-to', 'parent_slug' => 'quang-ninh', 'is_popular' => false, 'description' => 'Hòn đảo thanh bình với Bãi Đá Cầu Mỵ và hải đăng Cô Tô.'],
            ['name' => 'Đảo Cát Bà', 'slug' => 'cat-ba', 'parent_slug' => 'hai-phong', 'is_popular' => true, 'description' => 'Đảo ngọc vịnh Bắc Bộ gắn liền với Vịnh Lan Hạ và Vườn quốc gia Cát Bà.'],

            // Tỉnh Ninh Bình
            ['name' => 'Tràng An - Tam Cốc', 'slug' => 'trang-an-tam-coc', 'parent_slug' => 'ninh-binh', 'is_popular' => true, 'description' => 'Quần thể danh thắng di sản kép thế giới giữa non nước hữu tình.'],

            // Tỉnh Quảng Trị (bao gồm Quảng Bình)
            ['name' => 'Phong Nha - Kẻ Bàng', 'slug' => 'phong-nha-ke-bang', 'parent_slug' => 'quang-tri', 'is_popular' => true, 'description' => 'Vương quốc hang động thế giới với Động Phong Nha, Thiên Đường và Sơn Đoòng.'],

            // Tỉnh Quảng Ngãi (bao gồm Bình Định)
            ['name' => 'Quy Nhơn - Kỳ Co', 'slug' => 'quy-nhon-ky-co', 'parent_slug' => 'quang-ngai', 'is_popular' => true, 'description' => 'Thiên đường biển Eo Gió - Kỳ Co với làn nước trong xanh.'],
            ['name' => 'Đảo Lý Sơn', 'slug' => 'ly-son', 'parent_slug' => 'quang-ngai', 'is_popular' => true, 'description' => 'Vương quốc tỏi và miệng núi lửa cổ giữa biển Đông.'],

            // TP Hồ Chí Minh (bao gồm Bà Rịa - Vũng Tàu)
            ['name' => 'Vũng Tàu', 'slug' => 'vung-tau', 'parent_slug' => 'tp-ho-chi-minh', 'is_popular' => true, 'description' => 'Thành phố biển nghỉ dưỡng cuối tuần sôi động gần trung tâm TP.HCM.'],
            ['name' => 'Côn Đảo', 'slug' => 'con-dao', 'parent_slug' => 'tp-ho-chi-minh', 'is_popular' => true, 'description' => 'Hòn đảo linh thiêng với thiên nhiên hoang sơ và hệ sinh thái biển phong phú.'],

            // Tỉnh Sơn La & Tỉnh Phú Thọ (bao gồm Vĩnh Phúc, Hòa Bình)
            ['name' => 'Mộc Châu', 'slug' => 'moc-chau', 'parent_slug' => 'son-la', 'is_popular' => true, 'description' => 'Cao nguyên xanh với đồi chè trái tim, thác Dải Yếm và mùa hoa mận trắng.'],
            ['name' => 'Tam Đảo', 'slug' => 'tam-dao', 'parent_slug' => 'phu-tho', 'is_popular' => true, 'description' => 'Thị trấn mờ sương mát mẻ quanh năm ngay gần Hà Nội.'],
            ['name' => 'Mai Châu', 'slug' => 'mai-chau', 'parent_slug' => 'phu-tho', 'is_popular' => true, 'description' => 'Thung lũng bình yên với bản Lác, ruộng lúa và nhà sàn dân tộc Thái.'],

            // Tỉnh Gia Lai (bao gồm Kon Tum) & Đắk Lắk (bao gồm Đắk Nông)
            ['name' => 'Măng Đen', 'slug' => 'mang-den', 'parent_slug' => 'gia-lai', 'is_popular' => true, 'description' => 'Thị trấn rừng thông và thác nước được mệnh danh là Đà Lạt thứ hai.'],
            ['name' => 'Hồ Tà Đùng', 'slug' => 'ta-dung', 'parent_slug' => 'dak-lak', 'is_popular' => false, 'description' => 'Vịnh Hạ Long của Tây Nguyên với hàng chục hòn đảo lớn nhỏ trên mặt hồ.'],
        ];

        foreach ($subLocations as $sub) {
            Location::updateOrCreate(
                ['slug' => $sub['slug']],
                [
                    'name' => $sub['name'],
                    'parent_id' => $provinceMap[$sub['parent_slug']] ?? null,
                    'country_code' => 'VN',
                    'description' => $sub['description'],
                    'is_popular' => $sub['is_popular'],
                ]
            );
        }
    }
}
