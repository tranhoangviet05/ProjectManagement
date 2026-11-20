### 1. Mục tiêu

Xây dựng hoàn chỉnh phân hệ **Quản lý Dịch vụ Du lịch (Tour / Khách sạn / Homestay / Phương tiện)** và **Quản lý Album Ảnh/Video** dành cho Nhà cung cấp (Provider) trên Web Portal và Backend API:

- Cho phép Provider tạo mới, xem danh sách, chỉnh sửa, gửi duyệt và xóa mềm (Soft Delete) các dịch vụ du lịch thuộc quyền sở hữu của mình.
- Hỗ trợ cấu hình đầy đủ thông tin đặc thù: lịch trình chi tiết theo ngày (`service_schedules` cho Tour), tiện ích (`amenities`, `includes`, `excludes`), định vị (`address`, `latitude`, `longitude`) và upload album nhiều ảnh/video (`service_media`) với tính năng đánh dấu ảnh bìa (`is_cover`) và sắp xếp thứ tự (`sort_order`).
- Đảm bảo quy tắc kiểm duyệt: Dịch vụ Provider tạo mới chỉ nhận trạng thái `draft` hoặc `pending_review`; chỉ hiển thị công khai cho Tourist sau khi Admin phê duyệt sang trạng thái `active`.

---

### 2. Phạm vi triển khai

- **Epic cha:** #15 ([EPIC] Quản lý Dịch vụ (Provider Portal))
- **Sprint:** Sprint 2: Quản Lý Dịch Vụ & Khám Phá Trải Nghiệm
- **Platform:** `Web (Provider Portal)` | `API (Laravel)`
- **Module:** `Booking` / `Service`
- **Role:** `provider` (chỉ Provider đã được duyệt KYC `approved` mới được phép tạo/gửi duyệt dịch vụ; kiểm tra sở hữu `provider_id` trên mọi thao tác)
- **Priority:** `P0 (Critical)` | **Estimate:** `5 pts`

---

### 3. Danh sách công việc chi tiết (Checklist)

#### A. Backend API (Laravel Monorepo - `apps/api`)

- [ ] **Tạo Eloquent Models & Enums còn thiếu:**
  - Tạo `app/Enums/ServiceType.php` (`tour`, `hotel`, `homestay`, `vehicle`) và `app/Enums/ServiceStatus.php` (`draft`, `pending_review`, `active`, `rejected`).
  - Tạo `app/Models/ServiceMedia.php` (`fillable`: `service_id`, `url`, `type`, `is_cover`, `sort_order`; cast `is_cover => boolean`, `sort_order => integer`).
  - Tạo `app/Models/ServiceSchedule.php` (`fillable`: `service_id`, `day_number`, `title`, `description`, `activities`; cast `day_number => integer`, `activities => array`).
  - Rà soát `app/Models/Service.php` (đã có `SoftDeletes` và quan hệ `provider`, `category`, `location`, `media`, `schedules`, `roomTypes`, `availability`).
- [ ] **Form Requests & Validation:**
  - Tạo `app/Http/Requests/Provider/StoreServiceRequest.php`:
    - `name` (`required|string|max:255`), `type` (`required|in:tour,hotel,homestay,vehicle`), `category_id` (`nullable|exists:categories,id`), `location_id` (`nullable|exists:locations,id`).
    - `status` (`nullable|in:draft,pending_review` — **chặn tuyệt đối** `active` hoặc `rejected` từ phía Provider).
    - `base_price` (`required|numeric|min:0`), `price_unit` (`required|string|max:50`), `max_guests` (`required|integer|min:1`).
    - `duration_days` (`integer|min:1`), `duration_nights` (`integer|min:0`), `address` (`nullable|string`), `latitude`/`longitude` (`nullable|numeric`).
    - `amenities`, `includes`, `excludes` (`nullable|array`).
    - `schedules` (`nullable|array` với `day_number`, `title`, `description`, `activities`).
  - Tạo `app/Http/Requests/Provider/UpdateServiceRequest.php` (tương tự, hỗ trợ cập nhật từng phần hoặc toàn phần; chỉ cho phép giữ/chuyển giữa `draft` và `pending_review`).
  - Tạo `app/Http/Requests/Provider/UploadServiceMediaRequest.php`: validate `files.*` (`required|file|mimes:jpg,jpeg,png,webp,mp4|max:10240`), `cover_index` (`nullable|integer|min:0`).
- [ ] **Service Layer & Slug Generator (`app/Services/ProviderServiceManager.php` hoặc xử lý trong Controller/Service):**
  - Tự động sinh `slug` SEO từ `name` bằng `Str::slug($name)`. Nếu `slug` đã tồn tại (kể cả bản ghi đã Soft Delete), tự động gắn hậu tố ngẫu nhiên/tăng dần (`-1`, `-2` hoặc `-xxxxxx`) để đảm bảo `unique`.
  - Đồng bộ `service_schedules` trong DB Transaction khi tạo/cập nhật Tour.
  - Tích hợp `MediaService` lưu ảnh/video dịch vụ vào disk `public` (`storage/app/public/services/{service_id}/...`), hỗ trợ đặt 1 ảnh duy nhất làm `is_cover = true` và sắp xếp `sort_order`.
