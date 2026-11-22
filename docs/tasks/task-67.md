# Task #67: Admin — Quản lý Chính sách dịch vụ & Chương trình khuyến mãi ngày lễ

- **EPIC:** `#51` — Quản trị Hệ thống & Điều hành Sàn (Admin Operations)
- **Sprint:** Sprint 2
- **Platform:** API / Web (Admin)
- **Priority:** `P1` | **Estimate:** `3 Points`
- **Branch:** `feat/#67-admin-policies-campaigns`

---

## 1. Mục tiêu

1. Tạo bảng `service_policies` lưu trữ bộ **Chính sách dịch vụ** chuẩn toàn sàn (Thanh toán, Hủy & Đổi lịch, Nhận/Trả chỗ, Quy định sử dụng) có phân biệt `applicable_types`, kèm Seeder đầy đủ dữ liệu và tab quản lý trong `/admin/settings`.
2. Tạo bảng `holiday_campaigns` lưu trữ các **Chương trình khuyến mãi ngày lễ** (Black Friday, Cuối tuần vui vẻ, Lễ Valentine...) với khả năng **lưu lịch sử & mở lại chiến dịch đã qua** mà không cần tạo mới, kèm tab mới **Chương trình khuyến mãi** trên `AdminSidebar` (`/admin/campaigns`).

---

## 2. Danh sách công việc

### Backend (`apps/api`)

- [x] Tạo migration bảng `service_policies` và Model `ServicePolicy`.
- [x] Tạo migration bảng `holiday_campaigns` và Model `HolidayCampaign`.
- [x] Tạo `UpsertServicePolicyRequest`, `AdminServicePolicyController` & routes `/admin/policies`.
- [x] Tạo `UpsertHolidayCampaignRequest`, `AdminHolidayCampaignController` (kèm action `reopen`) & routes `/admin/campaigns`.
- [x] Bổ sung Public API `GET /api/v1/public/policies` và `GET /api/v1/public/campaigns`.
- [x] Tạo `ServicePolicySeeder`, `HolidayCampaignSeeder`, cập nhật `DatabaseSeeder`, chạy migrate & seed cục bộ.
- [x] Viết Feature Test `AdminPoliciesCampaignsTest`.

### Frontend Web (`apps/web`)

- [x] Bổ sung tab **Chính sách dịch vụ** vào `/admin/settings` (`adminCatalogApi.js`, `AdminSettingsPage.jsx`, `CatalogCrudTable.jsx`, `CatalogFormModal.jsx`).
- [x] Thêm mục **Chương trình khuyến mãi** (`/admin/campaigns`) vào `AdminSidebar.jsx` và `AppRouter.jsx`.
- [x] Tạo `adminCampaignApi.js`, `AdminCampaignsPage.jsx`, `CampaignFormModal.jsx` (hỗ trợ CRUD, lọc trạng thái, tìm kiếm qua URL và nút **Mở lại** cho chiến dịch đã kết thúc).
- [x] Kiểm định `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint.bat --test` và `php artisan test`.

---

## 3. Tiêu chuẩn nghiệm thu (DoD)

- [x] Bảng `service_policies` và `holiday_campaigns` được migrate và seed đầy đủ dữ liệu thực tế.
- [x] Admin CRUD mượt mà Chính sách dịch vụ trên `/admin/settings` và Chương trình khuyến mãi trên `/admin/campaigns` (bao gồm mở lại chiến dịch cũ).
- [x] Pass `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint.bat --test` và `php artisan test`.
