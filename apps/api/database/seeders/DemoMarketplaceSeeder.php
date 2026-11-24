<?php

namespace Database\Seeders;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\BusinessType;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\HolidayCampaign;
use App\Models\HotelRoomType;
use App\Models\Location;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServiceAvailability;
use App\Models\ServiceMedia;
use App\Models\ServicePolicy;
use App\Models\ServicePromotion;
use App\Models\ServiceSchedule;
use App\Models\User;
use App\Models\UserCoupon;
use App\Services\AuthService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoMarketplaceSeeder extends Seeder
{
    private const DEFAULT_PASSWORD = 'Password@123';

    public function run(): void
    {
        $authService = app(AuthService::class);

        // 1. Tạo / đồng bộ 1 Admin & 1 Tourist qua Firebase Auth -> PostgreSQL
        $admin = $this->upsertFirebaseAccount(
            $authService,
            'admin@gmail.com',
            'Admin@123',
            UserRole::Admin->value,
            ['name' => 'Ban Quản Trị Hệ Thống']
        );

        $this->upsertFirebaseAccount(
            $authService,
            'tranhoangviet@gmail.com',
            'Tranhoangviet@2005',
            UserRole::Tourist->value,
            [
                'name' => 'Trần Hoàng Việt',
                'phone' => '0905888999',
            ]
        );

        // Nạp danh mục & địa điểm chuẩn
        $businessTypes = BusinessType::all()->keyBy('slug');
        $categories = Category::all()->keyBy('slug');
        $locations = Location::all()->keyBy('slug');
        $policies = ServicePolicy::all()->keyBy('slug');

        // 2. Tạo 10 Providers đồng bộ Firebase Auth (3 Chỗ ở, 3 Giải trí, 2 Thuê xe, 2 Vé tàu)
        $providerSpecs = [
            // ── 3 Providers Chỗ ở ──
            [
                'key' => 'accom_danang',
                'email' => 'provider.danang.resort@stb.vn',
                'name' => 'Nguyễn Minh Hải',
                'business_name' => 'Đà Nẵng Ocean Retreat & Villas',
                'business_type_slug' => 'resort',
                'phone' => '0905111201',
                'address' => '218 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng',
                'description' => 'Hệ thống khu nghỉ dưỡng & biệt thự ven biển Mỹ Khê và bán đảo Sơn Trà đạt chuẩn 5 sao.',
            ],
            [
                'key' => 'accom_dalat',
                'email' => 'provider.dalat.homestay@stb.vn',
                'name' => 'Lê Thảo Nguyên',
                'business_name' => 'Đà Lạt Pine & Cloud Homestay',
                'business_type_slug' => 'homestay',
                'phone' => '0905111202',
                'address' => '45 Đặng Thái Thân, Phường 3, Đà Lạt',
                'description' => 'Chuỗi homestay gỗ giữa rừng thông Đà Lạt và villa thung lũng thân thiện với thú cưng.',
            ],
            [
                'key' => 'accom_phuquoc',
                'email' => 'provider.phuquoc.hotel@stb.vn',
                'name' => 'Phạm Quốc Bảo',
                'business_name' => 'Phú Quốc Pearl Boutique Hotel',
                'business_type_slug' => 'khach-san',
                'phone' => '0905111203',
                'address' => '112 Trần Hưng Đạo, Dương Đông, Phú Quốc',
                'description' => 'Khách sạn boutique trung tâm Phú Quốc và tổ hợp lưu trú ngắm hoàng hôn Bãi Trường.',
            ],

            // ── 3 Providers Giải trí & Tour ──
            [
                'key' => 'tour_nhatrang',
                'email' => 'provider.nhatrang.tour@stb.vn',
                'name' => 'Trần Khánh Linh',
                'business_name' => 'Nha Trang Coral & Island Discovery',
                'business_type_slug' => 'tour-du-lich-trai-nghiem',
                'phone' => '0905111301',
                'address' => '68 Trần Phú, Lộc Thọ, Nha Trang',
                'description' => 'Đơn vị tổ chức tour 3 đảo, lặn ngắm san hô Hòn Mun và du thuyền vịnh Nha Trang.',
            ],
            [
                'key' => 'tour_sapa',
                'email' => 'provider.sapa.trekking@stb.vn',
                'name' => 'Vũ Hoàng Sơn',
                'business_name' => 'Sa Pa Summit & Cloud Trekking',
                'business_type_slug' => 'tour-du-lich-trai-nghiem',
                'phone' => '0905111302',
                'address' => '24 Cầu Mây, Thị xã Sa Pa, Lào Cai',
                'description' => 'Chuyên tour chinh phục đỉnh núi Tây Bắc, săn mây Tà Xùa – Sa Pa và trải nghiệm bản làng.',
            ],
            [
                'key' => 'tour_hoian',
                'email' => 'provider.hoian.heritage@stb.vn',
                'name' => 'Đặng Thu Hà',
                'business_name' => 'Hội An Lantern & Culinary Studio',
                'business_type_slug' => 'tour-du-lich-trai-nghiem',
                'phone' => '0905111303',
                'address' => '82 Bạch Đằng, Minh An, Hội An',
                'description' => 'Food tour phố cổ, workshop làm đèn lồng truyền thống và khám phá Cố đô Huế.',
            ],

            // ── 2 Providers Thuê xe ──
            [
                'key' => 'vehicle_central',
                'email' => 'provider.central.car@stb.vn',
                'name' => 'Hoàng Gia Huy',
                'business_name' => 'Miền Trung Auto & Airport Transfer',
                'business_type_slug' => 'phuong-tien-di-chuyen',
                'phone' => '0905111401',
                'address' => '150 Nguyễn Hữu Thọ, Hải Châu, Đà Nẵng',
                'description' => 'Cho thuê ô tô tự lái đời mới, xe 7 chỗ có tài xế và đưa đón sân bay Đà Nẵng – Hội An – Huế.',
            ],
            [
                'key' => 'vehicle_highland',
                'email' => 'provider.highland.moto@stb.vn',
                'name' => 'Ngô Anh Tuấn',
                'business_name' => 'Cao Nguyên Moto & Touring Rental',
                'business_type_slug' => 'phuong-tien-di-chuyen',
                'phone' => '0905111402',
                'address' => '19 Bùi Thị Xuân, Phường 2, Đà Lạt',
                'description' => 'Cho thuê xe máy tay ga, xe côn tay phượt đèo và xe điện tham quan Đà Lạt, Phú Quốc.',
            ],

            // ── 2 Providers Vé tàu ──
            [
                'key' => 'train_heritage',
                'email' => 'provider.heritage.train@stb.vn',
                'name' => 'Lý Thanh Tùng',
                'business_name' => 'Đoàn Tàu Di Sản Miền Trung (SJourney)',
                'business_type_slug' => 've-tau',
                'phone' => '0905111501',
                'address' => '202 Hải Phòng, Thanh Khê, Đà Nẵng',
                'description' => 'Đại lý chính thức tuyến tàu kết nối di sản Huế – Đà Nẵng qua đèo Hải Vân và tuyến Bắc – Nam.',
            ],
            [
                'key' => 'train_express',
                'email' => 'provider.sapa.express@stb.vn',
                'name' => 'Bùi Ngọc Mai',
                'business_name' => 'Chapa & Victoria Express Train',
                'business_type_slug' => 've-tau',
                'phone' => '0905111502',
                'address' => '120 Lê Duẩn, Hoàn Kiếm, Hà Nội',
                'description' => 'Toa tàu giường nằm hạng sang Hà Nội – Lào Cai (Sa Pa) và khoang VIP tuyến Hà Nội – Ninh Bình.',
            ],
        ];

        $providers = [];
        foreach ($providerSpecs as $spec) {
            $bt = $businessTypes->get($spec['business_type_slug']);
            $user = $this->upsertFirebaseAccount(
                $authService,
                $spec['email'],
                self::DEFAULT_PASSWORD,
                UserRole::Provider->value,
                [
                    'name' => $spec['name'],
                    'business_name' => $spec['business_name'],
                    'business_type_id' => $bt?->id,
                    'phone' => $spec['phone'],
                    'address' => $spec['address'],
                ]
            );

            $profile = ProviderProfile::where('user_id', $user->id)->firstOrFail();
            $profile->update([
                'business_name' => $spec['business_name'],
                'representative_name' => $spec['name'],
                'business_type_id' => $bt?->id,
                'phone' => $spec['phone'],
                'address' => $spec['address'],
                'description' => $spec['description'],
                'status' => ProviderStatus::Approved->value,
                'approved_by' => $admin->id,
                'approved_at' => now(),
            ]);

            $providers[$spec['key']] = $profile;
        }

        // 3. Tạo danh sách dịch vụ phong phú & logic theo đúng Loại hình kinh doanh của từng Provider
        $servicesData = $this->buildServicesCatalog();
        $createdServices = [];

        foreach ($servicesData as $svcSpec) {
            $provider = $providers[$svcSpec['provider_key']];
            $category = $categories->get($svcSpec['category_slug']) ?? $categories->first();
            $location = $locations->get($svcSpec['location_slug']) ?? $locations->first();

            $service = Service::updateOrCreate(
                ['slug' => $svcSpec['slug']],
                [
                    'provider_id' => $provider->id,
                    'category_id' => $category->id,
                    'location_id' => $location->id,
                    'name' => $svcSpec['name'],
                    'description' => $svcSpec['description'],
                    'type' => $svcSpec['type'],
                    'status' => ServiceStatus::Active->value,
                    'base_price' => $svcSpec['base_price'],
                    'price_unit' => $svcSpec['price_unit'],
                    'address' => $svcSpec['address'],
                    'amenities' => $svcSpec['amenities'],
                    'includes' => $svcSpec['includes'],
                    'excludes' => $svcSpec['excludes'],
                    'rating_avg' => $svcSpec['rating_avg'],
                    'total_bookings' => $svcSpec['total_bookings'],
                ]
            );

            // Media (ảnh bìa + ảnh phụ)
            $service->media()->delete();
            foreach ($svcSpec['images'] as $idx => $url) {
                ServiceMedia::create([
                    'service_id' => $service->id,
                    'url' => $url,
                    'type' => 'image',
                    'is_cover' => $idx === 0,
                    'sort_order' => $idx,
                ]);
            }

            // Gắn chính sách phù hợp theo loại hình
            $policyIds = collect($svcSpec['policy_slugs'])
                ->map(fn (string $slug) => $policies->get($slug)?->id)
                ->filter()
                ->values()
                ->all();
            if (! empty($policyIds)) {
                $service->policies()->sync($policyIds);
            }

            // Hạng phòng (cho Chỗ ở)
            if (! empty($svcSpec['rooms'])) {
                $service->roomTypes()->delete();
                foreach ($svcSpec['rooms'] as $room) {
                    HotelRoomType::create([
                        'service_id' => $service->id,
                        'name' => $room['name'],
                        'rank' => $room['rank'],
                        'description' => $room['description'],
                        'base_price' => $room['base_price'],
                        'total_rooms' => $room['inventory'],
                        'inventory' => $room['inventory'],
                        'capacity_adults' => $room['capacity_adults'],
                        'capacity_children' => $room['capacity_children'],
                        'amenities' => $room['amenities'],
                        'images' => [$svcSpec['images'][0]],
                        'status' => 'active',
                    ]);
                }
            }

            // Lịch trình theo ngày (cho Tour)
            if (! empty($svcSpec['schedules'])) {
                $service->schedules()->delete();
                foreach ($svcSpec['schedules'] as $sch) {
                    ServiceSchedule::create([
                        'service_id' => $service->id,
                        'day_number' => $sch['day_number'],
                        'title' => $sch['title'],
                        'description' => $sch['description'],
                        'activities' => $sch['activities'],
                    ]);
                }
            }

            // Chỉ tạo lịch trống & giá theo ngày cho Giải trí (tour) và Vé tàu
            $isTicketService = $svcSpec['type'] === 'tour' || str_contains($svcSpec['category_slug'], 'tau');
            if ($isTicketService) {
                $slots = $svcSpec['daily_slots'] ?? 10;
                for ($d = 0; $d < 14; $d++) {
                    $date = now()->addDays($d)->format('Y-m-d');
                    ServiceAvailability::updateOrCreate(
                        ['service_id' => $service->id, 'available_date' => $date],
                        [
                            'total_slots' => $slots,
                            'booked_slots' => 0,
                            'is_blocked' => false,
                        ]
                    );
                }
            }

            $createdServices[$svcSpec['slug']] = $service;
        }

        // 4. Gắn một số dịch vụ tiêu biểu tham gia Chiến dịch khuyến mãi đang mở (chỉ 1 chiến dịch / dịch vụ)
        $activeCampaign = HolidayCampaign::where('status', 'active')
            ->orderByDesc('priority')
            ->first();

        if ($activeCampaign) {
            $promoTargets = [
                'danang-ocean-retreat-villa' => 22,
                'phu-quoc-pearl-boutique-resort' => 15,
                'nha-trang-hon-mun-coral-diving' => 25,
                'sapa-fansipan-cloud-hunting-2n1d' => 18,
                'mien-trung-sedan-tu-lai-4-cho' => 15,
                'doan-tau-di-san-hue-da-nang-vip' => 20,
            ];

            foreach ($promoTargets as $slug => $discountVal) {
                $svc = $createdServices[$slug] ?? null;
                if (! $svc) {
                    continue;
                }
                ServicePromotion::updateOrCreate(
                    [
                        'holiday_campaign_id' => $activeCampaign->id,
                        'service_id' => $svc->id,
                    ],
                    [
                        'discount_type' => 'percent',
                        'discount_value' => $discountVal,
                        'is_active' => true,
                    ]
                );
            }
        }

        // 5. Tạo Coupon mẫu (công khai & riêng tư) để test Booking Engine
        Coupon::updateOrCreate(
            ['code' => 'WELCOME100K'],
            [
                'visibility' => 'public',
                'type' => 'fixed',
                'discount_value' => 100000,
                'min_order_amount' => 500000,
                'usage_limit' => 200,
                'per_user_limit' => 2,
                'valid_from' => now()->subDays(5),
                'valid_until' => now()->addMonths(3),
                'created_by' => $admin->id,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'TRAVEL10'],
            [
                'visibility' => 'public',
                'type' => 'percent',
                'discount_value' => 10,
                'min_order_amount' => 300000,
                'usage_limit' => 500,
                'per_user_limit' => 3,
                'valid_from' => now()->subDays(5),
                'valid_until' => now()->addMonths(3),
                'created_by' => $admin->id,
            ]
        );

        $vipCoupon = Coupon::updateOrCreate(
            ['code' => 'VIPGIFT25'],
            [
                'visibility' => 'private',
                'type' => 'percent',
                'discount_value' => 25,
                'min_order_amount' => 400000,
                'usage_limit' => 50,
                'per_user_limit' => 1,
                'valid_from' => now()->subDays(5),
                'valid_until' => now()->addMonths(3),
                'created_by' => $admin->id,
            ]
        );

        $sampleTourists = User::where('role', 'tourist')->limit(3)->get();
        foreach ($sampleTourists as $sampleTourist) {
            UserCoupon::updateOrCreate(
                [
                    'coupon_id' => $vipCoupon->id,
                    'user_id' => $sampleTourist->id,
                ],
                [
                    'granted_by' => $admin->id,
                    'note' => 'Quà tặng riêng tư dành cho thành viên trải nghiệm Booking Engine',
                    'granted_at' => now(),
                ]
            );
        }
    }

    private function upsertFirebaseAccount(
        AuthService $authService,
        string $email,
        string $password,
        string $role,
        array $ecosystemData = []
    ): User {
        $firebaseUid = $authService->syncWithFirebaseAdmin($email, $password);

        $user = User::firstOrNew(['email' => $email]);
        if ($firebaseUid) {
            $user->firebase_uid = $firebaseUid;
        }
        $user->password = Hash::make($password);
        $user->role = $role;
        $user->status = UserStatus::Active->value;
        $user->social_active = true;
        $user->save();

        $authService->ensureUserEcosystem($user, $ecosystemData);

        return $user;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildServicesCatalog(): array
    {
        return [
            // ═══════════════════════════════════════════════════════
            // 1. ACCOMMODATION PROVIDER 1: Đà Nẵng Ocean Retreat & Villas
            // ═══════════════════════════════════════════════════════
            [
                'provider_key' => 'accom_danang',
                'type' => 'hotel',
                'category_slug' => 'khach-san-khu-nghi-duong',
                'location_slug' => 'da-nang',
                'name' => 'Đà Nẵng Ocean Retreat Resort & Spa 5 Sao',
                'slug' => 'danang-ocean-retreat-villa',
                'address' => '218 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng',
                'base_price' => 2450000,
                'price_unit' => 'night',
                'rating_avg' => 4.9,
                'total_bookings' => 186,
                'daily_slots' => 8,
                'description' => 'Khu nghỉ dưỡng 5 sao mặt biển Mỹ Khê với hồ bơi vô cực tràn bờ, spa trị liệu thảo mộc và ẩm thực hải sản cao cấp.',
                'amenities' => ['Hồ bơi vô cực', 'Bãi biển riêng', 'Wi-Fi tốc độ cao', 'Buffet sáng', 'Spa & Sauna', 'Phòng Gym'],
                'includes' => ['Bữa sáng buffet quốc tế', 'Đồ uống chào mừng', 'Sử dụng hồ bơi & gym miễn phí'],
                'excludes' => ['Dịch vụ giặt ủi', 'Đưa đón sân bay ngoài giờ'],
                'policy_slugs' => ['dat-coc-giu-cho-30', 'mien-phi-huy-phong-truoc-48-gio', 'nhan-phong-14h-tra-phong-12h', 'khong-mang-theo-thu-cung'],
                'images' => [
                    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
                ],
                'rooms' => [
                    [
                        'name' => 'Deluxe Ocean View',
                        'rank' => 'Hạng Tiêu chuẩn',
                        'description' => 'Phòng 42m² ban công hướng biển Mỹ Khê, bồn tắm nằm thư giãn.',
                        'base_price' => 2450000,
                        'inventory' => 6,
                        'capacity_adults' => 2,
                        'capacity_children' => 1,
                        'amenities' => ['Ban công hướng biển', 'Bồn tắm nằm', 'Smart TV 55 inch'],
                    ],
                    [
                        'name' => 'Oceanfront Pool Villa',
                        'rank' => 'Hạng Cao cấp',
                        'description' => 'Biệt thự 120m² có hồ bơi riêng sát biển và quản gia phục vụ 24/7.',
                        'base_price' => 5200000,
                        'inventory' => 2,
                        'capacity_adults' => 4,
                        'capacity_children' => 2,
                        'amenities' => ['Hồ bơi riêng', 'Bếp nhỏ', 'Quản gia riêng'],
                    ],
                ],
            ],
            [
                'provider_key' => 'accom_danang',
                'type' => 'hotel',
                'category_slug' => 'nghi-duong-chua-lanh-wellness',
                'location_slug' => 'da-nang',
                'name' => 'Sơn Trà Cliffside Wellness Hotel',
                'slug' => 'son-tra-cliffside-wellness-hotel',
                'address' => 'Bãi Bụt, Bán đảo Sơn Trà, Đà Nẵng',
                'base_price' => 1850000,
                'price_unit' => 'night',
                'rating_avg' => 4.8,
                'total_bookings' => 94,
                'daily_slots' => 6,
                'description' => 'Khách sạn nghỉ dưỡng yên tĩnh nép mình bên sườn núi Sơn Trà, hướng thẳng ra vịnh Đà Nẵng.',
                'amenities' => ['Yoga sáng', 'Hồ bơi nước mặn', 'Wi-Fi tốc độ cao', 'Bãi đỗ xe miễn phí'],
                'includes' => ['Lớp Yoga & Thiền buổi sáng', 'Trà thảo mộc detox mỗi ngày'],
                'excludes' => ['Liệu trình spa chuyên sâu'],
                'policy_slugs' => ['dat-coc-giu-cho-30', 'nhan-phong-14h-tra-phong-12h', 'cho-phep-mang-theo-thu-cung-co-phu-thu'],
                'images' => [
                    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
                ],
                'rooms' => [
                    [
                        'name' => 'Forest & Bay Suite',
                        'rank' => 'Hạng Suite',
                        'description' => 'Không gian 55m² hòa mình với thiên nhiên Sơn Trà, cửa kính toàn cảnh.',
                        'base_price' => 1850000,
                        'inventory' => 6,
                        'capacity_adults' => 2,
                        'capacity_children' => 1,
                        'amenities' => ['Cửa kính toàn cảnh', 'Ban công gỗ', 'Máy lọc không khí'],
                    ],
                ],
            ],
            [
                'provider_key' => 'accom_danang',
                'type' => 'hotel',
                'category_slug' => 'khach-san-khu-nghi-duong',
                'location_slug' => 'hoi-an',
                'name' => 'An Bàng Beach Boutique Resort',
                'slug' => 'an-bang-beach-boutique-resort',
                'address' => 'Biển An Bàng, Cẩm An, Hội An',
                'base_price' => 1620000,
                'price_unit' => 'night',
                'rating_avg' => 4.7,
                'total_bookings' => 112,
                'daily_slots' => 7,
                'description' => 'Khu nghỉ dưỡng phong cách Đông Dương cách biển An Bàng 50m, có xe đạp miễn phí dạo phố cổ.',
                'amenities' => ['Hồ bơi sân vườn', 'Xe đạp miễn phí', 'Wi-Fi miễn phí', 'Nhà hàng sân vườn'],
                'includes' => ['Bữa sáng kiểu Hội An', 'Xe đạp tham quan phố cổ'],
                'excludes' => ['Vé tham quan phố cổ'],
                'policy_slugs' => ['thanh-toan-khi-nhan-phong', 'mien-phi-huy-phong-truoc-48-gio', 'nhan-phong-14h-tra-phong-12h'],
                'images' => [
                    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
                ],
                'rooms' => [
                    [
                        'name' => 'Garden Bungalow',
                        'rank' => 'Bungalow',
                        'description' => 'Nhà gỗ mái ngói riêng tư giữa vườn dừa xanh mát.',
                        'base_price' => 1620000,
                        'inventory' => 7,
                        'capacity_adults' => 2,
                        'capacity_children' => 1,
                        'amenities' => ['Hiên nhà riêng', 'Vòi sen ngoài trời', 'Điều hòa 2 chiều'],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════════════
            // 2. ACCOMMODATION PROVIDER 2: Đà Lạt Pine & Cloud Homestay
            // ═══════════════════════════════════════════════════════
            [
                'provider_key' => 'accom_dalat',
                'type' => 'homestay',
                'category_slug' => 'homestay-villa-bungalow',
                'location_slug' => 'da-lat',
                'name' => 'Đà Lạt Pine Hill Wooden Homestay',
                'slug' => 'da-lat-pine-hill-wooden-homestay',
                'address' => '45 Đặng Thái Thân, Phường 3, Đà Lạt',
                'base_price' => 890000,
                'price_unit' => 'night',
                'rating_avg' => 4.9,
                'total_bookings' => 235,
                'daily_slots' => 5,
                'description' => 'Homestay nhà gỗ thông ấm cúng view thung lũng săn mây buổi sớm, có sân vườn BBQ rộng rãi và đón thú cưng.',
                'amenities' => ['View đồi thông', 'Sân BBQ ngoài trời', 'Thân thiện thú cưng', 'Bếp chung đầy đủ'],
                'includes' => ['Cà phê Arabica Cầu Đất mỗi sáng', 'Bộ dụng cụ BBQ than hoa'],
                'excludes' => ['Nguyên liệu nướng BBQ'],
                'policy_slugs' => ['dat-coc-giu-cho-30', 'cho-phep-mang-theo-thu-cung-co-phu-thu', 'mien-phi-huy-phong-truoc-48-gio', 'nhan-phong-14h-tra-phong-12h'],
                'images' => [
                    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
                ],
                'rooms' => [
                    [
                        'name' => 'Nhà Gỗ Rừng Thông (2 Khách)',
                        'rank' => 'Cabin Đôi',
                        'description' => 'Cabin gỗ kính lớn nhìn thẳng ra rừng thông sương mù.',
                        'base_price' => 890000,
                        'inventory' => 3,
                        'capacity_adults' => 2,
                        'capacity_children' => 1,
                        'amenities' => ['Lò sưởi điện', 'Ban công săn mây', 'Nước nóng năng lượng mặt trời'],
                    ],
                    [
                        'name' => 'Gác Mái Gia Đình (4 Khách)',
                        'rank' => 'Family Loft',
                        'description' => 'Phòng áp mái ấm áp với 2 giường đôi cho nhóm bạn hoặc gia đình.',
                        'base_price' => 1450000,
                        'inventory' => 2,
                        'capacity_adults' => 4,
                        'capacity_children' => 2,
                        'amenities' => ['2 giường Queen', 'Bàn trà cửa sổ', 'Khu chơi thú cưng'],
                    ],
                ],
            ],
            [
                'provider_key' => 'accom_dalat',
                'type' => 'homestay',
                'category_slug' => 'homestay-villa-bungalow',
                'location_slug' => 'da-lat',
                'name' => 'Mây Lang Thang Valley Villa',
                'slug' => 'may-lang-thang-valley-villa',
                'address' => 'Hẻm 18 Hoàng Hoa Thám, Phường 10, Đà Lạt',
                'base_price' => 1950000,
                'price_unit' => 'night',
                'rating_avg' => 4.8,
                'total_bookings' => 78,
                'daily_slots' => 4,
                'description' => 'Villa nguyên căn phong cách Bắc Âu nằm giữa vườn hoa cẩm tú cầu, có sân cỏ riêng cho cún cưng chạy nhảy.',
                'amenities' => ['Villa nguyên căn', 'Bếp nướng BBQ', 'Thân thiện thú cưng', 'Chỗ đậu ô tô'],
                'includes' => ['Dọn phòng hằng ngày', 'Bếp đầy đủ gia vị cơ bản'],
                'excludes' => ['Phụ thu dọn dẹp thú cưng'],
                'policy_slugs' => ['dat-coc-giu-cho-30', 'cho-phep-mang-theo-thu-cung-co-phu-thu', 'nhan-phong-14h-tra-phong-12h'],
                'images' => [
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
                ],
                'rooms' => [
                    [
                        'name' => 'Nordic Garden Villa (6 Khách)',
                        'rank' => 'Nguyên căn 3PN',
                        'description' => '3 phòng ngủ khép kín, phòng khách lớn có lò sưởi củi.',
                        'base_price' => 1950000,
                        'inventory' => 4,
                        'capacity_adults' => 6,
                        'capacity_children' => 2,
                        'amenities' => ['3 phòng ngủ', 'Sân vườn 200m²', 'Smart TV Netflix'],
                    ],
                ],
            ],
            [
                'provider_key' => 'accom_dalat',
                'type' => 'homestay',
                'category_slug' => 'trekking-cam-trai-san-may',
                'location_slug' => 'sa-pa',
                'name' => 'Sa Pa Ta Van Cloud Eco-Lodge',
                'slug' => 'sapa-ta-van-cloud-eco-lodge',
                'address' => 'Thôn Tả Van Giáy, Xã Tả Van, Sa Pa',
                'base_price' => 1150000,
                'price_unit' => 'night',
                'rating_avg' => 4.8,
                'total_bookings' => 142,
                'daily_slots' => 6,
                'description' => 'Eco-lodge nằm trên ruộng bậc thang Tả Van, đón bình minh và biển mây ngay trước hiên phòng.',
                'amenities' => ['View ruộng bậc thang', 'Tắm lá thuốc Dao Đỏ', 'Wi-Fi miễn phí', 'Nhà hàng bản địa'],
                'includes' => ['Bữa sáng nóng theo mùa', 'Trà gừng mật ong chào mừng'],
                'excludes' => ['Dịch vụ tắm lá thuốc Dao Đỏ'],
                'policy_slugs' => ['thanh-toan-khi-nhan-phong', 'cho-phep-mang-theo-thu-cung-co-phu-thu', 'nhan-phong-14h-tra-phong-12h'],
                'images' => [
                    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
                ],
                'rooms' => [
                    [
                        'name' => 'Terrace View Bungalow',
                        'rank' => 'Bungalow',
                        'description' => 'Phòng tre gỗ truyền thống hướng thẳng thung lũng Mường Hoa.',
                        'base_price' => 1150000,
                        'inventory' => 6,
                        'capacity_adults' => 2,
                        'capacity_children' => 1,
                        'amenities' => ['Chăn điện sưởi ấm', 'Ban công thung lũng', 'Ấm siêu tốc'],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════════════
            // 3. ACCOMMODATION PROVIDER 3: Phú Quốc Pearl Boutique Hotel
            // ═══════════════════════════════════════════════════════
            [
                'provider_key' => 'accom_phuquoc',
                'type' => 'hotel',
                'category_slug' => 'khach-san-khu-nghi-duong',
                'location_slug' => 'phu-quoc',
                'name' => 'Phú Quốc Pearl Sunset Boutique Hotel',
                'slug' => 'phu-quoc-pearl-boutique-resort',
                'address' => '112 Trần Hưng Đạo, Dương Đông, Phú Quốc',
                'base_price' => 1750000,
                'price_unit' => 'night',
                'rating_avg' => 4.8,
                'total_bookings' => 165,
                'daily_slots' => 10,
                'description' => 'Khách sạn boutique ngay trung tâm Dương Đông, hồ bơi sân thượng ngắm hoàng hôn Bãi Trường tuyệt đẹp.',
                'amenities' => ['Hồ bơi sân thượng', 'Sky Bar', 'Đưa đón sân bay', 'Wi-Fi tốc độ cao'],
                'includes' => ['Bữa sáng buffet', 'Xe đón tiễn sân bay Phú Quốc 2 chiều'],
                'excludes' => ['Đồ uống tại Sky Bar'],
                'policy_slugs' => ['dat-coc-giu-cho-30', 'mien-phi-huy-phong-truoc-48-gio', 'nhan-phong-14h-tra-phong-12h', 'khong-mang-theo-thu-cung'],
                'images' => [
                    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
                ],
                'rooms' => [
                    [
                        'name' => 'Superior City & Sea',
                        'rank' => 'Tiêu chuẩn',
                        'description' => 'Phòng 35m² hiện đại, cửa sổ lớn đón gió biển.',
                        'base_price' => 1750000,
                        'inventory' => 6,
                        'capacity_adults' => 2,
                        'capacity_children' => 1,
                        'amenities' => ['Ban công', 'Minibar', 'Két sắt'],
                    ],
                    [
                        'name' => 'Sunset Horizon Suite',
                        'rank' => 'Cao cấp',
                        'description' => 'Phòng góc 60m² view biển trực diện ngắm hoàng hôn.',
                        'base_price' => 2890000,
                        'inventory' => 4,
                        'capacity_adults' => 3,
                        'capacity_children' => 1,
                        'amenities' => ['Bồn tắm view biển', 'Phòng khách riêng', 'Máy pha cà phê'],
                    ],
                ],
            ],
            [
                'provider_key' => 'accom_phuquoc',
                'type' => 'hotel',
                'category_slug' => 'khach-san-khu-nghi-duong',
                'location_slug' => 'ho-chi-minh',
                'name' => 'Saigon Heritage Central Hotel',
                'slug' => 'saigon-heritage-central-hotel',
                'address' => '54 Đồng Khởi, Bến Nghé, Quận 1, TP.HCM',
                'base_price' => 1580000,
                'price_unit' => 'night',
                'rating_avg' => 4.7,
                'total_bookings' => 210,
                'daily_slots' => 12,
                'description' => 'Khách sạn trung tâm Quận 1 cách Nhà hát Thành phố 2 phút đi bộ, thuận tiện công tác và khám phá ẩm thực Sài Gòn.',
                'amenities' => ['Trung tâm Quận 1', 'Phòng Gym 24/7', 'Wi-Fi tốc độ cao', 'Lễ tân 24h'],
                'includes' => ['Buffet sáng', 'Nước suối & trà mỗi ngày'],
                'excludes' => ['Bãi đậu xe qua đêm'],
                'policy_slugs' => ['dat-coc-giu-cho-30', 'nhan-phong-14h-tra-phong-12h', 'khong-hut-thuoc'],
                'images' => [
                    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
                ],
                'rooms' => [
                    [
                        'name' => 'Executive King',
                        'rank' => 'Executive',
                        'description' => 'Phòng doanh nhân 38m² bàn làm việc rộng và view đại lộ Đồng Khởi.',
                        'base_price' => 1580000,
                        'inventory' => 12,
                        'capacity_adults' => 2,
                        'capacity_children' => 1,
                        'amenities' => ['Bàn làm việc', 'Bồn tắm đứng', 'Cà phê viên nén'],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════════════
            // 4. ENTERTAINMENT PROVIDER 1: Nha Trang Coral & Island Discovery
            // ═══════════════════════════════════════════════════════
            [
                'provider_key' => 'tour_nhatrang',
                'type' => 'tour',
                'category_slug' => 'bien-dao-lan-ngam-san-ho',
                'location_slug' => 'nha-trang',
                'name' => 'Tour 3 Đảo Vịnh Nha Trang & Lặn San Hô Hòn Mun (Cano)',
                'slug' => 'nha-trang-hon-mun-coral-diving',
                'address' => 'Cảng Du Lịch Vĩnh Trường, Nha Trang',
                'base_price' => 690000,
                'price_unit' => 'person',
                'rating_avg' => 4.9,
                'total_bookings' => 340,
                'daily_slots' => 25,
                'description' => 'Hành trình cano cao tốc khám phá khu bảo tồn biển Hòn Mun, lặn ống thở ngắm rạn san hô rực rỡ và thưởng thức bữa trưa hải sản trên Làng Chài.',
                'amenities' => ['Cano cao tốc', 'Kính lặn & áo phao', 'Hướng dẫn viên bản địa', 'Bữa trưa hải sản'],
                'includes' => ['Xe đưa đón trung tâm Nha Trang', 'Cano cao tốc đời mới', 'Vé tham quan Hòn Mun', 'Bữa trưa thực đơn 8 món'],
                'excludes' => ['Lặn bình khí (Scuba Diving)', 'Chơi dù bay / Mô tô nước'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'mien-phi-huy-doi-ngay-24h', 'co-mat-truoc-30-phut'],
                'images' => [
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1200&q=80',
                ],
                'schedules' => [
                    [
                        'day_number' => 1,
                        'title' => 'Khám phá Hòn Mun – Làng Chài – Bãi Tranh (08:00 – 15:30)',
                        'description' => 'Đón khách tại khách sạn, di chuyển ra cảng Vĩnh Trường lên cano cao tốc.',
                        'activities' => ['08:30: Lặn ngắm san hô tại Hòn Mun', '11:30: Ăn trưa hải sản trên bè Làng Chài', '13:30: Tắm biển & thư giãn tại Bãi Tranh', '15:30: Trở về đất liền'],
                    ],
                ],
            ],
            [
                'provider_key' => 'tour_nhatrang',
                'type' => 'tour',
                'category_slug' => 'du-thuyen-the-thao-nuoc',
                'location_slug' => 'nha-trang',
                'name' => 'Du Thuyền Hoàng Hôn Vịnh Nha Trang & Tiệc Tối Nhạc Sống',
                'slug' => 'du-thuyen-hoang-hon-vinh-nha-trang',
                'address' => 'Bến Du Thuyền Ana Marina, Nha Trang',
                'base_price' => 1350000,
                'price_unit' => 'person',
                'rating_avg' => 4.8,
                'total_bookings' => 128,
                'daily_slots' => 20,
                'description' => 'Thưởng thức cocktail hoàng hôn trên boong tàu 5 sao, tiệc tối hải sản tôm hùm và nhạc Acoustic giữa vịnh biển.',
                'amenities' => ['Du thuyền 5 sao', 'Tiệc tối tôm hùm', 'Nhạc sống Acoustic', 'Đồ uống không giới hạn'],
                'includes' => ['Cocktail chào mừng', 'Bữa tối set menu 5 món kèm nửa con tôm hùm', 'Bảo hiểm du lịch'],
                'excludes' => ['Chi phí di chuyển ngoài khu vực trung tâm'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'mien-phi-huy-doi-ngay-24h', 'co-mat-truoc-30-phut'],
                'images' => [
                    'https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1500514966906-fe245eea9344?auto=format&fit=crop&w=1200&q=80',
                ],
                'schedules' => [
                    [
                        'day_number' => 1,
                        'title' => 'Du ngoạn hoàng hôn & Tiệc tối trên vịnh (16:30 – 20:30)',
                        'description' => 'Check-in bến du thuyền Ana Marina lúc 16:30.',
                        'activities' => ['17:00: Ngắm hoàng hôn & thưởng thức Canapé', '18:30: Dùng tiệc tối ánh nến với nhạc sống', '20:30: Cập bến kết thúc hải trình'],
                    ],
                ],
            ],
            [
                'provider_key' => 'tour_nhatrang',
                'type' => 'tour',
                'category_slug' => 'bien-dao-lan-ngam-san-ho',
                'location_slug' => 'phu-quoc',
                'name' => 'Tour Cano 4 Đảo Nam Phú Quốc & Cáp Treo Hòn Thơm',
                'slug' => 'tour-cano-4-dao-phu-quoc-hon-thom',
                'address' => 'Cảng An Thới, Phú Quốc',
                'base_price' => 1180000,
                'price_unit' => 'person',
                'rating_avg' => 4.9,
                'total_bookings' => 275,
                'daily_slots' => 30,
                'description' => 'Chụp ảnh flycam miễn phí tại Hòn Móng Tay, lặn san hô Hòn Gầm Ghì và trải nghiệm cáp treo vượt biển dài nhất thế giới.',
                'amenities' => ['Flycam & Chụp ảnh miễn phí', 'Vé cáp treo Hòn Thơm', 'Cano cao tốc', 'Công viên nước Aquatopia'],
                'includes' => ['Xe đưa đón', 'Cano 4 đảo', 'Vé cáp treo & Aquatopia', 'Ăn trưa trên đảo'],
                'excludes' => ['Đi bộ dưới đáy biển (Seawalker)'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'mien-phi-huy-doi-ngay-24h', 'co-mat-truoc-30-phut'],
                'images' => [
                    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
                ],
                'schedules' => [
                    [
                        'day_number' => 1,
                        'title' => '4 Đảo An Thới – Công viên nước Aquatopia (08:30 – 17:00)',
                        'description' => 'Khởi hành từ cảng An Thới khám phá cụm đảo phía Nam.',
                        'activities' => ['09:30: Check-in Hòn Móng Tay & Mây Rút', '11:30: Lặn san hô Hòn Gầm Ghì', '14:00: Vui chơi công viên nước & về cáp treo Hòn Thơm'],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════════════
            // 5. ENTERTAINMENT PROVIDER 2: Sa Pa Summit & Cloud Trekking
            // ═══════════════════════════════════════════════════════
            [
                'provider_key' => 'tour_sapa',
                'type' => 'tour',
                'category_slug' => 'trekking-cam-trai-san-may',
                'location_slug' => 'sa-pa',
                'name' => 'Tour Trekking Sa Pa – Bản Cát Cát – Săn Mây Fansipan 2N1Đ',
                'slug' => 'sapa-fansipan-cloud-hunting-2n1d',
                'address' => '24 Cầu Mây, Thị xã Sa Pa, Lào Cai',
                'base_price' => 2150000,
                'price_unit' => 'person',
                'rating_avg' => 4.9,
                'total_bookings' => 195,
                'daily_slots' => 18,
                'description' => 'Hành trình 2 ngày 1 đêm trekking qua thung lũng Mường Hoa, ngủ homestay bản Tả Van và chinh phục nóc nhà Đông Dương Fansipan.',
                'amenities' => ['Hướng dẫn viên bản địa', '1 đêm Homestay view mây', 'Vé cáp treo Fansipan', '3 bữa ăn đặc sản'],
                'includes' => ['Phòng nghỉ 1 đêm tại Tả Van', 'Vé tham quan & cáp treo Fansipan', '3 bữa ăn chính + 1 bữa sáng'],
                'excludes' => ['Vé tàu hỏa leo núi Mường Hoa'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'mien-phi-huy-doi-ngay-24h', 'chinh-sach-tre-em-mien-phi-duoi-6'],
                'images' => [
                    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
                ],
                'schedules' => [
                    [
                        'day_number' => 1,
                        'title' => 'Ngày 1: Trekking Ý Linh Hồ – Lao Chải – Tả Van',
                        'description' => 'Đi bộ xuyên qua những thửa ruộng bậc thang đẹp nhất Sa Pa.',
                        'activities' => ['09:00: Xuất phát từ nhà thờ Đá Sa Pa', '12:00: Ăn trưa tại Lao Chải', '17:00: Nhận phòng homestay & thưởng thức lẩu cá hồi'],
                    ],
                    [
                        'day_number' => 2,
                        'title' => 'Ngày 2: Chinh phục đỉnh Fansipan 3.143m',
                        'description' => 'Săn mây buổi sáng và lên cáp treo chạm đỉnh Fansipan.',
                        'activities' => ['08:00: Lên ga cáp treo Fansipan', '10:30: Check-in cột mốc 3.143m', '14:30: Về lại trung tâm Sa Pa'],
                    ],
                ],
            ],
            [
                'provider_key' => 'tour_sapa',
                'type' => 'tour',
                'category_slug' => 'cong-vien-giai-tri-ve-tham-quan',
                'location_slug' => 'da-nang',
                'name' => 'Vé & Tour Bà Nà Hills – Cầu Vàng – Làng Pháp Trọn Gói',
                'slug' => 'ba-na-hills-cau-vang-tron-goi',
                'address' => 'Khu du lịch Sun World Bà Nà Hills, Hòa Vang, Đà Nẵng',
                'base_price' => 1190000,
                'price_unit' => 'person',
                'rating_avg' => 4.8,
                'total_bookings' => 420,
                'daily_slots' => 35,
                'description' => 'Combo trọn gói xe đưa đón từ Đà Nẵng, vé cáp treo Bà Nà Hills, check-in Cầu Vàng và buffet trưa hơn 90 món tại nhà hàng Arapang.',
                'amenities' => ['Xe du lịch đưa đón', 'Vé cáp treo 2 chiều', 'Buffet trưa 90 món', 'Fantasy Park miễn phí'],
                'includes' => ['Xe 16 chỗ đón tận khách sạn Đà Nẵng', 'Vé cáp treo + Cầu Vàng + Fantasy Park', 'Buffet trưa'],
                'excludes' => ['Bảo tàng Sáp & Hầm rượu Debay'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'co-mat-truoc-30-phut', 'check-in-nhanh-qr-code'],
                'images' => [
                    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1504457047772-27faf1c00561?auto=format&fit=crop&w=1200&q=80',
                ],
                'schedules' => [
                    [
                        'day_number' => 1,
                        'title' => 'Một ngày tại Xứ sở Thần tiên Bà Nà (07:45 – 17:00)',
                        'description' => 'Khởi hành từ trung tâm Đà Nẵng lên đỉnh Bà Nà.',
                        'activities' => ['09:00: Check-in Cầu Vàng & Vườn Hoa Le Jardin', '11:30: Buffet trưa tại Làng Pháp', '13:30: Vui chơi Fantasy Park & Tàu hỏa leo núi'],
                    ],
                ],
            ],
            [
                'provider_key' => 'tour_sapa',
                'type' => 'tour',
                'category_slug' => 'trekking-cam-trai-san-may',
                'location_slug' => 'ninh-binh',
                'name' => 'Tour Tràng An – Hang Múa – Cố Đô Hoa Lư Trong Ngày',
                'slug' => 'trang-an-hang-mua-hoa-lu-trong-ngay',
                'address' => 'Khu du lịch sinh thái Tràng An, Ninh Bình',
                'base_price' => 850000,
                'price_unit' => 'person',
                'rating_avg' => 4.9,
                'total_bookings' => 218,
                'daily_slots' => 24,
                'description' => 'Ngồi thuyền nan xuyên hang động Tràng An di sản UNESCO, leo 500 bậc đá đỉnh Ngọa Long Hang Múa và thưởng thức đặc sản dê núi.',
                'amenities' => ['Xe Limousine từ Hà Nội', 'Vé thuyền Tràng An', 'Vé Hang Múa', 'Bữa trưa đặc sản'],
                'includes' => ['Xe Limousine đón phố cổ Hà Nội', 'Vé tham quan toàn tuyến', 'Bữa trưa cơm cháy dê núi'],
                'excludes' => ['Tiền tip cho người chèo đò'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'mien-phi-huy-doi-ngay-24h', 'co-mat-truoc-30-phut'],
                'images' => [
                    'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1200&q=80',
                ],
                'schedules' => [
                    [
                        'day_number' => 1,
                        'title' => 'Hà Nội – Hoa Lư – Tràng An – Hang Múa (07:30 – 19:00)',
                        'description' => 'Đón khách tại Nhà Hát Lớn / Phố Cổ Hà Nội.',
                        'activities' => ['10:00: Tham quan Cố đô Hoa Lư', '13:00: Đi thuyền Tràng An 2.5 tiếng', '16:00: Chinh phục đỉnh Hang Múa ngắm hoàng hôn Tam Cốc'],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════════════
            // 6. ENTERTAINMENT PROVIDER 3: Hội An Lantern & Culinary Studio
            // ═══════════════════════════════════════════════════════
            [
                'provider_key' => 'tour_hoian',
                'type' => 'tour',
                'category_slug' => 'food-tour-am-thuc-duong-pho',
                'location_slug' => 'hoi-an',
                'name' => 'Hội An Street Food Tour & Thả Hoa Đăng Sông Hoài',
                'slug' => 'hoi-an-street-food-tour-song-hoai',
                'address' => '82 Bạch Đằng, Minh An, Hội An',
                'base_price' => 550000,
                'price_unit' => 'person',
                'rating_avg' => 4.9,
                'total_bookings' => 289,
                'daily_slots' => 16,
                'description' => 'Thưởng thức 7 món đặc sản trứ danh Hội An (Cao lầu, Bánh mì Phượng, Cơm gà, Chè bắp...) và đi thuyền thả đèn hoa đăng lung linh trên sông Hoài.',
                'amenities' => ['7 món đặc sản chuẩn vị', 'Thuyền gỗ sông Hoài', 'Đèn hoa đăng miễn phí', 'Hướng dẫn viên am hiểu ẩm thực'],
                'includes' => ['Toàn bộ đồ ăn & nước Mót Hội An', 'Vé thuyền sông Hoài 30 phút'],
                'excludes' => ['Vé tham quan di tích phố cổ'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'mien-phi-huy-doi-ngay-24h', 'check-in-nhanh-qr-code'],
                'images' => [
                    'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
                ],
                'schedules' => [
                    [
                        'day_number' => 1,
                        'title' => 'Dạo phố cổ ăn sập 7 quán gia truyền (16:30 – 20:00)',
                        'description' => 'Tập trung tại Chùa Cầu Hội An.',
                        'activities' => ['16:45: Bánh mì & Nước thảo mộc', '18:00: Cao lầu, Bánh bao bánh vạc', '19:15: Thuyền sông Hoài thả hoa đăng'],
                    ],
                ],
            ],
            [
                'provider_key' => 'tour_hoian',
                'type' => 'tour',
                'category_slug' => 'workshop-trai-nghiem-ban-dia',
                'location_slug' => 'hoi-an',
                'name' => 'Workshop Làm Đèn Lồng Hội An & Chèo Thúng Rừng Dừa Bảy Mẫu',
                'slug' => 'workshop-den-long-rung-dua-bay-mau',
                'address' => 'Rừng Dừa Cẩm Thanh, Hội An',
                'base_price' => 480000,
                'price_unit' => 'person',
                'rating_avg' => 4.8,
                'total_bookings' => 176,
                'daily_slots' => 20,
                'description' => 'Tự tay uốn khung tre, bọc lụa tạo chiếc đèn lồng Hội An mang về và trải nghiệm múa thúng nước giữa rừng dừa xanh mát.',
                'amenities' => ['Mang đèn lồng về làm quà', 'Thuyền thúng có mái che', 'Trà gừng & Bánh dừa', 'Nghệ nhân hướng dẫn'],
                'includes' => ['Nguyên liệu tre & lụa làm đèn lồng', 'Vé thuyền thúng Rừng Dừa 45 phút'],
                'excludes' => ['Xe đưa đón ngoài Hội An'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'mien-phi-huy-doi-ngay-24h', 'chinh-sach-tre-em-mien-phi-duoi-6'],
                'images' => [
                    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1200&q=80',
                ],
                'schedules' => [
                    [
                        'day_number' => 1,
                        'title' => 'Trải nghiệm thủ công & Sông nước Cẩm Thanh (08:30 – 12:00)',
                        'description' => 'Bắt đầu tại xưởng đèn lồng nghệ nhân Cẩm Thanh.',
                        'activities' => ['08:30: Tự tay làm đèn lồng tre lụa', '10:30: Chèo thuyền thúng & xem quăng chài trên sông'],
                    ],
                ],
            ],
            [
                'provider_key' => 'tour_hoian',
                'type' => 'tour',
                'category_slug' => 'van-hoa-lich-su-tam-linh',
                'location_slug' => 'hue',
                'name' => 'Tour Khám Phá Đại Nội Huế – Chùa Thiên Mụ – Lăng Khải Định',
                'slug' => 'tour-dai-noi-hue-chua-thien-mu',
                'address' => 'Đường 23 Tháng 8, Thuận Hòa, TP. Huế',
                'base_price' => 760000,
                'price_unit' => 'person',
                'rating_avg' => 4.8,
                'total_bookings' => 154,
                'daily_slots' => 22,
                'description' => 'Hành trình trở về kinh đô triều Nguyễn: tham quan Hoàng Thành Đại Nội, du thuyền rồng sông Hương và chiêm ngưỡng kiến trúc tinh xảo Lăng Khải Định.',
                'amenities' => ['Thuyền rồng sông Hương', 'Hướng dẫn viên lịch sử', 'Bữa trưa cơm Huế', 'Nước suối miễn phí'],
                'includes' => ['Xe máy lạnh suốt tuyến', 'Thuyền rồng trên sông Hương', 'Bữa trưa ẩm thực cung đình Huế'],
                'excludes' => ['Vé vào cổng các điểm di tích (mua tại cổng theo đối tượng)'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'mien-phi-huy-doi-ngay-24h', 'co-mat-truoc-30-phut'],
                'images' => [
                    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1200&q=80',
                ],
                'schedules' => [
                    [
                        'day_number' => 1,
                        'title' => 'Trọn ngày di sản Cố Đô (08:00 – 16:30)',
                        'description' => 'Đón khách tại trung tâm TP. Huế.',
                        'activities' => ['08:30: Đi thuyền rồng thăm Chùa Thiên Mụ', '10:00: Tham quan Đại Nội Hoàng Thành', '14:00: Khám phá Lăng Khải Định & Làng Hương Thủy Xuân'],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════════════
            // 7. VEHICLE PROVIDER 1: Miền Trung Auto & Airport Transfer
            // ═══════════════════════════════════════════════════════
            [
                'provider_key' => 'vehicle_central',
                'type' => 'vehicle',
                'category_slug' => 'thue-xe-dua-don-san-bay',
                'location_slug' => 'da-nang',
                'name' => 'Thuê Ô Tô Tự Lái 5 Chỗ (Mazda 3 / Civic Đời Mới)',
                'slug' => 'mien-trung-sedan-tu-lai-4-cho',
                'address' => '150 Nguyễn Hữu Thọ, Hải Châu, Đà Nẵng (Giao sân bay miễn phí)',
                'base_price' => 850000,
                'price_unit' => 'day',
                'rating_avg' => 4.9,
                'total_bookings' => 162,
                'daily_slots' => 8,
                'description' => 'Xe Sedan 5 chỗ số tự động đời 2024–2025 sạch sẽ, đầy đủ Apple CarPlay, bảo hiểm 2 chiều và giao xe tận sảnh sân bay Đà Nẵng.',
                'amenities' => ['Giao xe sân bay miễn phí', 'Số tự động & CarPlay', 'Bảo hiểm 2 chiều', 'Không giới hạn km nội tỉnh'],
                'includes' => ['Giao nhận xe tại sân bay hoặc khách sạn Đà Nẵng', 'Bảo hiểm thân vỏ xe'],
                'excludes' => ['Nhiên liệu & phí cầu đường ePass'],
                'policy_slugs' => ['yeu-cau-bang-lai-xe-hop-le', 'yeu-cau-dat-coc-the-chan-tai-san', 'giao-nhan-xe-linh-hoat-07h-21h', 'khong-hut-thuoc'],
                'images' => [
                    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'provider_key' => 'vehicle_central',
                'type' => 'vehicle',
                'category_slug' => 'thue-xe-dua-don-san-bay',
                'location_slug' => 'hoi-an',
                'name' => 'Xe Riêng 7 Chỗ Có Tài Xế (Đà Nẵng ↔ Hội An ↔ Bà Nà)',
                'slug' => 'xe-rieng-7-cho-co-tai-xe-da-nang-hoi-an',
                'address' => 'Phục vụ toàn khu vực Đà Nẵng – Hội An – Huế',
                'base_price' => 1350000,
                'price_unit' => 'day',
                'rating_avg' => 4.8,
                'total_bookings' => 119,
                'daily_slots' => 10,
                'description' => 'Xe MPV 7 chỗ (Xpander / Carnival) rộng rãi kèm tài xế bản địa lịch sự, đúng giờ, phục vụ gia đình đi tham quan trọn ngày.',
                'amenities' => ['Tài xế bản địa kinh nghiệm', 'Khăn lạnh & Nước suối', 'Wi-Fi trên xe', 'Đưa đón tận cửa'],
                'includes' => ['Lương tài xế, xăng dầu & phí cầu đường 10 tiếng/ngày'],
                'excludes' => ['Phí phát sinh ngoài giờ 100.000đ/giờ'],
                'policy_slugs' => ['thanh-toan-khi-nhan-phong', 'mien-phi-huy-doi-ngay-24h', 'giao-nhan-xe-linh-hoat-07h-21h'],
                'images' => [
                    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'provider_key' => 'vehicle_central',
                'type' => 'vehicle',
                'category_slug' => 'thue-xe-dua-don-san-bay',
                'location_slug' => 'phu-quoc',
                'name' => 'Thuê Xe SUV 7 Chỗ Tự Lái Khám Phá Đảo Ngọc Phú Quốc',
                'slug' => 'thue-xe-suv-7-cho-tu-lai-phu-quoc',
                'address' => 'Sân bay Quốc tế Phú Quốc, Dương Tơ',
                'base_price' => 1150000,
                'price_unit' => 'day',
                'rating_avg' => 4.8,
                'total_bookings' => 88,
                'daily_slots' => 6,
                'description' => 'SUV 7 chỗ gầm cao máy khỏe, khoang hành lý rộng rãi phù hợp nhóm bạn và gia đình đi Bắc Đảo – Nam Đảo Phú Quốc.',
                'amenities' => ['Gầm cao 7 chỗ', 'Camera 360', 'Giao xe sân bay Phú Quốc', 'Cho phép thú cưng'],
                'includes' => ['Giao xe miễn phí tại sân bay Phú Quốc', '2 áo mưa & dù che nắng'],
                'excludes' => ['Nhiên liệu sử dụng'],
                'policy_slugs' => ['yeu-cau-bang-lai-xe-hop-le', 'yeu-cau-dat-coc-the-chan-tai-san', 'cho-phep-mang-theo-thu-cung-co-phu-thu'],
                'images' => [
                    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
                ],
            ],

            // ═══════════════════════════════════════════════════════
            // 8. VEHICLE PROVIDER 2: Cao Nguyên Moto & Touring Rental
            // ═══════════════════════════════════════════════════════
            [
                'provider_key' => 'vehicle_highland',
                'type' => 'vehicle',
                'category_slug' => 'thue-xe-dua-don-san-bay',
                'location_slug' => 'da-lat',
                'name' => 'Thuê Xe Máy Tay Ga Đà Lạt (AirBlade / Lead / Vision Đời Mới)',
                'slug' => 'thue-xe-may-tay-ga-da-lat',
                'address' => '19 Bùi Thị Xuân, Phường 2, Đà Lạt',
                'base_price' => 150000,
                'price_unit' => 'day',
                'rating_avg' => 4.9,
                'total_bookings' => 410,
                'daily_slots' => 20,
                'description' => 'Xe tay ga đời mới bảo dưỡng định kỳ chuyên leo dốc Đà Lạt êm ái, giao tận khách sạn/bến xe chỉ trong 15 phút.',
                'amenities' => ['2 mũ bảo hiểm chuẩn', '2 áo mưa dày', '1 lít xăng sẵn', 'Giao xe tận khách sạn'],
                'includes' => ['Giao & nhận xe miễn phí trung tâm Đà Lạt', '2 mũ bảo hiểm + áo mưa'],
                'excludes' => ['Xăng xe phát sinh trong hành trình'],
                'policy_slugs' => ['yeu-cau-bang-lai-xe-hop-le', 'giao-nhan-xe-linh-hoat-07h-21h', 'thanh-toan-khi-nhan-phong'],
                'images' => [
                    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'provider_key' => 'vehicle_highland',
                'type' => 'vehicle',
                'category_slug' => 'thue-xe-dua-don-san-bay',
                'location_slug' => 'nha-trang',
                'name' => 'Thuê Xe Máy Phượt Đèo & Ven Biển Nha Trang (NVX / Winner X)',
                'slug' => 'thue-xe-may-phuot-ven-bien-nha-trang',
                'address' => '38 Nguyễn Thiện Thuật, Lộc Thọ, Nha Trang',
                'base_price' => 220000,
                'price_unit' => 'day',
                'rating_avg' => 4.8,
                'total_bookings' => 145,
                'daily_slots' => 12,
                'description' => 'Dòng xe thể thao mạnh mẽ chinh phục cung đường đèo Vĩnh Hy – Bình Lập – Lương Sơn tuyệt đẹp.',
                'amenities' => ['Giá đỡ điện thoại', '2 mũ bảo hiểm 3/4', 'Cứu hộ 24/7', 'Giao xe tận nơi'],
                'includes' => ['Giá đỡ điện thoại chống rung', 'Hỗ trợ kỹ thuật 24/7'],
                'excludes' => ['Xăng xe'],
                'policy_slugs' => ['yeu-cau-bang-lai-xe-hop-le', 'yeu-cau-dat-coc-the-chan-tai-san', 'giao-nhan-xe-linh-hoat-07h-21h'],
                'images' => [
                    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1200&q=80',
                ],
            ],

            // ═══════════════════════════════════════════════════════
            // 9. TRAIN PROVIDER 1: Đoàn Tàu Di Sản Miền Trung (SJourney)
            // ═══════════════════════════════════════════════════════
            [
                'provider_key' => 'train_heritage',
                'type' => 'vehicle',
                'category_slug' => 've-tau-hoa-duong-sat-ngam-canh',
                'location_slug' => 'da-nang',
                'name' => 'Vé Tàu Kết Nối Di Sản Huế – Đà Nẵng (Qua Đèo Hải Vân)',
                'slug' => 'doan-tau-di-san-hue-da-nang-vip',
                'address' => 'Ga Đà Nẵng, 202 Hải Phòng, Thanh Khê, Đà Nẵng',
                'base_price' => 240000,
                'price_unit' => 'ticket',
                'rating_avg' => 4.9,
                'total_bookings' => 520,
                'daily_slots' => 40,
                'description' => 'Trải nghiệm toa tàu du lịch di sản với cửa sổ kính lớn ngắm trọn cung đường biển Lăng Cô – Đèo Hải Vân đẹp nhất Việt Nam, có toa cộng đồng biểu diễn nhã nhạc cung đình.',
                'amenities' => ['Ghế mềm điều hòa cửa sổ lớn', 'Nhã nhạc cung đình trên tàu', 'Toa ẩm thực đặc sản Huế', 'Check-in vé QR'],
                'includes' => ['Vé tàu 1 chiều Huế ↔ Đà Nẵng', 'Nước suối & trà cung đình', 'Chương trình nghệ thuật trên toa sinh hoạt cộng đồng'],
                'excludes' => ['Đồ ăn nhẹ tại quầy bar'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'ho-tro-doi-ten-doi-lich-duong-sat', 'co-mat-truoc-30-phut', 'check-in-nhanh-qr-code'],
                'images' => [
                    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'provider_key' => 'train_heritage',
                'type' => 'vehicle',
                'category_slug' => 've-tau-hoa-duong-sat-ngam-canh',
                'location_slug' => 'da-lat',
                'name' => 'Vé Tàu Cổ Đà Lạt – Trại Mát (Toa VIP Gỗ Cổ Điển)',
                'slug' => 've-tau-co-da-lat-trai-mat-toa-vip',
                'address' => 'Ga Đà Lạt, Số 1 Quang Trung, Phường 10, Đà Lạt',
                'base_price' => 170000,
                'price_unit' => 'ticket',
                'rating_avg' => 4.8,
                'total_bookings' => 380,
                'daily_slots' => 36,
                'description' => 'Ngồi toa tàu cổ nội thất gỗ phong cách Đông Dương khởi hành từ nhà ga cổ nhất Đông Dương xuyên qua vườn hoa và đồi thông Trại Mát.',
                'amenities' => ['Toa gỗ cổ điển VIP', 'Nhạc Violin/Guitar trực tiếp', 'Trà Atiso nóng', 'Vé khứ hồi 2 chiều'],
                'includes' => ['Vé tàu khứ hồi Ga Đà Lạt ↔ Ga Trại Mát', '1 tách trà Atiso nóng miễn phí'],
                'excludes' => ['Vé vào Chùa Linh Phước (miễn phí)'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'co-mat-truoc-30-phut', 'check-in-nhanh-qr-code'],
                'images' => [
                    'https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=1200&q=80',
                ],
            ],

            // ═══════════════════════════════════════════════════════
            // 10. TRAIN PROVIDER 2: Chapa & Victoria Express Train
            // ═══════════════════════════════════════════════════════
            [
                'provider_key' => 'train_express',
                'type' => 'vehicle',
                'category_slug' => 've-tau-hoa-duong-sat-ngam-canh',
                'location_slug' => 'sa-pa',
                'name' => 'Vé Khoang Giường Nằm 5 Sao Chapa Express (Hà Nội ↔ Sa Pa)',
                'slug' => 'khoang-giuong-nam-chapa-express-ha-noi-sapa',
                'address' => 'Ga Hà Nội, 120 Lê Duẩn, Hoàn Kiếm, Hà Nội',
                'base_price' => 980000,
                'price_unit' => 'ticket',
                'rating_avg' => 4.9,
                'total_bookings' => 290,
                'daily_slots' => 28,
                'description' => 'Khoang cabin 4 giường gỗ cao cấp trên chuyến tàu đêm SP3/SP4 tuyến Hà Nội – Lào Cai, có phòng chờ VIP Chapa Lounge tại Ga Lào Cai.',
                'amenities' => ['Cabin gỗ 4 giường êm ái', 'Phòng chờ VIP Chapa Lounge', 'Đồ ăn nhẹ & Trà sáng', 'Wi-Fi & Ổ cắm sạc'],
                'includes' => ['1 giường trong cabin 4 giường điều hòa', 'Nước suối, trái cây, bánh ngọt', 'Tắm nóng & nghỉ ngơi tại Chapa Lounge Ga Lào Cai'],
                'excludes' => ['Xe trung chuyển từ Ga Lào Cai lên trung tâm Sa Pa'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'ho-tro-doi-ten-doi-lich-duong-sat', 'co-mat-truoc-30-phut', 'khong-hut-thuoc'],
                'images' => [
                    'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'provider_key' => 'train_express',
                'type' => 'vehicle',
                'category_slug' => 've-tau-hoa-duong-sat-ngam-canh',
                'location_slug' => 'ha-noi',
                'name' => 'Vé Khoang VIP Tàu Thống Nhất SE1/SE3 (Hà Nội → Đà Nẵng)',
                'slug' => 've-tau-thong-nhat-vip-ha-noi-da-nang',
                'address' => 'Ga Hà Nội, 120 Lê Duẩn, Hoàn Kiếm, Hà Nội',
                'base_price' => 1250000,
                'price_unit' => 'ticket',
                'rating_avg' => 4.7,
                'total_bookings' => 175,
                'daily_slots' => 30,
                'description' => 'Vé khoang giường nằm 4 giường tầng 1 tuyến tàu nhanh SE1/SE3 từ Hà Nội đi Đà Nẵng, ngắm bình minh trên biển Lăng Cô và Đèo Hải Vân.',
                'amenities' => ['Giường nằm tầng 1 êm ái', 'Điều hòa 2 chiều', 'Chăn ga vệ sinh mới', 'Bàn ăn nhỏ trong khoang'],
                'includes' => ['Vé điện tử QR Code chính hãng Đường sắt Việt Nam', '1 chai nước suối & khăn lạnh'],
                'excludes' => ['Suất ăn trên tàu'],
                'policy_slugs' => ['thanh-toan-toan-bo-100', 'ho-tro-doi-ten-doi-lich-duong-sat', 'co-mat-truoc-30-phut', 'check-in-nhanh-qr-code'],
                'images' => [
                    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
        ];
    }
}
