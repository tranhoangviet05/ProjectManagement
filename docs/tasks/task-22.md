# Task #22: Logic tạo đơn, tính toán tiền cọc 30% & Kiểm tra xung đột lịch

- **EPIC:** `#21` — Booking Engine (Xử lý Đặt chỗ)
- **Sprint:** Sprint 3: Booking Engine & Cổng Thanh Toán Sepay
- **Platform:** API
- **Priority:** `P0` | **Estimate:** `4 Points`
- **Branch:** `feat/#22-booking-engine-core`

---

## 1. Mục tiêu

1. Bổ sung trường lưu trữ `quantity`, `promotion_discount_amount`, `deposit_rate`, `deposit_amount`, `remaining_amount` vào bảng `bookings`.
2. Xây dựng `BookingService` xử lý:
   - Tính bảng giá theo loại hình dịch vụ, lịch trống/giá ghi đè theo ngày (`service_availability`), khuyến mãi chiến dịch lễ hội đang diễn ra (`service_promotions`), và mã giảm giá (`coupons`).
   - Tự động tính **tiền cọc 30% + còn lại 70%** nếu dịch vụ có gắn chính sách `"Đặt cọc giữ chỗ 30%"`, hoặc **100%** nếu không gắn chính sách cọc 30%.
   - Kiểm tra xung đột lịch trống (`is_blocked`, `booked_slots` vs `total_slots`, và tồn kho `hotel_room_types` theo khoảng ngày chồng lấn) trong `DB::transaction` với `lockForUpdate()`.
3. Mở API Tourist (`/api/v1/tourist/bookings`, `/preview`, `/{id}`, `/{id}/cancel`) và viết test kiểm định.

---

## 2. Danh sách công việc

- [x] Migration `add_deposit_columns_to_bookings_table` và cập nhật `Booking` model.
- [x] Xây dựng `BookingService` (`preview`, `createBooking`, `cancelBooking`).
- [x] Tạo `PreviewBookingRequest`, `StoreBookingRequest`, `TouristBookingController` và đăng ký routes trong `routes/api/v1/tourist.php`.
- [x] Viết và chạy `TouristBookingEngineTest` + `pint --test`.

---

## 3. Tiêu chuẩn nghiệm thu (DoD)

- [x] Tính đúng khuyến mãi, coupon, cọc 30% (theo chính sách) hoặc 100% khi đặt đơn.
- [x] Chặn double-booking và xung đột lịch/phòng trống bằng transaction `lockForUpdate()`.
- [x] Hủy đơn hoàn trả đúng `booked_slots`.
- [x] Pass `./vendor/bin/pint.bat --test` và `php artisan test tests/Feature/TouristBookingEngineTest.php`.
