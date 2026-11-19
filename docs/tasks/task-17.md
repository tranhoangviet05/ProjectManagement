### 1. Mục tiêu

Xây dựng phân hệ **Cấu hình Lịch phục vụ (Availability), Bảng giá theo ngày** và **Quản lý Hạng phòng Lưu trú** dành cho Provider trên Web Portal và Backend API:

- Cho phép Provider thiết lập số lượng chỗ/phòng mở bán (`total_slots`), đóng/mở nhận khách theo từng ngày (`is_blocked`), và ghi đè giá linh hoạt vào các dịp cuối tuần/lễ tết (`price_override`) trên bảng `service_availability`.
- Đối với các dịch vụ lưu trú (`hotel`, `homestay`), cho phép Provider cấu hình chi tiết từng hạng phòng (`hotel_room_types`: tên hạng phòng, cấp bậc `rank`, giá cơ sở, tổng số phòng, số phòng còn trống `inventory`, sức chứa người lớn/trẻ em, tiện ích và trạng thái `active`/`inactive`).
- Đảm bảo tính toàn vẹn dữ liệu: Không cho phép giảm `total_slots` xuống thấp hơn số lượng đã đặt (`booked_slots`) và đồng bộ tức thì để Tourist App (Sprint 2/3) chỉ đặt được vào những ngày còn chỗ và không bị khóa (`is_blocked = false`).

---

### 2. Phạm vi triển khai

- **Epic cha:** #15 ([EPIC] Quản lý Dịch vụ (Provider Portal))
- **Sprint:** Sprint 2: Quản Lý Dịch Vụ & Khám Phá Trải Nghiệm
- **Platform:** `Web (Provider Portal)` | `API (Laravel)`
- **Module:** `Booking` / `Service`
- **Role:** `provider` (chỉ chủ sở hữu dịch vụ mới được phép cấu hình lịch và hạng phòng)
- **Priority:** `P0 (Critical)` | **Estimate:** `3 pts`

---

### 3. Danh sách công việc chi tiết (Checklist)

#### A. Backend API (Laravel Monorepo - `apps/api`)

- [ ] **Tạo Eloquent Model còn thiếu:**
  - Tạo `app/Models/ServiceAvailability.php`:
    - Khai báo `$table = 'service_availability'`.
    - `$fillable`: `service_id`, `available_date`, `total_slots`, `booked_slots`, `price_override`, `is_blocked`.
    - `casts()`: `available_date => 'date:Y-m-d'`, `total_slots => 'integer'`, `booked_slots => 'integer'`, `price_override => 'decimal:2'`, `is_blocked => 'boolean'`.
    - Quan hệ `service(): BelongsTo`.
  - Rà soát `app/Models/HotelRoomType.php` (đã có `fillable` và `casts()` khớp hoàn toàn với migration `hotel_room_types`).
- [ ] **Form Requests & Validation:**
  - Tạo `app/Http/Requests/Provider/UpsertAvailabilityRequest.php`:
    - Hỗ trợ cập nhật theo danh sách ngày hoặc khoảng ngày (`start_date`, `end_date`, hoặc mảng `dates[]`).
    - `dates` / `start_date` (`required|date|after_or_equal:today`), `end_date` (`nullable|date|after_or_equal:start_date`).
    - `days_of_week` (`nullable|array` — tùy chọn lọc thứ trong tuần `0..6` để cấu hình giá cuối tuần nhanh chóng).
    - `total_slots` (`required|integer|min:0`), `price_override` (`nullable|numeric|min:0`), `is_blocked` (`required|boolean`).
  - Tạo `app/Http/Requests/Provider/StoreHotelRoomTypeRequest.php` và `UpdateHotelRoomTypeRequest.php`:
    - `name` (`required|string|max:255`), `rank` (`nullable|string|max:100`), `description` (`nullable|string`).
    - `base_price` (`required|numeric|min:0`), `total_rooms` (`required|integer|min:1`), `inventory` (`nullable|integer|min:0|lte:total_rooms`).
    - `capacity_adults` (`required|integer|min:1`), `capacity_children` (`nullable|integer|min:0`).
    - `amenities` (`nullable|array`), `images` (`nullable|array`), `status` (`nullable|in:active,inactive`).
