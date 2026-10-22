# Kế Hoạch Phát Triển MVP (1 Tháng) - Social Travel Booking

**Tổng quan:** Kế hoạch tập trung phát triển các chức năng cốt lõi nhất của dự án trong vòng 4 tuần (26/10 - 22/11).
**Định hướng nền tảng (Platform Strategy):**

- **Admin & Provider:** Ưu tiên tối đa trên **Web Portal** (duyệt KYC, quản lý đăng bán dịch vụ, dashboard doanh thu).
- **Tourist (Khách du lịch):** Ưu tiên trên **Mobile App** (tìm kiếm, đặt chỗ, thanh toán, nhận vé QR code và tương tác mạng xã hội).
- **Backend API (Laravel):** Đảm bảo RESTful API chuẩn hóa, tài liệu hóa và bảo vệ bằng middleware phân quyền.

---

## 📋 Quy ước Custom Fields trên GitHub Projects

- **Status:** `Todo` | `In Progress` | `Done`
- **Priority:** `P0 (Critical)` | `P1 (High)` | `P2 (Normal)` | `P3 (Nice to have)`
- **Estimate:** Điểm độ phức tạp / Story Points (1, 2, 3, 5, 8)
- **Module:** `Auth` | `Booking` | `Payment` | `Social` | `Admin` | `DevOps`
- **Role:** `user` | `provider` | `admin` | `general`
- **Platform:** `API` | `Web` | `Mobile` | `Monorepo`

---

## SPRINT 1: Authentication, Onboarding & Nền Tảng Kỹ Thuật (Tuần 1)

**Mục tiêu (Sprint Goal):** Hoàn thiện luồng xác thực đa vai trò, chuẩn bị hạ tầng upload media/CI-CD, Provider gửi hồ sơ KYC và Admin phê duyệt thành công.
**Thời gian:** 26/10 - 01/11 | **Tổng Estimate:** 16 Points

| Tên Task (Issue / Sub-issues)                            |        Platform        |     Status      | Priority | Estimate | Module     | Role        | Start date | Date target |
| :------------------------------------------------------- | :--------------------: | :-------------: | :------: | :------: | :--------- | :---------- | :--------- | :---------- |
| **[EPIC] Nền tảng Xác thực & User**                      | **API / Web / Mobile** | **In Progress** |  **P0**  |  **6**   | **Auth**   | **general** | 26/10      | 30/10       |
| ↳ Đăng ký/Đăng nhập Email, SĐT & Phân quyền vai trò      |          All           |   In Progress   |    P0    |    2     | Auth       | general     | 26/10      | 28/10       |
| ↳ Hoàn thiện Google OAuth2 / Firebase Auth Client        |       Web/Mobile       |   In Progress   |    P1    |    2     | Auth       | user        | 28/10      | 30/10       |
| ↳ Quản lý trang hồ sơ cá nhân (Profile cá nhân cơ bản)   |       Web/Mobile       |      Todo       |    P1    |    2     | Auth       | general     | 29/10      | 30/10       |
| **[EPIC] Hạ tầng DevOps & Media Storage**                |   **API / Monorepo**   |    **Todo**     |  **P0**  |  **4**   | **DevOps** | **admin**   | 26/10      | 28/10       |
| ↳ Pipeline CI/CD cơ bản (Lint, Typecheck, Unit Test API) |        Monorepo        |      Todo       |    P0    |    2     | DevOps     | admin       | 26/10      | 27/10       |
| ↳ Module Upload Media (Hỗ trợ upload ảnh KYC & Dịch vụ)  |          API           |      Todo       |    P0    |    2     | DevOps     | general     | 27/10      | 28/10       |
| **[EPIC] Provider Onboarding & Phê Duyệt KYC**           |     **API / Web**      |    **Todo**     |  **P0**  |  **6**   | **Admin**  | **admin**   | 29/10      | 01/11       |
| ↳ Form đăng ký Provider & Nộp hồ sơ KYC (CCCD, GPKD)     |       Web/Mobile       |      Todo       |    P0    |    3     | Auth       | provider    | 29/10      | 31/10       |
| ↳ Admin Dashboard: Danh sách & Xét duyệt/Từ chối KYC     |          Web           |      Todo       |    P0    |    3     | Admin      | admin       | 31/10      | 01/11       |

