# Task #20: Màn hình Chi tiết Dịch vụ (Thông tin, ảnh, chính sách, giá)

- **EPIC:** `#18` — Khám phá & Tìm kiếm Dịch vụ (Tourist)
- **Sprint:** Sprint 2 (`29/11 - 01/12`)
- **Platform:** API / Mobile
- **Priority:** `P0` | **Estimate:** `3 Points`
- **Branch:** `feat/#20-service-detail-screen`

---

## 1. Mục tiêu

Xây dựng màn hình **Chi tiết Dịch vụ (`DetailScreen`)** trên ứng dụng Mobile (`apps/mobile`) cùng API chi tiết công khai đầy đủ (`GET /api/v1/public/services/{id}`) để Du khách xem trọn vẹn thông tin trước khi đặt chỗ:

- Bộ sưu tập ảnh full-bleed (carousel trượt ngang kèm chỉ số ảnh).
- Tên dịch vụ, nhãn danh mục, điểm đánh giá & số lượt đặt, địa chỉ, thông tin nhà cung cấp đã xác minh KYC.
- Tiện nghi, dịch vụ bao gồm / không bao gồm, mô tả chi tiết.
- Thông tin đặc thù theo loại dịch vụ:
  - **Chỗ ở (`hotel` / `homestay`)**: Danh sách loại phòng (`room_types`) với sức chứa, giá/đêm, tiện nghi và chính sách ký quỹ **Cọc an toàn 30% Escrow**.
  - **Giải trí (`tour`)**: Lịch trình chi tiết theo từng ngày (`schedules`).
- Lịch phục vụ & bảng giá theo ngày trong 30 ngày tới (`availability`).
- Đánh giá thực tế từ khách hàng (`reviews` + `provider_reply`).
- Thanh đặt chỗ cố định phía dưới hiển thị giá theo lựa chọn hiện tại và nút CTA **Đặt chỗ ngay**.

---

## 2. Danh sách công việc

### Backend (`apps/api`)

- [x] Cập nhật `PublicServiceController::show(int $id)` trả về đầy đủ `reviews` (10 đánh giá mới nhất kèm `user:id,name,avatar_url`), `reviews_count`, `location.parent`, `roomTypes` (active), `schedules`, `availability` (30 ngày tới chưa bị khóa), `media`, `category`, `provider`.
- [x] Bổ sung Feature Test cho endpoint `GET /api/v1/public/services/{id}` (trả về 200 cho dịch vụ `active`, 404 cho dịch vụ chưa duyệt hoặc không tồn tại).

### Frontend Mobile (`apps/mobile`)

- [x] Tạo `ServiceDetailGallery.js`: Carousel ảnh trượt ngang, bộ đếm ảnh, nút Quay lại & Chia sẻ nổi trên ảnh.
- [x] Tạo `ServiceDetailReviews.js`: Khối tổng điểm đánh giá và danh sách nhận xét từ du khách.
- [x] Xây dựng `ServiceDetailScreen.js` (và nối vào `DetailScreen` / `RootNavigator` với `headerShown: false`):
  - Loading `<Skeleton />` và Error/Retry state.
  - Chọn loại phòng (`hotel`/`homestay`), chọn ngày trống (`availability`), cập nhật giá động trên thanh đặt chỗ.
  - Chỉ hiển thị tag **Cọc an toàn 30%** cho dịch vụ Chỗ ở (`hotel` / `homestay`).
- [x] Tạo `RoomTypeDetailScreen.js`: Màn hình xem chi tiết từng hạng phòng cho dịch vụ Chỗ ở.
- [x] Kiểm định `oxlint` và `pnpm lint`.

---

## 3. Đặc tả API (`GET /api/v1/public/services/{id}`)

- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Resort Biển Xanh Đà Nẵng",
      "type": "hotel",
      "base_price": 1850000,
      "price_unit": "night",
      "address": "120 Võ Nguyên Giáp",
      "description": "...",
      "amenities": ["Wifi miễn phí", "Hồ bơi"],
      "includes": ["Ăn sáng buffet"],
      "excludes": ["Đưa đón sân bay"],
      "rating_avg": 4.8,
      "reviews_count": 12,
      "total_bookings": 45,
      "cover_image": "https://...",
      "media": [],
      "location": { "id": 1, "name": "Đà Nẵng", "parent": null },
      "category": { "id": 1, "name": "Khách sạn & Resort" },
      "provider": { "id": 1, "business_name": "...", "address": "..." },
      "room_types": [],
      "schedules": [],
      "availability": [],
      "reviews": []
    }
  }
  ```

---

## 4. Tiêu chuẩn nghiệm thu (DoD)

- [x] Xem chi tiết thành công mọi loại dịch vụ đang `active` từ Trang chủ, Kết quả tìm kiếm hoặc Bài đăng mạng xã hội.
- [x] Dịch vụ Chỗ ở hiển thị được danh sách loại phòng + màn hình chi tiết loại phòng + chính sách Cọc an toàn 30%; Tour hiển thị được lịch trình theo ngày; hiển thị lịch trống & giá theo ngày.
- [x] Đảm bảo trạng thái Loading `<Skeleton />`, Empty State khi chưa có đánh giá/lịch trống, và Error State có nút thử lại.
- [x] Pass `pnpm lint`, `oxlint`, `./vendor/bin/pint.bat --test` và `php artisan test`.
