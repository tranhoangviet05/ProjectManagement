# Task #23: Giao diện đặt chỗ & Màn hình quản lý Lịch sử đơn đặt

- **EPIC:** `#21` — Booking Engine (Xử lý Đặt chỗ)
- **Sprint:** Sprint 3: Booking Engine & Cổng Thanh Toán Sepay
- **Platform:** API / Mobile (`apps/api`, `apps/mobile`)
- **Priority:** `P1` | **Estimate:** `3 Points`
- **Branch:** `feat/#23-booking-history-ui`

---

## 1. Mục tiêu

1. Thiết kế lại luồng **Thông tin đặt chỗ** thành màn hình riêng (`BookingCheckoutScreen`), dùng `NumericStepper` (`>= 1`), lịch `ExploreDatePickerModal` chống xung đột ngày đi – ngày về, tách Người lớn & Trẻ em cho Chỗ ở, và tự động điền sẵn bộ lọc tìm kiếm (`SearchFilterContext`).
2. Xây dựng **Màn hình Quản lý Lịch sử Đơn đặt** (`BookingsTabScreen`) & **Chi tiết Đơn đặt chỗ** (`BookingDetailScreen`) kèm đếm ngược giữ chỗ 10 phút, hủy đơn có lý do, và tra cứu đơn cho Khách vãng lai.
3. Nâng cấp **Backend Policy Rules & Dynamic Availability**:
   - Bổ sung `rule_key` & `rule_config` vào `service_policies` + cập nhật toàn bộ seeder mẫu (`ServicePolicySeeder`, `DemoMarketplaceSeeder`) để chính sách có hiệu lực thực thi (giờ nhận/trả phòng `14:00 – 12:00`, tỷ lệ cọc `0%/30%/100%`, hoàn/hủy, thú cưng, trẻ em).
   - Nâng cấp kiểm tra tồn kho theo **đỉnh ngày (peak-day)** trong khoảng `[start_date, end_date)` cho Chỗ ở & Thuê xe, đồng thời nhận diện giờ trả phòng/xe (`checkout_time`).
   - Mở rộng Bộ lọc Tìm kiếm (`amenity_ids`, `inclusion_ids`, `policy_ids`) theo logic **OR** + lọc tồn kho theo khoảng ngày `start_date`/`end_date`.

---

## 2. Danh sách công việc

### Backend (`apps/api`)

- [x] Migration `2026_11_24_000002_add_rule_columns_to_service_policies_table` thêm `rule_key`, `rule_config`.
- [x] Cập nhật `ServicePolicy`, `ServicePolicySeeder` (đầy đủ `rule_key`, `rule_config` và slug chuẩn khớp `DemoMarketplaceSeeder`).
- [x] Nâng cấp `BookingService`: `extractPolicyRules()`, `calculatePeakBookedInRange()`, kiểm tra sức chứa trẻ em (`capacity_children`), trả `available_quantity` và `policy_rules`.
- [x] Nâng cấp `PublicServiceController`: bộ lọc OR (`amenity_ids`, `inclusion_ids`, `policy_ids`), lọc tồn kho theo khoảng ngày `start_date`/`end_date`, trả `policy_rules` ở `show()`.
- [x] Nâng cấp `TouristBookingController`: trả kèm `policy_rules` ở `show()` & `lookupByCode()`.

### Frontend Mobile (`apps/mobile`)

- [x] Tạo `SearchFilterContext.js` và đồng bộ từ `ExploreHeroSearch` & `ServiceSearchScreen` sang `BookingCheckoutScreen`.
- [x] Mở rộng bộ lọc OR (Tiện nghi, Bao gồm, Chính sách) trên `ServiceSearchScreen.js` và `exploreService.js`.
- [x] Tạo `NumericStepper.js`, `BookingCheckoutScreen.js` (dùng `ExploreDatePickerModal`, tách Người lớn/Trẻ em, hiển thị chính sách thực thi) và chuyển luồng nút **Đặt chỗ ngay** từ `ServiceDetailScreen.js` sang màn hình riêng.
- [x] Hoàn thiện `BookingsTabScreen.js`, `BookingDetailScreen.js`, `BookingCard.js`, `BookingStatusBadge.js`, `CancelBookingModal.js`.

---

## 3. Tiêu chuẩn nghiệm thu (DoD)

- [x] Pass `./vendor/bin/pint.bat --test` và toàn bộ bộ test PHPUnit (`php artisan test`).
- [x] Pass `pnpm run lint` và `oxlint` (0 warnings, 0 errors trên toàn bộ file Mobile của Task #23).
