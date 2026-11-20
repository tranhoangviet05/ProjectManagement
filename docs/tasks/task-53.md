### 1. Mục tiêu

Xây dựng chức năng **Quản lý Mã ưu đãi toàn sàn (`/admin/coupons`)** dựa trên bảng `coupons` nhằm giúp Admin chủ động tạo và điều phối các chiến dịch khuyến mãi kích cầu đặt tour và phòng lưu trú:

- Tạo mới, chỉnh sửa, theo dõi lượt sử dụng (`used_count / usage_limit`) và xóa mã ưu đãi (nếu chưa có lượt sử dụng).
- Hỗ trợ 2 hình thức giảm giá theo schema: Phần trăm (`percent`) và Số tiền cố định (`fixed`).
- Kiểm soát chặt chẽ điều kiện áp dụng (`min_order_amount`, `per_user_limit`, `valid_from`, `valid_until`).

---

### 2. Phạm vi triển khai

- **Epic cha:** #51 ([EPIC #51] Quản trị Hệ thống & Điều hành Sàn)
- **Sprint:** Sprint 3: Hoàn Thiện Phân Hệ Quản Trị Admin
- **Platform:** `Web (Admin Dashboard)` | `API (Laravel)`
- **Module:** `Admin` / `Payment`
- **Role:** `admin`
- **Priority:** `P1 (High)` | **Estimate:** `3 pts`

---

### 3. Danh sách công việc chi tiết (Checklist)

#### A. Backend API (Laravel Monorepo - `apps/api`)

- [ ] **Model & Migration check (`app/Models/Coupon.php`):**
  - Đảm bảo `$fillable` và `casts()` khớp bảng `coupons`: `code`, `type` (`percent` | `fixed`), `discount_value`, `min_order_amount`, `usage_limit`, `used_count`, `per_user_limit`, `valid_from`, `valid_until`, `created_by`.
- [ ] **Form Request (`app/Http/Requests/Admin/StoreCouponRequest.php`, `UpdateCouponRequest.php`):**
  - `code`: `required|string|max:50|alpha_dash|unique:coupons,code` (tự động `strtoupper`).
  - `type`: `required|in:percent,fixed`.
  - `discount_value`: `required|numeric|min:1` (nếu `type=percent` thì `max:100`).
  - `min_order_amount`: `nullable|numeric|min:0`.
  - `usage_limit`: `nullable|integer|min:1`.
  - `per_user_limit`: `required|integer|min:1`.
  - `valid_from` & `valid_until`: `nullable|date`, `valid_until` phải sau `valid_from`.
- [ ] **Controller & Routes (`routes/api/v1/admin.php`):**
  - Tạo `app/Http/Controllers/Api/V1/Admin/AdminCouponController.php` (`index`, `store`, `update`, `destroy`).
  - Lọc danh sách theo trạng thái tính toán: `active` (trong hạn & còn lượt), `upcoming` (chưa tới `valid_from`), `expired` (hết hạn hoặc hết lượt), `all`.
  - `destroy`: Chặn xóa nếu `used_count > 0` (`422`).

#### B. Frontend Web Portal (`apps/web`)

- [ ] **API Service (`apps/web/src/features/admin/services/adminCouponApi.js`)**
- [ ] **Trang & Components (`apps/web/src/features/admin/`):**
  - `pages/AdminCouponsPage.jsx` (route `/admin/coupons` trong `AppRouter.jsx`).
  - `components/AdminCouponsTable.jsx`: Chuẩn bảng quản lý Admin (tabs trạng thái, tìm kiếm theo mã, progress lượt dùng, nút Tạo mã / Sửa / Xóa).
  - `components/CouponFormModal.jsx`: Modal tạo/cập nhật mã ưu đãi với validation rõ ràng.

#### C. Kiểm thử (QA & Automated Tests)

- [ ] Viết Feature Test `apps/api/tests/Feature/AdminCouponManagementTest.php`:
  - Test CRUD coupon, validate trùng `code`, `percent > 100`, `valid_until < valid_from`.
  - Test chặn xóa coupon đã phát sinh `used_count > 0`.

---

### 4. Đặc tả API liên quan

- `GET /api/v1/admin/coupons?status=all&q=`
- `POST /api/v1/admin/coupons`
- `PUT /api/v1/admin/coupons/{id}`
- `DELETE /api/v1/admin/coupons/{id}`

**Body `POST /api/v1/admin/coupons`:**

```json
{
  "code": "SUMMER2026",
  "type": "percent",
  "discount_value": 15,
  "min_order_amount": 500000,
  "usage_limit": 200,
  "per_user_limit": 1,
  "valid_from": "2026-11-20T00:00:00Z",
  "valid_until": "2026-12-31T23:59:59Z"
}
```

---

### 5. Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)

- [ ] Admin tạo, sửa, xóa và lọc được toàn bộ mã ưu đãi trên `/admin/coupons`.
- [ ] Bảng và modal tuân thủ đúng design system và đồng nhất với các màn Admin khác.
- [ ] Không cho phép xóa mã đã có người sử dụng (`used_count > 0`).
- [ ] `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint --test` và `php artisan test` pass 100%.
