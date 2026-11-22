# Task #69: Tourist Mobile — Ưu tiên Dịch vụ Khuyến mãi trên Trang chủ & Hiển thị Chính sách/Ưu đãi ở Chi tiết Dịch vụ

- **EPIC:** `#18` — Khám phá & Tìm kiếm Dịch vụ (Tourist)
- **Sprint:** Sprint 2
- **Platform:** API / Mobile
- **Priority:** `P1` | **Estimate:** `3 Points`
- **Branch:** `feat/#69-tourist-promotions-policies`

---

## 1. Mục tiêu

1. Cập nhật Public API (`/public/services`, `/public/services/{id}`) trả về thông tin **Chính sách dịch vụ (`policies`)** và **Khuyến mãi đang áp dụng (`active_promotion`)**; ưu tiên sắp xếp các dịch vụ tham gia chiến dịch lễ hội (đặc biệt ưu tiên cao hơn cho dịch vụ giảm sâu hơn mức chuẩn chiến dịch) lên đầu danh sách Trang chủ.
2. Cập nhật **Trang chủ Mobile (`ExploreHomeScreen`)** hiển thị khối **"Ưu đãi Lễ hội đang diễn ra"** với các chiến dịch và dịch vụ ưu tiên, kèm badge giảm giá, giá gốc gạch ngang và giá sau giảm.
3. Cập nhật **Chi tiết Dịch vụ Mobile (`ServiceDetailScreen`)** hiển thị đầy đủ **Chính sách dịch vụ** và **Ưu đãi khuyến mãi đang áp dụng** (tính đúng giá sau giảm trên thanh đặt chỗ).

---

## 2. Danh sách công việc

### Backend (`apps/api`)

- [x] Cập nhật `PublicServiceController::index()` eager-load `promotions.holidayCampaign`, tính `active_promotion` & `discounted_price`, ưu tiên sắp xếp dịch vụ khuyến mãi theo `priority` chiến dịch và `discount_boost`.
- [x] Cập nhật `PublicServiceController::show()` trả về `policies` và `active_promotion`.
- [x] Cập nhật `CatalogController::campaigns()` trả về toàn bộ chiến dịch đang mở (`status = active`, `ends_at >= now()`), `ProviderCampaignController` chặn tham gia trùng 2 chiến dịch, và `MediaService` nâng giới hạn banner 20MB.
- [x] Cập nhật `PublicServiceDiscoveryTest` kiểm tra thứ tự ưu tiên khuyến mãi và dữ liệu `policies` / `active_promotion`.

### Frontend Web (`apps/web`)

- [x] Cập nhật `CampaignFormModal.jsx` upload banner từ máy lên kho lưu trữ (tự động nén ảnh > 1.5MB, xem trước 16:9) và `AdminCampaignsPage.jsx` / `ProviderCampaignsPage.jsx` hiển thị 16:9 + chặn đăng ký trùng chiến dịch.

### Frontend Mobile (`apps/mobile`)

- [x] Cập nhật `exploreService.js` (`fetchActiveCampaigns`), `ExploreDataContext.js` và `apiClient.js` (`resolveMediaUrl`).
- [x] Tạo `HolidayDealsSection.js` & `HolidayCampaignsScreen.js` hiển thị Carousel banner 16:9 và danh sách thẻ dịch vụ đầy đủ thông tin.
- [x] Cập nhật `CategoryShowcaseSection.js` & `ServiceSearchScreen.js` hiển thị badge khuyến mãi, chính sách/tiện nghi kèm `+N`, giá gốc gạch ngang và giá sau giảm.
- [x] Cập nhật `ServiceDetailScreen.js` hiển thị khối **Ưu đãi đang áp dụng**, danh sách **Chính sách dịch vụ** và giá sau giảm trên thanh đặt chỗ.
- [x] Kiểm định `oxlint`, `pnpm lint`, `./vendor/bin/pint.bat --test` và `php artisan test`.

---

## 3. Tiêu chuẩn nghiệm thu (DoD)

- [x] Dịch vụ có mức khuyến mãi cao hơn chuẩn chiến dịch được ưu tiên đứng trước trên Trang chủ.
- [x] Trang chủ & Kết quả tìm kiếm hiển thị rõ badge khuyến mãi, chính sách thực tế (`+N`), giá gốc gạch ngang và giá mới.
- [x] Màn hình Chi tiết Dịch vụ hiển thị đầy đủ Chính sách dịch vụ và Ưu đãi đang áp dụng.
- [x] Pass `oxlint`, `pnpm lint`, `./vendor/bin/pint.bat --test` và `php artisan test`.
