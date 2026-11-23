<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Khởi tạo tài khoản mẫu cho 3 vai trò: Admin, Provider, Tourist.
     */
    public function run(): void
    {
        // 0. Seed dữ liệu danh mục, địa điểm, loại hình kinh doanh, tiện nghi & bao gồm/không bao gồm
        $this->call([
            BusinessTypeSeeder::class,
            CategorySeeder::class,
            LocationSeeder::class,
            AmenitySeeder::class,
            ServiceInclusionSeeder::class,
            ServicePolicySeeder::class,
            HolidayCampaignSeeder::class,
            DemoMarketplaceSeeder::class,
        ]);
    }
}