- [ ] **Controller & Routes (`routes/api/v1/provider.php`):**
  - Tạo `app/Http/Controllers/Api/V1/Provider/ServiceAvailabilityController.php`:
    - `index(Request $request, int $serviceId)`: Lấy danh sách lịch phục vụ `service_availability` của dịch vụ theo khoảng `from` và `to` (mặc định 30 ngày kể từ hôm nay), kèm giá mặc định `base_price` và `max_guests` của dịch vụ để FE tính toán hiển thị.
    - `upsert(UpsertAvailabilityRequest $request, int $serviceId)`: Thực hiện `DB::transaction` upsert theo khóa duy nhất `['service_id', 'available_date']`. Nếu ngày đó đã có bản ghi với `booked_slots > total_slots` mới gửi lên, trả về lỗi `422` chi tiết theo từng ngày vi phạm.
  - Tạo `app/Http/Controllers/Api/V1/Provider/HotelRoomTypeController.php`:
    - Kiểm tra dịch vụ phải có `type` thuộc `hotel` hoặc `homestay` (nếu là `tour`/`vehicle` trả về `422`).
    - `index`, `store`, `update`, `destroy` cho `/api/v1/provider/services/{serviceId}/room-types`.

#### B. Frontend Web Portal (`apps/web`)

- [ ] **Service (`apps/web/src/features/provider/services/providerAvailabilityApi.js`):**
  - Kết nối các endpoint lấy lịch theo tháng/khoảng ngày, cập nhật hàng loạt lịch & giá theo ngày, và CRUD hạng phòng khách sạn/homestay.
- [ ] **Trang Cấu hình Lịch & Giá (`pages/ServiceAvailabilityPage.jsx`):**
  - Giao diện **Lịch biểu trực quan (Calendar View)** theo từng tháng (nút Tháng trước / Tháng sau).
  - Mỗi ô ngày hiển thị rõ: Trạng thái (`Mở bán` / `Đóng bán`), Số chỗ (`booked_slots / total_slots`), và Giá áp dụng (hiển thị nổi bật nếu có `price_override` khác `base_price`).
  - Hỗ trợ **chọn 1 ngày** hoặc **chọn nhanh khoảng ngày / cuối tuần (Bulk Selection)** để mở panel cấu hình bên phải:
    - Bật/tắt công tắc **"Đóng bán ngày này (`is_blocked`)"**.
    - Nhập số chỗ mở bán (`total_slots`).
    - Nhập giá tùy chỉnh theo ngày (`price_override`, để trống để dùng giá gốc `base_price`).
  - Đối với dịch vụ `hotel` / `homestay`, hiển thị thêm tab **"Quản lý Hạng phòng (`RoomTypesManager.jsx`)"** cho phép thêm/sửa/ẩn hiện các loại phòng (Standard, Deluxe, Suite...).
- [ ] **Điều hướng:**
  - Gắn route `/provider/services/:id/availability` trong `App.jsx` và nút **"Cấu hình Lịch & Giá"** từ trang `ServiceManagementPage.jsx`.

#### C. Kiểm thử Tự động (QA - `apps/api/tests/Feature/`)

- [ ] Tạo `apps/api/tests/Feature/ServiceAvailabilityTest.php` kiểm tra:
  - Provider cấu hình mở/đóng bán và giá lễ (`price_override`) cho khoảng ngày thành công (`200 OK`), cập nhật đúng bản ghi trong `service_availability` mà không bị lỗi duplicate unique key.
  - Ngăn chặn giảm `total_slots` xuống nhỏ hơn `booked_slots` hiện có (`422 Unprocessable Entity`).
  - Provider khác không thể xem/cập nhật lịch hoặc hạng phòng của dịch vụ không thuộc sở hữu (`403`/`404`).
  - CRUD hạng phòng `hotel_room_types` thành công với dịch vụ `hotel`/`homestay`, và bị chặn (`422`) nếu tạo hạng phòng cho dịch vụ `tour`.

