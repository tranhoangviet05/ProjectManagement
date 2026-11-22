# Task #19: Trang chủ & Tìm kiếm (Theo điểm đến, từ khóa, khoảng giá)

- **EPIC:** `#18` — Khám phá & Tìm kiếm Dịch vụ (Tourist)
- **Branch:** `feat/#19-tourist-home-search`
- **Trạng thái:** Đang chờ Project Lead duyệt (User Review Gate)

---

## 1. Mục tiêu

Xây dựng trải nghiệm **Trang chủ & Tìm kiếm** cho ứng dụng Mobile (`apps/mobile`) cùng các Public Discovery API ở Backend (`apps/api`):

1. **Khởi động gắn với dữ liệu thực (`SplashScreen` -> `Trang chủ`):**
   - Bỏ bộ đếm giả lập cố định trong `SplashScreen`; giữ hiệu ứng loading cho đến khi font, phiên đăng nhập và toàn bộ dữ liệu khởi tạo Trang chủ (địa điểm, danh mục, dịch vụ, bài đăng nổi bật) tải xong.
   - Sau Splash mở thẳng **Trang chủ (Tab Tìm kiếm)** cho cả Khách vãng lai (Guest) lẫn Du khách đã đăng nhập.
2. **Thanh Footer Liquid Glass (cảm hứng iOS 26) gồm 4 tab:**
   - **Tìm kiếm** (`ExploreHomeScreen`): Trang chủ & tìm kiếm dịch vụ.
   - **Khám phá** (`SocialFeedScreen`): Bảng tin cộng đồng du lịch mang phong cách tối giản của Threads.
   - **Đặt chỗ** (`BookingsTabScreen`): Lịch sử đặt chỗ & vé QR check-in (mời Đăng nhập nếu là Guest).
   - **Cá nhân** (`AccountTabScreen`): Hiển thị `ProfileScreen` nếu đã đăng nhập; nếu là Guest sẽ khuyến khích **Đăng nhập / Đăng ký** cùng các mục: **Quản lý Ví**, **Danh sách đã lưu**, **Ưu đãi**, **Cài đặt thiết bị**, **Trợ giúp** (_Liên hệ trợ giúp_, _Trung tâm thông tin về bảo mật_, _Báo cáo lỗi ứng dụng_).
3. **Thiết kế Trang chủ (`ExploreHomeScreen`) theo đúng bố cục đặt ra:**
   - **Header + Danh mục + Form Tìm kiếm liền mạch dải màu chủ đạo (nhạt dần từ trên xuống):** Logo `"Social Travel Booking"`, icon Thông báo & Tin nhắn; thanh danh mục ngang (`Chỗ ở`, `Giải trí`, `Thuê xe`, `Vé tàu`); Form tìm kiếm động thay đổi trường nhập tương ứng từng danh mục (bao gồm Điểm đến, Ngày đi – Ngày về, Người lớn, Trẻ em, Công tắc thú cưng cho Chỗ ở).
   - **Địa điểm nổi bật (Collage 5 ảnh kiểu Instagram)** + nút **Xem tất cả** (`AllLocationsScreen`).
   - **Nội dung gợi ý động theo danh mục đang chọn.**
   - **Bài đăng nổi bật (Masonry 2 cột Shopee/TikTok Shop/CapCut + vibe Threads):** bài có ảnh cao hơn bài chỉ có chữ.
   - **Banner AI Trip Planner:** `"Bạn chưa biết đi đâu? Hãy để chúng tôi giúp bạn"` + nút **Tạo lịch trình du lịch bằng AI** (placeholder sắp ra mắt).
   - **Lý do nên chọn chúng tôi:** 4 giá trị cốt lõi (Escrow 30%, KYC 100%, review cộng đồng, giá & lịch trống minh bạch).
4. **Tìm kiếm & Bộ lọc (`ServiceSearchScreen`):**
   - Tìm kiếm dịch vụ công khai theo từ khóa, điểm đến (gồm cả địa điểm con qua `parent_id`), nhóm danh mục, khoảng giá (nhanh & tùy nhập) và sắp xếp; đồng bộ bộ lọc qua `route.params`.

---

## 2. API Contract (Backend `apps/api`)

- `GET /api/v1/public/locations?popular=1` — Danh sách địa điểm du lịch kèm `parent`, `active_services_count`.
- `GET /api/v1/public/services` — Tìm kiếm dịch vụ đang mở bán (`status = 'active'`, provider đã duyệt) hỗ trợ: `q`, `location_id`, `location_slug`, `category_id`, `type`, `group` (`accommodation`, `entertainment`, `vehicle`, `train`), `min_price`, `max_price`, `sort` (`newest`, `price_asc`, `price_desc`, `rating`), `per_page`.
- `GET /api/v1/public/services/{id}` — Chi tiết dịch vụ công khai.
- `GET /api/v1/public/posts/featured?limit=12` — Danh sách bài đăng cộng đồng công khai kèm `author`, `media`, `service`, `likes_count`, `comments_count`.

---

## 3. Acceptance Criteria (DoD)

- [x] `SplashScreen` chỉ kết thúc khi dữ liệu thực tế khởi tạo xong và chuyển thẳng vào Trang chủ (không ép đăng nhập).
- [x] Footer Liquid Glass 4 tab (`Tìm kiếm`, `Khám phá`, `Đặt chỗ`, `Cá nhân`) hoạt động mượt, không che khuất nội dung cuộn.
- [x] Tab `Cá nhân` ở trạng thái Guest hiển thị đầy đủ CTA Đăng nhập / Đăng ký và các mục Quản lý Ví, Danh sách đã lưu, Ưu đãi, Cài đặt thiết bị, Trợ giúp (Liên hệ trợ giúp, Trung tâm thông tin về bảo mật, Báo cáo lỗi ứng dụng).
- [x] Trang chủ có đầy đủ Header Gradient liền mạch → Danh mục → Form Tìm kiếm động, Collage 5 địa điểm nổi bật + Xem tất cả, nội dung theo danh mục, Bài đăng nổi bật Masonry 2 cột vibe Threads, Banner AI và Lý do nên chọn chúng tôi.
- [x] `ServiceSearchScreen` lọc đúng theo điểm đến, từ khóa, danh mục, khoảng giá, sắp xếp và hiển thị `<Skeleton />` khi đang tải.
- [x] Pass `pnpm lint`, `pint --test` và `php artisan test`.