---

## SPRINT 2: Quản Lý Dịch Vụ & Khám Phá Trải Nghiệm (Tuần 2)

**Mục tiêu (Sprint Goal):** Provider đăng ký và cấu hình dịch vụ bán hàng (ưu tiên Tour & Phòng lưu trú), User có thể tìm kiếm, lọc và xem thông tin chi tiết dịch vụ.
**Thời gian:** 02/11 - 08/11 | **Tổng Estimate:** 14 Points

| Tên Task (Issue / Sub-issues)                                 |     Platform     |  Status  | Priority | Estimate | Module      | Role         | Start date | Date target |
| :------------------------------------------------------------ | :--------------: | :------: | :------: | :------: | :---------- | :----------- | :--------- | :---------- |
| **[EPIC] Quản lý Dịch vụ (Provider Portal)**                  |  **API / Web**   | **Todo** |  **P0**  |  **8**   | **Booking** | **provider** | 02/11      | 06/11       |
| ↳ CRUD Dịch vụ du lịch (Tour / Khách sạn) + Quản lý album ảnh |       Web        |   Todo   |    P0    |    5     | Booking     | provider     | 02/11      | 05/11       |
| ↳ Cấu hình Lịch phục vụ (Availability) & Bảng giá theo ngày   |       Web        |   Todo   |    P0    |    3     | Booking     | provider     | 05/11      | 06/11       |
| **[EPIC] Khám phá & Tìm kiếm Dịch vụ (Tourist)**              | **API / Mobile** | **Todo** |  **P0**  |  **6**   | **Booking** | **user**     | 05/11      | 08/11       |
| ↳ Trang chủ & Tìm kiếm (Theo điểm đến, từ khóa, khoảng giá)   |    Mobile/Web    |   Todo   |    P0    |    3     | Booking     | user         | 05/11      | 07/11       |
| ↳ Màn hình Chi tiết Dịch vụ (Thông tin, ảnh, chính sách, giá) |      Mobile      |   Todo   |    P0    |    3     | Booking     | user         | 07/11      | 08/11       |

---

## SPRINT 3: Booking Engine & Cổng Thanh Toán Sepay (Tuần 3) ⚠️

**Mục tiêu (Sprint Goal):** Xử lý đặt chỗ không bị trùng lặp (No Overbooking), tích hợp thanh toán cọc 30% qua cổng Sepay và xuất vé QR Code xác nhận.
**Thời gian:** 09/11 - 15/11 | **Tổng Estimate:** 15 Points

| Tên Task (Issue / Sub-issues)                                        |     Platform     |  Status  | Priority | Estimate | Module      | Role        | Start date | Date target |
| :------------------------------------------------------------------- | :--------------: | :------: | :------: | :------: | :---------- | :---------- | :--------- | :---------- |
| **[EPIC] Booking Engine (Xử lý Đặt chỗ)**                            | **API / Mobile** | **Todo** |  **P0**  |  **7**   | **Booking** | **user**    | 09/11      | 12/11       |
| ↳ Logic tạo đơn, tính toán tiền cọc 30% & Kiểm tra xung đột lịch     |       API        |   Todo   |    P0    |    4     | Booking     | user        | 09/11      | 11/11       |
| ↳ Giao diện đặt chỗ & Màn hình quản lý Lịch sử đơn đặt               |      Mobile      |   Todo   |    P1    |    3     | Booking     | user        | 11/11      | 12/11       |
| **[EPIC] Cổng Thanh Toán Sepay & Vé QR**                             |  **API / All**   | **Todo** |  **P0**  |  **8**   | **Payment** | **general** | 12/11      | 15/11       |
| ↳ Tích hợp Cổng Sepay (Tạo QR thanh toán cọc 30%)                    |    API/Mobile    |   Todo   |    P0    |    3     | Payment     | user        | 12/11      | 13/11       |
| ↳ Xử lý Webhook Sepay (Idempotent, bảo mật chữ ký, tự động cập nhật) |       API        |   Todo   |    P0    |    3     | Payment     | general     | 13/11      | 14/11       |
| ↳ Xuất mã vé điện tử QR Code xác nhận đặt chỗ                        |    Mobile/Web    |   Todo   |    P1    |    2     | Booking     | user        | 14/11      | 15/11       |