---

### 4. Đặc tả API liên quan

- **`GET /api/v1/provider/services/{serviceId}/availability`**
  - Headers: `Authorization: Bearer <token>`
  - Query params: `from=2026-11-01&to=2026-11-30`
  - Response (`200 OK`):
    ```json
    {
      "success": true,
      "data": {
        "service": {
          "id": 1,
          "name": "Tour Lặn Ngắm San Hô Cù Lao Chàm 1 Ngày",
          "type": "tour",
          "base_price": "650000.00",
          "max_guests": 20
        },
        "availabilities": [
          {
            "id": 12,
            "service_id": 1,
            "available_date": "2026-11-20",
            "total_slots": 20,
            "booked_slots": 4,
            "remaining_slots": 16,
            "price_override": "750000.00",
            "effective_price": "750000.00",
            "is_blocked": false
          },
          {
            "id": 13,
            "service_id": 1,
            "available_date": "2026-11-21",
            "total_slots": 20,
            "booked_slots": 0,
            "remaining_slots": 20,
            "price_override": null,
            "effective_price": "650000.00",
            "is_blocked": true
          }
        ]
      }
    }
    ```

- **`PUT /api/v1/provider/services/{serviceId}/availability`**
  - Headers: `Authorization: Bearer <token>`
  - Body (hỗ trợ dải ngày `start_date` -> `end_date` hoặc mảng `dates[]`):
    ```json
    {
      "start_date": "2026-11-20",
      "end_date": "2026-11-22",
      "days_of_week": [5, 6, 0],
      "total_slots": 20,
      "price_override": 750000,
      "is_blocked": false
    }
    ```
  - Response (`200 OK`): Trả về danh sách các bản ghi `service_availability` vừa được tạo/cập nhật.

- **`GET / POST /api/v1/provider/services/{serviceId}/room-types`** & **`PUT / DELETE /api/v1/provider/services/{serviceId}/room-types/{roomTypeId}`**
  - Body (`POST` / `PUT`):
    ```json
    {
      "name": "Phòng Deluxe Hướng Biển",
      "rank": "deluxe",
      "description": "Ban công rộng view biển Mỹ Khê, bao gồm ăn sáng buffet.",
      "base_price": 1450000,
      "total_rooms": 10,
      "inventory": 10,
      "capacity_adults": 2,
      "capacity_children": 1,
      "amenities": ["Điều hòa", "Ban công", "Bồn tắm", "Wifi miễn phí"],
      "status": "active"
    }
    ```
  - Response (`201 Created` / `200 OK`): Trả về bản ghi `HotelRoomType`.

---

### 5. Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)

- [x] Provider xem được lịch biểu theo tháng và cấu hình mở/đóng bán (`is_blocked`), số chỗ (`total_slots`), và giá tùy chỉnh (`price_override`) cho 1 ngày hoặc nhiều ngày liên tiếp.
- [x] Hệ thống bảo toàn số chỗ đã đặt: báo lỗi `422` rõ ràng nếu cố tình giảm `total_slots` thấp hơn `booked_slots`.
- [x] Provider dịch vụ lưu trú (`hotel`, `homestay`) tạo/sửa/xóa được các hạng phòng (`hotel_room_types`) đầy đủ sức chứa, số phòng và giá.
- [x] Phân quyền chặt chẽ: Chỉ Provider chủ sở hữu dịch vụ mới thao tác được trên lịch và hạng phòng của dịch vụ đó.
- [x] `ServiceAvailabilityTest.php`, `pnpm lint`, `pnpm build:web` và `./vendor/bin/pint --test` chạy pass 100%.