- [ ] **Controller & Routes (`routes/api/v1/provider.php` & `routes/api/v1/public.php`):**
  - Middleware Provider: `firebase.auth`, `role:provider,admin` (kiểm tra `provider_profile.status === 'approved'` khi đăng bán `pending_review`).
  - `GET /api/v1/provider/services`: Danh sách dịch vụ của chính Provider (hỗ trợ lọc `status`, `type`, tìm kiếm `q`, phân trang `per_page`, kèm ảnh bìa `cover_media`).
  - `POST /api/v1/provider/services`: Tạo dịch vụ mới (kèm `schedules`).
  - `GET /api/v1/provider/services/{id}`: Xem chi tiết dịch vụ (kèm `category`, `location`, `media`, `schedules`).
  - `PUT /api/v1/provider/services/{id}`: Cập nhật thông tin dịch vụ & lịch trình.
  - `DELETE /api/v1/provider/services/{id}`: Xóa mềm dịch vụ (`$service->delete()`).
  - `POST /api/v1/provider/services/{id}/media`: Upload nhiều file ảnh/video vào album của dịch vụ.
  - `PATCH /api/v1/provider/services/{id}/media/{mediaId}/cover`: Đặt ảnh làm ảnh bìa (`is_cover = true`, reset các ảnh khác của dịch vụ về `false`).
  - `DELETE /api/v1/provider/services/{id}/media/{mediaId}`: Xóa file khỏi storage và bản ghi `service_media`.
  - Public Catalog (`routes/api/v1/public.php`): Bổ sung `GET /api/v1/public/categories` và `GET /api/v1/public/locations` để Web Portal nạp danh mục và địa điểm vào dropdown.

#### B. Frontend Web Portal (`apps/web`)

- [ ] **Service & Model (`apps/web/src/features/provider/`):**
  - Tạo `services/providerServiceApi.js` kết nối đầy đủ các endpoint CRUD, upload album ảnh, set cover, xóa ảnh, và lấy danh mục/địa điểm.
  - Tạo `models/serviceFormModel.js` chuẩn hóa payload form và map enum `ServiceType`, `ServiceStatus`.
