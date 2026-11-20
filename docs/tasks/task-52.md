### 1. Mục tiêu

Xây dựng chức năng **Quản lý Tài khoản Người dùng (`/admin/users`)** giúp Admin giám sát, tra cứu và kiểm soát tài khoản **Nhà cung cấp (`provider`)** và **Khách du lịch (`tourist`)** trên nền tảng:

- Xem danh sách tài khoản (`provider`, `tourist` — không bao gồm tài khoản `admin`) kèm trạng thái (`active`, `banned`, `pending`), thông tin liên hệ và trạng thái kích hoạt Ví điện tử (`Đã kích hoạt` kèm số dư hoặc `Chưa kích hoạt` nếu chưa có bản ghi trong `wallets`).
- Xem chi tiết hồ sơ người dùng (`tourist_profiles` hoặc `provider_profiles`, số lượng dịch vụ/đơn đặt).
- Thực hiện **Khóa (`banned`)** hoặc **Mở khóa (`active`)** tài khoản vi phạm (có biện pháp bảo vệ: Admin không thể tự khóa chính tài khoản đang đăng nhập).

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

- [ ] **Form Request & Validation:**
  - Tạo `app/Http/Requests/Admin/UpdateUserStatusRequest.php`:
    - `status`: `['required', 'in:active,banned']`
    - `reason`: `['nullable', 'string', 'max:500']` (bắt buộc khi `status = 'banned'`).
- [ ] **Controller & Routes (`routes/api/v1/admin.php`):**
  - Middleware: `firebase.auth`, `role:admin`.
  - Tạo `app/Http/Controllers/Api/V1/Admin/AdminUserController.php`:
    - `index(Request $request)`: Phân trang, lọc theo `role` (`all`, `tourist`, `provider`, `admin`), `status` (`all`, `active`, `banned`, `pending`), tìm kiếm `q` (theo `name`, `email`, `phone`). Trả kèm `counts` theo vai trò & trạng thái.
    - `show(int $id)`: Trả về thông tin chi tiết user, `touristProfile`, `providerProfile.businessType`, `wallet`, số lượng `services` / `bookings`.
    - `updateStatus(UpdateUserStatusRequest $request, int $id)`: Chặn nếu `$id === $request->user()->id` (trả `422`), cập nhật `users.status`. Nếu khóa tài khoản (`banned`), thu hồi Sanctum tokens hiện tại của user đó (`$user->tokens()->delete()`).

#### B. Frontend Web Portal (`apps/web`)

- [ ] **API Service (`apps/web/src/features/admin/services/adminUserApi.js`)**:
  - `listUsers(params)`, `getUserDetail(id)`, `updateUserStatus(id, payload)`.
- [ ] **Trang & Components (`apps/web/src/features/admin/`):**
  - `pages/AdminUsersPage.jsx` (route `/admin/users` trong `AppRouter.jsx`).
  - `components/AdminUsersTable.jsx`: Tuân thủ chuẩn bảng thống nhất (`rounded-xl border border-border-subtle`, tabs lọc `role`/`status`, search, Skeleton dạng dòng bảng, footer tổng số).
  - `components/UserDetailModal.jsx`: Hiển thị hồ sơ chi tiết Tourist/Provider, ví và nút Khóa/Mở khóa.
  - `components/UserBanDialog.jsx`: Dialog xác nhận khóa tài khoản kèm lý do (tối thiểu 10 ký tự).

#### C. Kiểm thử (QA & Automated Tests)

- [ ] Viết Feature Test `apps/api/tests/Feature/AdminUserManagementTest.php`:
  - Admin lọc, tìm kiếm, xem chi tiết user.
  - Admin khóa/mở khóa tài khoản thành công; tài khoản bị khóa bị thu hồi token.
  - Admin không thể tự khóa chính mình (`422`); Tourist/Provider gọi API nhận `403`.

---

### 4. Đặc tả API liên quan

- `GET /api/v1/admin/users?role=all&status=all&q=&page=1`
- `GET /api/v1/admin/users/{id}`
- `PATCH /api/v1/admin/users/{id}/status`

**Body `PATCH /status`:**

```json
{
  "status": "banned",
  "reason": "Tài khoản có hành vi spam đánh giá ảo nhiều lần."
}
```

---

### 5. Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)

- [ ] Trang `/admin/users` hoạt động mượt mà với bộ lọc vai trò, trạng thái và tìm kiếm.
- [ ] Giao diện bảng và modal đồng nhất hoàn toàn với `ProviderKycTable` và `ServiceModerationTable`.
- [ ] Khóa tài khoản sẽ thu hồi phiên đăng nhập hiện hành của user đó; không thể tự khóa chính mình.
- [ ] `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint --test` và `php artisan test` pass 100%.
