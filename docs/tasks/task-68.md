# Task #68: Provider — Áp dụng Chính sách dịch vụ & Tham gia Chương trình khuyến mãi

- **EPIC:** `#15` — Quản lý Dịch vụ (Provider)
- **Sprint:** Sprint 2
- **Platform:** API / Web (Provider)
- **Priority:** `P1` | **Estimate:** `3 Points`
- **Branch:** `feat/#68-provider-policies-campaigns`

---

## 1. Mục tiêu

1. Cho phép Nhà cung cấp chọn **Chính sách áp dụng** (từ bảng `service_policies` lọc theo loại hình dịch vụ) ngay trong form tạo/chỉnh sửa dịch vụ (`ServiceFormStepper`), lưu vào bảng `service_policy_assignments`.
2. Tạo bảng `service_promotions` (lưu lịch sử tham gia chiến dịch của từng dịch vụ, không xóa khi kết thúc chiến dịch) và bổ sung tab **Chương trình khuyến mãi** trên `ProviderSidebar` (`/provider/campaigns`) để Nhà cung cấp chủ động chọn **từng dịch vụ cụ thể** tham gia hoặc không tham gia, kèm tùy chỉnh mức giảm giá.

---

## 2. Danh sách công việc

### Backend (`apps/api`)

- [x] Tạo migration `service_policy_assignments` và `service_promotions`.
- [x] Tạo Model `ServicePromotion`, cập nhật quan hệ trong `Service` (`policies`, `promotions`) và `HolidayCampaign` (`promotions`).
- [x] Cập nhật `StoreServiceRequest`, `UpdateServiceRequest`, `Provider\ServiceController` để lưu và trả về `policy_ids` / `policies`.
- [x] Tạo `ProviderCampaignController` & routes `GET /provider/campaigns`, `PUT /provider/campaigns/{campaignId}/services` (chỉ dịch vụ `active` được tham gia).
- [x] Viết Feature Test `ProviderPoliciesCampaignsTest`.

### Frontend Web (`apps/web`)

- [x] Cập nhật `serviceFormModel.js` & `ServiceFormStepper.jsx` thêm mục chọn **Chính sách dịch vụ áp dụng** và chuẩn hóa `serviceType` để lọc đúng chính sách/danh mục/tiện nghi theo loại hình.
- [x] Thêm tab **Chương trình khuyến mãi** (`/provider/campaigns`) vào `ProviderSidebar.jsx` và `AppRouter.jsx`.
- [x] Tạo `providerCampaignApi.js` và `ProviderCampaignsPage.jsx` cho phép bật/tắt tham gia và tùy chỉnh mức khuyến mãi theo từng dịch vụ đã duyệt.
- [x] Kiểm định `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint.bat --test` và `php artisan test`.

---

## 3. Tiêu chuẩn nghiệm thu (DoD)

- [x] Nhà cung cấp tạo/sửa dịch vụ lưu được danh sách `policy_ids` vào `service_policy_assignments`.
- [x] Nhà cung cấp bật/tắt tham gia chiến dịch cho từng dịch vụ đã duyệt riêng biệt và thiết lập mức giảm (>= mức chuẩn chiến dịch).
- [x] Pass `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint.bat --test` và `php artisan test`.
