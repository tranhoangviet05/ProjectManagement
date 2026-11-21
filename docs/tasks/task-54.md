### 1. Mục tiêu

Xây dựng trang **Cấu hình Danh mục & Điểm đến Hệ thống (`/admin/settings`)** để Admin chủ động quản lý toàn bộ dữ liệu gốc (Master Data) phục vụ cho việc Provider đăng dịch vụ và Tourist tìm kiếm:

- Quản lý **Điểm đến (`locations`)**: Thêm/sửa/xóa điểm đến (Đà Nẵng, Hội An, Phú Quốc...), ảnh đại diện, quốc gia, đánh dấu điểm đến nổi bật (`is_popular`).
- Quản lý **Danh mục dịch vụ (`categories`)**: Thêm/sửa/xóa danh mục trải nghiệm (`Tour Biển Đảo`, `Nghỉ dưỡng`, `Ẩm thực`...).
- Quản lý **Loại hình kinh doanh (`business_types`)**: Theo dõi và cập nhật danh sách loại hình đối tác (`Chỗ ở`, `Giải trí`, `Di chuyển`).

---

### 2. Phạm vi triển khai

- **Epic cha:** #51 ([EPIC #51] Quản trị Hệ thống & Điều hành Sàn)
- **Sprint:** Sprint 3: Hoàn Thiện Phân Hệ Quản Trị Admin
- **Platform:** `Web (Admin Dashboard)` | `API (Laravel)`
- **Module:** `Admin`
- **Role:** `admin`
- **Priority:** `P0 (Critical)` | **Estimate:** `3 pts`

---

### 3. Danh sách công việc chi tiết (Checklist)

#### A. Backend API (Laravel Monorepo - `apps/api`)

- [ ] **Controllers & Routes (`routes/api/v1/admin.php`):**
  - Tạo `AdminLocationController` (`index`, `store`, `update`, `destroy`):
    - Tự sinh `slug` duy nhất từ `name` nếu không truyền; hỗ trợ `is_popular`, `country_code`, `image_url`, `description`, `parent_id`.
    - Chặn xóa `location` nếu đang có `services` gắn kết (`422`).
  - Tạo `AdminCategoryController` (`index`, `store`, `update`, `destroy`):
    - Tự sinh `slug` duy nhất; hỗ trợ `icon`, `icon_url`, `description`.
    - Chặn xóa `category` nếu đang có `services` gắn kết (`422`).
  - Tạo `AdminBusinessTypeController` (`index`, `store`, `update`, `destroy`):
    - Quản lý `name`, `slug`, `type` (`Chỗ ở`, `Giải trí`, `Phương tiện`, `Ăn uống`); chặn xóa nếu có `provider_profiles` tham chiếu.

#### B. Frontend Web Portal (`apps/web`)

- [ ] **API Service (`apps/web/src/features/admin/services/adminCatalogApi.js`)**
- [ ] **Trang & Components (`apps/web/src/features/admin/`):**
  - `pages/AdminSettingsPage.jsx` (route `/admin/settings` trong `AppRouter.jsx`) với 3 tab rõ ràng: **Điểm đến (`locations`)**, **Danh mục (`categories`)**, **Loại hình đối tác (`business_types`)**.
  - `components/CatalogCrudTable.jsx` & `components/CatalogFormModal.jsx`: Bảng quản lý đồng bộ chuẩn UI Admin + form thêm/sửa nhanh gọn, có upload ảnh điểm đến qua Cloudinary/Media API.

#### C. Kiểm thử (QA & Automated Tests)

- [ ] Viết Feature Test `apps/api/tests/Feature/AdminCatalogManagementTest.php`:
  - CRUD `locations`, `categories`, `business_types`.
  - Test chặn xóa `location`/`category` đang được `services` tham chiếu.

---

### 4. Đặc tả API liên quan

- `GET/POST /api/v1/admin/locations` | `PUT/DELETE /api/v1/admin/locations/{id}`
- `GET/POST /api/v1/admin/categories` | `PUT/DELETE /api/v1/admin/categories/{id}`
- `GET/POST /api/v1/admin/business-types` | `PUT /api/v1/admin/business-types/{id}`

**Body `POST /api/v1/admin/locations`:**

```json
{
  "name": "Quy Nhơn",
  "country_code": "VN",
  "is_popular": true,
  "image_url": "https://res.cloudinary.com/.../quynhon.jpg",
  "description": "Thành phố biển miền Trung với Eo Gió, Kỳ Co."
}
```

---

### 5. Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)

- [ ] Admin thêm/sửa/xóa điểm đến và danh mục thành công từ `/admin/settings`; dữ liệu mới xuất hiện ngay trong form tạo dịch vụ của Provider.
- [ ] Không cho phép xóa điểm đến/danh mục đang gắn với dịch vụ tồn tại.
- [ ] `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint --test` và `php artisan test` pass 100%.