- [ ] **Trang Danh sách Dịch vụ (`pages/ServiceManagementPage.jsx`):**
  - Bảng / Card danh sách dịch vụ của Provider kèm bộ lọc theo loại (`tour`, `hotel`, `homestay`, `vehicle`), trạng thái (`draft`, `pending_review`, `active`, `rejected`) và ô tìm kiếm.
  - Hiển thị badge trạng thái rõ ràng, lý do từ chối nếu `status === 'rejected'`, nút "Tạo dịch vụ mới", "Chỉnh sửa", "Cấu hình lịch" (link sang Task #17) và "Xóa" (kèm modal xác nhận).
- [ ] **Form 3 Bước Tạo/Sửa Dịch vụ (`components/ServiceFormStepper.jsx`):**
  - **Bước 1 — Thông tin cơ bản:** Tên dịch vụ, Loại hình, Danh mục, Điểm đến, Giá cơ sở, Đơn vị tính, Sức chứa tối đa, Số ngày/đêm, Địa chỉ.
  - **Bước 2 — Mô tả, Tiện ích & Lịch trình:** Mô tả chi tiết, danh sách tag `amenities` / `includes` / `excludes`, và trình tạo lịch trình theo từng ngày (`day_number`, `title`, `description`, `activities`) cho Tour.
  - **Bước 3 — Album Ảnh & Xuất bản:** Kéo thả/chọn nhiều ảnh (`components/ServiceGalleryUploader.jsx`), xem trước ảnh, nút chọn "Đặt làm ảnh bìa" (`is_cover`), nút xóa ảnh, và 2 hành động lưu: **"Lưu nháp (`draft`)"** hoặc **"Gửi Admin duyệt (`pending_review`)"**.
- [ ] **Định tuyến & Sidebar (`ProviderSidebar.jsx`, `App.jsx`):**
  - Bổ sung menu "Quản lý Dịch vụ" vào `ProviderSidebar.jsx` và khai báo route `/provider/services`, `/provider/services/new`, `/provider/services/:id/edit`.

#### C. Kiểm thử Tự động (QA - `apps/api/tests/Feature/`)

- [ ] Tạo `apps/api/tests/Feature/ServiceManagementTest.php` kiểm tra:
  - Provider tạo mới dịch vụ hợp lệ (`draft` / `pending_review`) thành công, tự sinh `slug` không trùng khi tạo 2 dịch vụ trùng tên.
  - Provider gửi `status = 'active'` bị từ chối với lỗi validation `422`.
  - Provider A không thể xem/sửa/xóa hoặc upload ảnh vào dịch vụ của Provider B (`403`/`404`).
  - Upload nhiều ảnh thành công trên `Storage::fake('public')`, set `is_cover` chỉ giữ đúng 1 ảnh bìa.
  - Xóa dịch vụ thực hiện Soft Delete (`softDeleted`), không xóa cứng bản ghi khỏi DB.

---

### 4. Đặc tả API liên quan

- **`GET /api/v1/provider/services`**
  - Headers: `Authorization: Bearer <token>`
  - Query params: `status` (optional), `type` (optional), `q` (optional), `per_page` (default `15`)
  - Response (`200 OK`):
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "provider_id": 1,
          "category_id": 2,
          "location_id": 1,
          "name": "Tour Lặn Ngắm San Hô Cù Lao Chàm 1 Ngày",
          "slug": "tour-lan-ngam-san-ho-cu-lao-cham-1-ngay",
          "type": "tour",
          "status": "pending_review",
          "base_price": "650000.00",
          "price_unit": "người",
          "max_guests": 20,
          "duration_days": 1,
          "duration_nights": 0,
          "cover_image": "http://localhost:8000/storage/services/1/abc-uuid.jpg",
          "rating_avg": 0,
          "total_bookings": 0,
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

- **`POST /api/v1/provider/services`**
  - Headers: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "name": "Tour Lặn Ngắm San Hô Cù Lao Chàm 1 Ngày",
      "type": "tour",
      "category_id": 2,
      "location_id": 1,
      "status": "pending_review",
      "description": "Trải nghiệm cano cao tốc và lặn ngắm san hô tại Bãi Ông...",
      "base_price": 650000,
      "price_unit": "người",
      "max_guests": 20,
      "duration_days": 1,
      "duration_nights": 0,
      "address": "Cảng Cửa Đại, Hội An, Quảng Nam",
      "latitude": 15.8794,
      "longitude": 108.335,
      "amenities": ["Cano cao tốc", "Kính lặn & áo phao", "Hướng dẫn viên"],
      "includes": ["Vé tham quan", "Bữa trưa hải sản"],
      "excludes": ["Chi phí cá nhân", "Thuế VAT"],
      "schedules": [
        {
          "day_number": 1,
          "title": "Khởi hành cảng Cửa Đại - Bãi Làng - Bãi Xếp",
          "description": "Đón khách tại cảng, tham quan khu bảo tồn biển và lặn ngắm san hô.",
          "activities": ["08:00 Tập trung tại cảng", "09:30 Lặn ngắm san hô", "12:00 Ăn trưa"]
        }
      ]
    }
    ```
  - Response (`201 Created`): Trả về chi tiết `Service` kèm `media`, `schedules`, `category`, `location`.

- **`PUT /api/v1/provider/services/{id}`**
  - Body: Tương tự `POST` (cập nhật thông tin và đồng bộ lại `schedules`).
  - Response (`200 OK`): Trả về bản ghi `Service` sau cập nhật.

- **`DELETE /api/v1/provider/services/{id}`**
  - Response (`200 OK`):
    ```json
    {
      "success": true,
      "message": "Đã xóa dịch vụ thành công."
    }
    ```

- **`POST /api/v1/provider/services/{id}/media`**
  - Headers: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
  - Body: `files[]` (nhiều file ảnh/video), `cover_index` (tùy chọn)
  - Response (`201 Created`):
    ```json
    {
      "success": true,
      "message": "Tải lên album ảnh dịch vụ thành công.",
      "data": [
        {
          "id": 10,
          "service_id": 1,
          "url": "http://localhost:8000/storage/services/1/uuid-1.jpg",
          "type": "image",
          "is_cover": true,
          "sort_order": 0
        }
      ]
    }
    ```

- **`PATCH /api/v1/provider/services/{id}/media/{mediaId}/cover`** & **`DELETE /api/v1/provider/services/{id}/media/{mediaId}`**
  - Cập nhật ảnh bìa hoặc xóa ảnh khỏi album và storage `public`.

---

### 5. Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)

- [x] Provider tạo được tour/khách sạn/homestay/phương tiện mới với đầy đủ giá cơ sở, sức chứa, tiện ích, lịch trình và upload nhiều ảnh/video.
- [x] Hệ thống tự động sinh `slug` thân thiện SEO và không trùng lặp ngay cả khi tạo các dịch vụ cùng tên.
- [x] Provider chỉ có thể lưu dịch vụ ở trạng thái `draft` hoặc `pending_review`; mọi nỗ lực gửi thẳng `active` đều bị chặn (`422`).
- [x] Chỉ Provider chủ sở hữu mới có quyền xem/sửa/xóa dịch vụ và quản lý album ảnh của mình.
- [x] Xóa dịch vụ áp dụng Soft Delete (`deleted_at`), bảo toàn toàn vẹn dữ liệu cho các đơn đặt trước đó.
- [x] `ServiceManagementTest.php`, `pnpm lint`, `pnpm build:web` và `./vendor/bin/pint --test` chạy pass 100%.
