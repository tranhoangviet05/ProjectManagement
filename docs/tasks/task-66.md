# Task #66: Tái cấu trúc bảng Danh mục dịch vụ theo Loại hình dịch vụ

- **EPIC:** `#51` — Quản trị Hệ thống & Điều hành Sàn (Admin Operations)
- **Sprint:** Sprint 2
- **Platform:** API / Web (Admin & Provider)
- **Priority:** `P1` | **Estimate:** `2 Points`
- **Branch:** `feat/#66-category-applicable-types`

---

## 1. Mục tiêu

Bổ sung trường `applicable_types` (`jsonb`) vào bảng `categories` để phân biệt rõ từng **Danh mục dịch vụ** thuộc **Loại hình dịch vụ** nào (`hotel`, `homestay`, `tour`, `vehicle`, `train`), giúp:

1. **Admin** cấu hình chính xác loại hình áp dụng cho mỗi danh mục trên `/admin/settings`.
2. **Nhà cung cấp (Provider)** chỉ nhìn thấy các danh mục phù hợp với loại hình dịch vụ đang tạo/chỉnh sửa.
3. **Public API** hỗ trợ lọc danh mục theo `?type=` đồng bộ cho Web & Mobile.

---

## 2. Danh sách công việc

### Backend (`apps/api`)

- [x] Tạo migration bổ sung cột `applicable_types` (`jsonb`) vào bảng `categories`.
- [x] Cập nhật Model `Category` (`$fillable`, `casts`).
- [x] Cập nhật `UpsertCategoryRequest` validate `applicable_types` (`hotel`, `homestay`, `tour`, `vehicle`, `train`).
- [x] Cập nhật `Public\CatalogController::categories(Request $request)` hỗ trợ lọc theo `?type=`.
- [x] Cập nhật `CategorySeeder` gán đầy đủ `applicable_types` cho toàn bộ danh mục (bao gồm cả danh mục cho Vé tàu) và chạy migrate + seed cục bộ.
- [x] Cập nhật Feature Test `AdminCatalogManagementTest`.

### Frontend Web (`apps/web`)

- [x] Cập nhật `CatalogFormModal.jsx`: thêm multi-checkbox **Loại hình dịch vụ áp dụng** cho tab `categories`.
- [x] Cập nhật `CatalogCrudTable.jsx`: hiển thị cột **Loại hình áp dụng** với badge trực quan trong bảng Danh mục dịch vụ.
- [x] Cập nhật `ServiceFormStepper.jsx` (Provider): lọc danh sách Danh mục dịch vụ theo `formData.type`.
- [x] Kiểm định `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint.bat --test` và `php artisan test`.

---

## 3. Tiêu chuẩn nghiệm thu (DoD)

- [x] Cột `applicable_types` tồn tại trong `categories` và toàn bộ danh mục trong DB đều có loại hình tương ứng.
- [x] Admin tạo/cập nhật Danh mục dịch vụ với loại hình áp dụng thành công; Public API lọc đúng theo `?type=`.
- [x] Provider tạo/sửa dịch vụ chỉ thấy danh mục khớp với loại hình dịch vụ đang chọn.
- [x] Pass `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint.bat --test` và `php artisan test`.
