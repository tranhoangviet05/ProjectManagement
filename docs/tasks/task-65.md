# Task #65: Quản lý Tiện nghi Dịch vụ, Tiện nghi Phòng, Bao gồm & Không bao gồm

- **EPIC:** `#51` — Quản trị Hệ thống & Điều hành Sàn (Admin Operations)
- **Sprint:** Sprint 2
- **Platform:** API / Web (Admin & Provider)
- **Priority:** `P1` | **Estimate:** `3 Points`
- **Branch:** `feat/#65-admin-amenities-inclusions`

---

## 1. Mục tiêu

Chuẩn hóa bộ dữ liệu gốc cho **Tiện nghi dịch vụ**, **Tiện nghi phòng**, **Bao gồm** và **Không bao gồm** trong cơ sở dữ liệu, có phân biệt rõ **Loại hình dịch vụ áp dụng** (`hotel`, `homestay`, `tour`, `vehicle`, `train`) để:

1. **Admin** dễ dàng thêm/sửa/xóa, chọn bộ icon trực quan cho Tiện nghi và gán đúng loại hình áp dụng trên Web Portal (`/admin/settings`).
2. **Nhà cung cấp (Provider)** chọn nhanh danh sách gợi ý theo đúng loại hình khi tạo/sửa dịch vụ và hạng phòng thay vì phải nhập tay toàn bộ.
3. **Du khách (Mobile/Web)** nhìn thấy icon đồng bộ cho Tiện nghi và icon `tick` / `x` cho Bao gồm / Không bao gồm.

---

## 2. Danh sách công việc

### Backend (`apps/api`)

- [x] Tạo migration bảng `amenities` (`id`, `name`, `slug`, `scope` [`service` | `room`], `applicable_types` [`jsonb`], `icon`, `description`, `is_active`, `sort_order`).
- [x] Tạo migration bảng `service_inclusions` (`id`, `name`, `slug`, `kind` [`include` | `exclude`], `applicable_types` [`jsonb`], `description`, `is_active`, `sort_order`).
- [x] Tạo Models `Amenity`, `ServiceInclusion`.
- [x] Tạo FormRequests (`UpsertAmenityRequest`, `UpsertServiceInclusionRequest`) & Admin CRUD Controllers (`AdminAmenityController`, `AdminServiceInclusionController`).
- [x] Bổ sung Public API `GET /api/v1/public/amenities` & `GET /api/v1/public/inclusions` hỗ trợ lọc theo `?scope=`, `?kind=`, `?type=`.
- [x] Tạo `AmenitySeeder` & `ServiceInclusionSeeder` với đầy đủ dữ liệu logic cho mọi loại hình (`hotel`, `homestay`, `tour`, `vehicle`, `train`) và gọi trong `DatabaseSeeder`.
- [x] Viết Feature Test `AdminAmenitiesInclusionsTest`.

### Frontend Web (`apps/web`)

- [x] Cập nhật `adminCatalogApi.js`, `AdminSettingsPage.jsx`, `CatalogCrudTable.jsx`, `CatalogFormModal.jsx` hỗ trợ 4 tab mới: **Tiện nghi dịch vụ**, **Tiện nghi phòng**, **Bao gồm**, **Không bao gồm** kèm bộ chọn Icon Lucide và multi-checkbox Loại hình dịch vụ áp dụng.
- [x] Cập nhật `ServiceFormStepper.jsx` (Provider): tải danh sách Tiện nghi dịch vụ, Tiện nghi phòng, Bao gồm & Không bao gồm lọc theo `formData.type` để chọn nhanh một chạm (kèm nhập tùy chỉnh nếu cần).
- [x] Kiểm định `pnpm lint` và `pnpm build:web`.

---

## 3. Tiêu chuẩn nghiệm thu (DoD)

- [x] Bảng `amenities` và `service_inclusions` được migrate và seed đầy đủ dữ liệu thực tế cho tất cả loại hình dịch vụ.
- [x] Admin CRUD mượt mà 4 nhóm trên `/admin/settings` (có icon riêng cho Tiện nghi, tick/X cho Bao gồm/Không bao gồm, badge Loại hình áp dụng).
- [x] Provider chọn nhanh được Tiện nghi & Bao gồm/Không bao gồm tương ứng loại hình dịch vụ khi tạo/chỉnh sửa dịch vụ.
- [x] Pass `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint.bat --test` và `php artisan test`.