---

## SPRINT 4: Escrow Quyết Toán, Đánh Giá & Mini Social Feed (Tuần 4)

**Mục tiêu (Sprint Goal):** Hoàn tất vòng đời đơn hàng với cơ chế Escrow (giải phóng tiền vào ví Provider), đánh giá chất lượng và chia sẻ bài viết trải nghiệm.
**Thời gian:** 16/11 - 22/11 | **Tổng Estimate:** 14 Points

| Tên Task (Issue / Sub-issues)                                            |     Platform     |  Status  | Priority | Estimate | Module      | Role      | Start date | Date target |
| :----------------------------------------------------------------------- | :--------------: | :------: | :------: | :------: | :---------- | :-------- | :--------- | :---------- |
| **[EPIC] Cơ chế Ký quỹ Escrow & Ví Provider**                            |  **API / Web**   | **Todo** |  **P0**  |  **5**   | **Payment** | **admin** | 16/11      | 18/11       |
| ↳ Check-in quét QR / User xác nhận -> Tự động giải phóng tiền cọc vào ví |       API        |   Todo   |    P0    |    3     | Payment     | general   | 16/11      | 17/11       |
| ↳ Provider Dashboard: Quản lý số dư ví & Lịch sử giao dịch               |       Web        |   Todo   |    P1    |    2     | Payment     | provider  | 17/11      | 18/11       |
| **[EPIC] Đánh giá Dịch vụ (Review & Rating)**                            | **API / Mobile** | **Todo** |  **P0**  |  **3**   | **Booking** | **user**  | 18/11      | 19/11       |
| ↳ Tính năng gửi đánh giá sao & nhận xét sau khi hoàn thành chuyến đi     |      Mobile      |   Todo   |    P0    |    3     | Booking     | user      | 18/11      | 19/11       |
| **[EPIC] Mạng Xã Hội Du Lịch (Mini Travel Feed)**                        | **API / Mobile** | **Todo** |  **P1**  |  **6**   | **Social**  | **user**  | 20/11      | 22/11       |
| ↳ Tạo bài viết trải nghiệm (Nội dung, upload ảnh, tag địa điểm)          |      Mobile      |   Todo   |    P1    |    3     | Social      | user      | 20/11      | 21/11       |
| ↳ Trang Bảng tin (Feed) khám phá bài viết & Thả tim/Tương tác            |      Mobile      |   Todo   |    P1    |    3     | Social      | user      | 21/11      | 22/11       |

---

## 🎯 Tổng Kết Phân Bổ Nguồn Lực & Rủi Ro Dự Án

1. **Tổng Story Points toàn dự án:** ~59 Points (~14-16 points/tuần cho cả nhóm).
2. **Các mốc bàn giao nghiệm thu chính (Milestones):**
   - **M1 (01/11):** Nền tảng tài khoản, phân quyền, KYC Provider và CI/CD tự động.
   - **M2 (08/11):** Cửa hàng dịch vụ hoàn chỉnh (Đăng bán trên Web + Tìm kiếm trên Mobile).
   - **M3 (15/11):** Hoàn thành dòng tiền (Đặt chỗ + Thanh toán cọc Sepay realtime).
   - **M4 (22/11):** Khép kín nghiệm thu MVP (Escrow quyết toán ví + Review + Travel Feed).
