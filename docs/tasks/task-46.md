### 1. Mục tiêu

Xây dựng tính năng **Admin Dashboard: Kiểm duyệt & Phê duyệt/Từ chối Dịch vụ** trên Web Portal và Backend API nhằm đảm bảo chất lượng dịch vụ trước khi hiển thị công khai cho Khách du lịch (Tourist):

- Cho phép Admin xem danh sách các dịch vụ đang chờ duyệt (`pending_review`), đã duyệt (`active`), hoặc bị từ chối (`rejected`) cùng thông tin Provider sở hữu.
- Cho phép Admin xem chi tiết toàn bộ thông tin dịch vụ (mô tả, giá cơ sở, tiện ích, lịch trình theo ngày, hạng phòng, album ảnh/video).
- Cung cấp luồng **Phê duyệt (`active`)** hoặc **Từ chối (`rejected` kèm lý do bắt buộc `rejection_reason`)** để Provider nhận phản hồi và chỉnh sửa lại.

---

### 2. Phạm vi triển khai

- **Epic cha:** #15 ([EPIC #15] Quản lý Dịch vụ)
- **Sprint:** Sprint 2: Quản Lý Dịch Vụ & Khám Phá Trải Nghiệm
- **Platform:** `Web (Admin Dashboard)` | `API (Laravel)`
- **Module:** `Admin` / `Service`
- **Role:** `admin` (chỉ tài khoản có vai trò `admin` mới được phép truy cập các endpoint và màn hình kiểm duyệt)
- **Priority:** `P0 (Critical)` | **Estimate:** `2 pts`

---

### 3. Danh sách công việc chi tiết (Checklist)

#### A. Backend API (Laravel Monorepo - `apps/api`)

- [ ] **Form Request & Validation:**
  - Tạo `app/Http/Requests/Admin/RejectServiceRequest.php`:
    - `rejection_reason`: `['required', 'string', 'min:10', 'max:1000']` (bắt buộc Admin nêu rõ lý do từ chối để Provider khắc phục).
- [ ] **Controller & Routes (`routes/api/v1/admin.php`):**
  - Middleware: `firebase.auth`, `role:admin`.
  - Tạo `app/Http/Controllers/Api/V1/Admin/AdminServiceController.php`:
    - `index(Request $request)`:
      - Trả về danh sách dịch vụ có phân trang (`per_page`), hỗ trợ lọc theo `status` (`pending_review`, `active`, `rejected`, `draft`), `type` (`tour`, `hotel`, `homestay`, `vehicle`) và tìm kiếm theo từ khóa `q` (tên dịch vụ hoặc tên doanh nghiệp Provider).
      - Kèm thống kê số lượng (`counts`: `pending_review`, `active`, `rejected`) để Admin Dashboard hiển thị badge thông báo.
    - `show(int $id)`:
      - Trả về chi tiết dịch vụ kèm quan hệ `provider` (thông tin doanh nghiệp), `category`, `location`, `media`, `schedules`, `roomTypes`.
    - `approve(int $id)`:
      - Kiểm tra dịch vụ phải đang ở trạng thái `pending_review` (nếu đã `active` hoặc `draft`, trả về `422` với thông báo trạng thái không hợp lệ để duyệt).
      - Cập nhật `status = 'active'`, `rejection_reason = null`.
    - `reject(RejectServiceRequest $request, int $id)`:
      - Kiểm tra dịch vụ phải đang ở trạng thái `pending_review` (hoặc `active` nếu cần gỡ xuống).
      - Cập nhật `status = 'rejected'`, `rejection_reason = $request->validated('rejection_reason')`.
  - Đăng ký routes trong `routes/api/v1/admin.php` dưới prefix `services`:
    - `GET /api/v1/admin/services`
    - `GET /api/v1/admin/services/{id}`
    - `POST /api/v1/admin/services/{id}/approve`
    - `POST /api/v1/admin/services/{id}/reject`

#### B. Frontend Web Portal (`apps/web`)

- [ ] **Service (`apps/web/src/features/admin/services/adminServiceModerationApi.js`):**
  - Kết nối các API lấy danh sách dịch vụ, xem chi tiết, phê duyệt và từ chối kèm lý do.
