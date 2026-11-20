### 1. Mục tiêu

Nâng cấp trang **Tổng quan vận hành (`/admin/dashboard`)** sử dụng số liệu thực tế từ PostgreSQL thay cho dữ liệu tĩnh, đồng thời bổ sung màn hình **Giám sát Đơn đặt chỗ & Đối soát Ví (`/admin/bookings`)** giúp Admin theo dõi toàn bộ dòng tiền và xử lý khiếu nại trên sàn:

- **Dashboard Tổng quan (`/admin/dashboard`)**: Thống kê KPI thực tế (Tổng doanh thu GMV, tổng đơn đặt chỗ, đối tác chờ duyệt KYC, dịch vụ chờ duyệt, tổng người dùng hoạt động) + danh sách tác vụ cần xử lý ngay.
- **Giám sát Đơn đặt chỗ & Đối soát (`/admin/bookings`)**: Tra cứu đơn đặt chỗ (`bookings`), trạng thái thanh toán Sepay (`payments`), dòng tiền Escrow -> Ví Provider (`wallet_transactions`), hỗ trợ lọc theo trạng thái và mã đơn `booking_code`.

---

### 2. Phạm vi triển khai

- **Epic cha:** #51 ([EPIC #51] Quản trị Hệ thống & Điều hành Sàn)
- **Sprint:** Sprint 3: Hoàn Thiện Phân Hệ Quản Trị Admin
- **Platform:** `Web (Admin Dashboard)` | `API (Laravel)`
- **Module:** `Admin` / `Booking` / `Payment`
- **Role:** `admin`
- **Priority:** `P0 (Critical)` | **Estimate:** `4 pts`

---

### 3. Danh sách công việc chi tiết (Checklist)

#### A. Backend API (Laravel Monorepo - `apps/api`)

- [ ] **Dashboard Overview Controller (`app/Http/Controllers/Api/V1/Admin/AdminDashboardController.php`):**
  - `overview()`: Trả về thống kê thực tế:
    - `kpis`: `pending_providers_count`, `pending_services_count`, `active_services_count`, `total_users_count`, `total_bookings_count`, `total_gmv` (tổng `total_amount` của các booking `confirmed` / `checked_in` / `completed`).
    - `recent_pending_providers`: 5 hồ sơ KYC mới nhất.
    - `recent_pending_services`: 5 dịch vụ chờ duyệt mới nhất.
    - `recent_bookings`: 5 đơn đặt chỗ gần nhất.
- [ ] **Booking & Payment Oversight Controller (`app/Http/Controllers/Api/V1/Admin/AdminBookingController.php`):**
  - `index(Request $request)`: Phân trang danh sách `bookings` (eager-load `user`, `service`, `provider`, `payments`), lọc theo `status` (`pending_payment`, `confirmed`, `checked_in`, `completed`, `cancelled`, `refunded`), `payment_status`, khoảng ngày, tìm kiếm theo `booking_code` hoặc tên khách.
  - `show(int $id)`: Chi tiết booking, lịch sử `payments` (kể cả `gateway_response`), trạng thái Escrow và `wallet_transactions` liên quan.

#### B. Frontend Web Portal (`apps/web`)

- [ ] **API Services:** `adminDashboardApi.js` & `adminBookingApi.js`.
- [ ] **Nâng cấp `AdminDashboardPage.jsx` (`/admin/dashboard`):**
  - Thay thế các số liệu hardcode bằng dữ liệu thực từ `GET /api/v1/admin/dashboard`.
  - Hiển thị Skeleton khi đang tải; điều hướng nhanh sang `/admin/providers`, `/admin/services`, `/admin/bookings`.
- [ ] **Trang Giám sát Đơn đặt chỗ (`pages/AdminBookingsPage.jsx`, `components/AdminBookingsTable.jsx`, `components/BookingOversightModal.jsx`):**
  - Thêm mục điều hướng `Đơn đặt chỗ & Đối soát` (`/admin/bookings`) vào `AdminSidebar.jsx` và `AppRouter.jsx`.
  - Tuân thủ chuẩn bảng quản lý thống nhất với `ProviderKycTable` & `ServiceModerationTable`.

#### C. Kiểm thử (QA & Automated Tests)

- [ ] Viết Feature Test `apps/api/tests/Feature/AdminDashboardAndBookingTest.php`:
  - Kiểm tra API `/api/v1/admin/dashboard` trả đúng tổng KPI từ dữ liệu DB.
  - Kiểm tra API `/api/v1/admin/bookings` và `/api/v1/admin/bookings/{id}` lọc và trả đúng quan hệ `payments`.

---

### 4. Đặc tả API liên quan

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/bookings?status=all&q=&page=1`
- `GET /api/v1/admin/bookings/{id}`

**Response mẫu `GET /api/v1/admin/dashboard`:**

```json
{
  "success": true,
  "data": {
    "kpis": {
      "pending_providers_count": 2,
      "pending_services_count": 4,
      "active_services_count": 12,
      "total_users_count": 45,
      "total_bookings_count": 18,
      "total_gmv": 32500000
    },
    "recent_pending_providers": [],
    "recent_pending_services": [],
    "recent_bookings": []
  }
}
```

---

### 5. Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)

- [ ] `/admin/dashboard` hiển thị 100% số liệu thật từ DB, không còn dữ liệu giả lập.
- [ ] `/admin/bookings` hiển thị đầy đủ danh sách đơn đặt chỗ, trạng thái thanh toán và chi tiết đối soát.
- [ ] `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint --test` và `php artisan test` pass 100%.
