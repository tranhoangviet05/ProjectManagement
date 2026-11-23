<?php

namespace Database\Seeders;

use App\Models\HolidayCampaign;
use Illuminate\Database\Seeder;

class HolidayCampaignSeeder extends Seeder
{
    /**
     * Khởi tạo dữ liệu Chương trình khuyến mãi ngày lễ (gồm chiến dịch đang mở, bản nháp và đã qua để mở lại).
     */
    public function run(): void
    {
        $now = now();

        $campaigns = [
            [
                'name' => 'Black Friday Siêu Sale Du Lịch',
                'slug' => 'black-friday-sieu-sale-du-lich',
                'badge_text' => 'Black Friday -25%',
                'banner_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                'description' => 'Tuần lễ săn deal du lịch lớn nhất năm — giảm tối thiểu 25% cho hàng loạt khách sạn, villa và tour biển đảo.',
                'discount_type' => 'percent',
                'discount_value' => 25,
                'max_discount' => 1500000,
                'starts_at' => $now->copy()->subDays(2)->startOfDay(),
                'ends_at' => $now->copy()->addDays(10)->endOfDay(),
                'priority' => 100,
                'status' => 'active',
            ],
            [
                'name' => 'Cuối tuần vui vẻ – Xách balo lên và đi',
                'slug' => 'cuoi-tuan-vui-ve',
                'badge_text' => 'Cuối tuần -15%',
                'banner_url' => 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
                'description' => 'Ưu đãi nghỉ dưỡng cuối tuần và thuê xe di chuyển linh hoạt cho mọi gia đình và nhóm bạn.',
                'discount_type' => 'percent',
                'discount_value' => 15,
                'max_discount' => 800000,
                'starts_at' => $now->copy()->subDay()->startOfDay(),
                'ends_at' => $now->copy()->addDays(14)->endOfDay(),
                'priority' => 80,
                'status' => 'active',
            ],
            [
                'name' => 'Lễ Valentine Ngọt Ngào',
                'slug' => 'le-valentine-ngot-ngao',
                'badge_text' => 'Valentine -20%',
                'banner_url' => 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?auto=format&fit=crop&w=1200&q=80',
                'description' => 'Gói nghỉ dưỡng lãng mạn và du thuyền hoàng hôn dành riêng cho các cặp đôi dịp 14/02.',
                'discount_type' => 'percent',
                'discount_value' => 20,
                'max_discount' => 1000000,
                'starts_at' => $now->copy()->addMonths(2)->startOfDay(),
                'ends_at' => $now->copy()->addMonths(2)->addDays(7)->endOfDay(),
                'priority' => 60,
                'status' => 'draft',
            ],
            [
                'name' => 'Chào Hè Rực Rỡ 30/4 – 1/5',
                'slug' => 'chao-he-ruc-ro-30-4',
                'badge_text' => 'Đại lễ -20%',
                'banner_url' => 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
                'description' => 'Chương trình khuyến mãi kỳ nghỉ lễ 30/4 – 1/5 trên toàn quốc (có thể mở lại cho mùa lễ tiếp theo).',
                'discount_type' => 'percent',
                'discount_value' => 20,
                'max_discount' => 1200000,
                'starts_at' => $now->copy()->subMonths(6)->startOfDay(),
                'ends_at' => $now->copy()->subMonths(6)->addDays(10)->endOfDay(),
                'priority' => 70,
                'status' => 'ended',
            ],
        ];

        foreach ($campaigns as $campaign) {
            HolidayCampaign::updateOrCreate(
                ['slug' => $campaign['slug']],
                $campaign
            );
        }
    }
}
