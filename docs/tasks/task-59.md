### 1. Mục tiêu

Tái cấu trúc cơ chế quản lý trạng thái bộ lọc, tab phân loại, tìm kiếm và điều hướng trên **Web Portal (cả phân hệ Admin và Provider)** bằng `useSearchParams()` của `react-router-dom`, đồng thời thiết lập quy chuẩn đồng bộ Navigation/Query Params cho **Mobile App (Tourist)**:

- Khi người dùng chuyển tab, chọn bộ lọc trạng thái/vai trò/loại hình hoặc tìm kiếm, thanh địa chỉ trình duyệt tự động cập nhật query string (ví dụ: `/admin/providers?status=pending`, `/admin/services?status=pending_review&type=tour`, `/admin/settings?tab=categories`, `/provider/services?status=active`).
- Nhấn **F5 (tải lại trang)**, dùng nút **Back / Forward** của trình duyệt hoặc **chia sẻ đường link** sẽ giữ nguyên đúng tab và bộ lọc đang xem.
- **Giữ nguyên `useState()`** cho các trạng thái giao diện cục bộ/tạm thời: `isLoading`, `isSubmitting`, `toast`, dữ liệu form đang nhập dở trong Modal/Dialog, trạng thái đóng/mở menu.

---

### 2. Phạm vi triển khai

- **Epic cha:** #51 ([EPIC #51] Quản trị Hệ thống & Điều hành Sàn)
- **Sprint:** Sprint 2: Quản Lý Dịch Vụ, Admin Operations & Khám Phá Trải Nghiệm
- **Platform:** `Web (Admin & Provider Portal)` | `Mobile (Quy chuẩn cho Tourist)`
- **Module:** `Admin` / `Booking`
- **Role:** `admin`, `provider`, `user`
- **Priority:** `P1 (High)` | **Estimate:** `2 pts`

---

### 3. Danh sách công việc chi tiết (Checklist)

#### A. Phân hệ Quản trị Admin (`apps/web/src/features/admin/pages/`)

- [ ] **Trang Kiểm duyệt Nhà cung cấp (`AdminProviderKycPage.jsx` — `/admin/providers`):**
  - Đồng bộ `status` (`all`, `pending`, `approved`, `rejected`) và `q` (từ khóa tìm kiếm) qua `useSearchParams()`.
  - Giữ `useState` cho `providers`, `isLoading`, `pendingCount`, `selectedProvider`, `rejectingProvider`, `toastMessage`.
- [ ] **Trang Kiểm duyệt Dịch vụ (`AdminServiceModerationPage.jsx` — `/admin/services`):**
  - Đồng bộ `status` (`pending_review`, `active`, `rejected`, `all`), `type` (`all`, `tour`, `hotel`, `homestay`, `vehicle`) và `q` qua `useSearchParams()`.
  - Giữ `useState` cho `services`, `counts`, `isLoading`, `isLoadingDetail`, `isSubmitting`, `toast`, `detailService`, `rejectTarget`.
- [ ] **Trang Quản lý Tài khoản (`AdminUsersPage.jsx` — `/admin/users`):**
  - Đồng bộ `role` (`all`, `provider`, `tourist`), `status` (`all`, `active`, `banned`, `pending`) và `q` qua `useSearchParams()`.
  - Giữ `useState` cho `users`, `counts`, `isLoading`, `isLoadingDetail`, `isSubmitting`, `toast`, `detailUser`, `banTarget`.
- [ ] **Trang Mã ưu đãi toàn sàn (`AdminCouponsPage.jsx` — `/admin/coupons`):**
  - Đồng bộ `status` (`all`, `active`, `upcoming`, `expired`) và `q` qua `useSearchParams()`.
  - Giữ `useState` cho `coupons`, `counts`, `isLoading`, `isSubmitting`, `toast`, `formTarget`, `grantTarget`.
- [ ] **Trang Cấu hình Hệ thống (`AdminSettingsPage.jsx` — `/admin/settings`):**
  - Đồng bộ `tab` (`locations`, `categories`, `businessTypes`) và `q` qua `useSearchParams()`.
  - Giữ `useState` cho `items`, `allLocations`, `isLoading`, `isSubmitting`, `toast`, `modalTarget`.

#### B. Phân hệ Nhà cung cấp Provider (`apps/web/src/features/provider/pages/`)

- [ ] **Trang Quản lý Dịch vụ (`ServiceManagementPage.jsx` — `/provider/services`):**
  - Đồng bộ bộ lọc `status` (`all`, `active`, `pending_review`, `draft`, `rejected`), từ khóa tìm kiếm `q`, hoặc chế độ tạo/chỉnh sửa (`?action=create`, `?edit=<id>`) với `useSearchParams()`.
- [ ] **Trang Quản lý Lịch phục vụ & Bảng giá (`ServiceAvailabilityPage.jsx` — `/provider/services/availability`):**
  - Đồng bộ `service_id` đang chọn lên URL (`?service_id=<id>`) để khi F5 vẫn giữ đúng dịch vụ đang cấu hình lịch.

#### C. Quy chuẩn áp dụng cho Ứng dụng Mobile Tourist (`docs/coding-conventions.md`)

- [ ] Bổ sung mục **Quy chuẩn Quản lý Trạng thái URL (`useSearchParams`) & Navigation Params** vào `docs/coding-conventions.md` để bắt buộc áp dụng thống nhất khi xây dựng các màn hình Tourist (Tìm kiếm điểm đến, lọc khoảng giá, chi tiết dịch vụ `serviceId`, chi tiết đơn đặt `bookingCode`).

---

### 4. Đặc tả cấu trúc URL Query Parameters

| Đường dẫn gốc                         | Query Parameters đồng bộ trên URL | Ví dụ URL thực tế                                               |
| :------------------------------------ | :-------------------------------- | :-------------------------------------------------------------- |
| `/admin/providers`                    | `status`, `q`                     | `/admin/providers?status=pending&q=ocean`                       |
| `/admin/services`                     | `status`, `type`, `q`             | `/admin/services?status=pending_review&type=tour`               |
| `/admin/users`                        | `role`, `status`, `q`             | `/admin/users?role=provider&status=active`                      |
| `/admin/coupons`                      | `status`, `q`                     | `/admin/coupons?status=active&q=SUMMER`                         |
| `/admin/settings`                     | `tab`, `q`                        | `/admin/settings?tab=categories`                                |
| `/provider/services`                  | `status`, `q`, `mode`, `id`       | `/provider/services?status=all&mode=edit&id=18`                 |
| `/provider/services/:id/availability` | `tab`, `month`                    | `/provider/services/18/availability?tab=calendar&month=2026-11` |
| `/provider/profile`                   | `tab`                             | `/provider/profile?tab=wallet`                                  |

_(Lưu ý: Luôn hiển thị rõ tham số tab/bộ lọc mặc định trên thanh URL ngay khi vào trang; chỉ xóa tham số tìm kiếm `q` khi ô tìm kiếm rỗng.)_

---

### 5. Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)

- [ ] Bấm chuyển tab hoặc chọn bộ lọc trên tất cả các trang quản trị Admin & Provider sẽ cập nhật ngay query string trên thanh địa chỉ trình duyệt.
- [ ] Nhấn F5 hoặc mở trực tiếp URL có kèm query params sẽ khôi phục chính xác tab, bộ lọc và kết quả tương ứng.
- [ ] Các trạng thái tạm thời (loading, modal, form input đang gõ, toast) vẫn dùng `useState` mượt mà, không làm rác lịch sử trình duyệt.
- [ ] `pnpm lint` và `pnpm build:web` pass 100% không lỗi.