- [ ] **Trang & Components Kiểm duyệt (`apps/web/src/features/admin/`):**
  - Tạo `pages/AdminServiceModerationPage.jsx` theo cấu trúc chuẩn đồng bộ với `AdminProviderKycPage.jsx`:
    - Các tab lọc nhanh: **Chờ duyệt (`pending_review`)**, **Đang hoạt động (`active`)**, **Đã từ chối (`rejected`)**, **Tất cả**.
    - Thanh tìm kiếm theo tên dịch vụ / tên nhà cung cấp và bộ lọc loại hình dịch vụ.
  - Tạo `components/ServiceModerationTable.jsx`: Hiển thị ảnh bìa, tên dịch vụ, loại hình, Provider, giá cơ sở, trạng thái, ngày gửi duyệt và nút **"Xem & Duyệt"**.
  - Tạo `components/ServiceDetailReviewModal.jsx`: Modal xem chi tiết toàn bộ album ảnh, mô tả, tiện ích, lịch trình theo ngày / hạng phòng, nút **"Phê duyệt lên sàn"** và **"Từ chối"**.
  - Tạo `components/ServiceRejectDialog.jsx`: Modal nhập lý do từ chối (tối thiểu 10 ký tự) khi Admin bấm Từ chối.
- [ ] **Sidebar & Routing (`AdminSidebar.jsx`, `App.jsx`):**
  - Bổ sung mục **"Kiểm duyệt Dịch vụ"** vào `AdminSidebar.jsx` kèm badge đếm số dịch vụ `pending_review`.
  - Khai báo route `/admin/services` trong `App.jsx`.

#### C. Kiểm thử Tự động (QA - `apps/api/tests/Feature/`)

- [ ] Tạo `apps/api/tests/Feature/AdminServiceModerationTest.php` kiểm tra:
  - Admin xem được danh sách và chi tiết dịch vụ chờ duyệt (`200 OK`).
  - Admin phê duyệt dịch vụ `pending_review` -> đổi thành `active`, xóa `rejection_reason`.
  - Admin từ chối dịch vụ mà thiếu `rejection_reason` hoặc quá ngắn -> lỗi `422`.
  - Admin từ chối dịch vụ hợp lệ -> đổi thành `rejected` và lưu chính xác `rejection_reason`.
  - Tài khoản `provider` hoặc `tourist` gọi vào `/api/v1/admin/services/*` bị chặn với HTTP `403`.

---

### 4. Đặc tả API liên quan

- **`GET /api/v1/admin/services`**
  - Headers: `Authorization: Bearer <token>`
  - Query params: `status=pending_review` (optional), `type` (optional), `q` (optional), `per_page=15`
  - Response (`200 OK`):
    ```json
    {
      "success": true,
      "counts": {
        "pending_review": 3,
        "active": 12,
        "rejected": 1
      },
      "data": [
        {
          "id": 1,
          "name": "Tour Lặn Ngắm San Hô Cù Lao Chàm 1 Ngày",
          "slug": "tour-lan-ngam-san-ho-cu-lao-cham-1-ngay",
          "type": "tour",
          "status": "pending_review",
          "base_price": "650000.00",
          "price_unit": "người",
          "provider": {
            "id": 1,
            "business_name": "Đà Nẵng Ocean Travel & Retreat"
          },
          "cover_image": "http://localhost:8000/storage/services/1/uuid-1.jpg",
          "created_at": "2026-11-19T08:00:00Z"
        }
      ],
      "meta": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 15,
        "total": 1
      }
    }
    ```

- **`POST /api/v1/admin/services/{id}/approve`**
  - Headers: `Authorization: Bearer <token>`
  - Response (`200 OK`):
    ```json
    {
      "success": true,
      "message": "Đã phê duyệt dịch vụ hiển thị công khai.",
      "data": {
        "id": 1,
        "status": "active",
        "rejection_reason": null
      }
    }
    ```

- **`POST /api/v1/admin/services/{id}/reject`**
  - Headers: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "rejection_reason": "Hình ảnh album bị mờ và thiếu lịch trình chi tiết buổi chiều."
    }
    ```
  - Response (`200 OK`):
    ```json
    {
      "success": true,
      "message": "Đã từ chối dịch vụ và gửi phản hồi cho đối tác.",
      "data": {
        "id": 1,
        "status": "rejected",
        "rejection_reason": "Hình ảnh album bị mờ và thiếu lịch trình chi tiết buổi chiều."
      }
    }
    ```

---

### 5. Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)

- [ ] Chỉ tài khoản `admin` mới truy cập được API và màn hình kiểm duyệt dịch vụ; `provider` và `tourist` bị chặn (`403`).
- [ ] Admin xem được đầy đủ thông tin chi tiết, album ảnh, lịch trình của dịch vụ `pending_review`.
- [ ] Phê duyệt chuyển `status` sang `active` (sẵn sàng hiển thị cho Tourist tìm kiếm ở EPIC tiếp theo); Từ chối bắt buộc có lý do và lưu chính xác `rejection_reason` để Provider xem được.
- [ ] `AdminServiceModerationTest.php`, `pnpm lint`, `pnpm build:web` và `./vendor/bin/pint --test` chạy pass 100%.
