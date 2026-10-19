# Quy chuẩn thiết kế giao diện (Design System & UI Guidelines)

Tài liệu này định nghĩa hệ thống màu sắc (Color Palette), kiểu chữ (Typography), kích thước và khoảng cách dùng chung cho cả **Web Portal (`@stb/web`)** và **Mobile App (`@stb/mobile`)**, giúp đảm bảo tính nhất quán trên toàn bộ nền tảng **Social Travel Booking**.

---

## 1. Bảng màu chuẩn (Color Palette)

### 1.1. Màu chủ đạo (Primary Brand - Xanh trời / Sky Blue)

Biểu tượng của bầu trời rộng mở, đại dương trong lành, sự tự do xê dịch và cảm giác an tâm, minh bạch khi đặt dịch vụ và thanh toán:

- **Primary Main (`sky-600`)**: `#0284c7` – Dùng cho nút bấm chính, tiêu đề quan trọng, tab active, trạng thái đang chọn.
- **Primary Dark/Hover (`sky-700`)**: `#0369a1` – Dùng cho trạng thái pressed/hover, border điểm nhấn.
- **Primary Deep (`sky-800`)**: `#075985` – Dùng cho thanh điều hướng hoặc thẻ điểm đến ban đêm.
- **Primary Light (`sky-100`)**: `#e0f2fe` – Nền badge, chip phân loại, ô nhập liệu đang focus.
- **Primary Subtle (`sky-50`)**: `#f0f9ff` – Nền khối highlight nhẹ nhàng, banner chào mừng.

### 1.2. Màu phụ (Secondary & Accent Colors - Đặc trưng Du lịch)

#### A. Màu phụ 1: Hoàng hôn & Nắng biển (Sunset Coral / Sand Gold)

Sắc cam ấm áp hoàng hôn đóng vai trò **bổ túc nhiệt độ màu (Warm vs Cool contrast)** hoàn hảo với sắc xanh trời mát mẻ, xua tan cảm giác lạnh lẽo của giao diện và kích thích cảm xúc hào hứng khám phá:

- **Secondary Warm Main (`orange-500`)**: `#f97316` – Điểm nhấn ưu đãi "Deal Hot", "Giảm 30%", Huy hiệu Đánh giá sao (⭐ Rating), nút CTA chốt deal/đặt cọc ngay.
- **Secondary Warm Dark (`orange-600`)**: `#ea580c` – Trạng thái nhấn (pressed) của nút ưu đãi.
- **Secondary Warm Light (`orange-100`)**: `#ffedd5` – Nền thẻ voucher khuyến mãi, tag flash-sale.
- **Secondary Warm Subtle (`orange-50`)**: `#fff7ed` – Nền khối gợi ý trải nghiệm độc quyền.

#### B. Màu phụ 2: Trải nghiệm Sinh thái & Biển đảo (Lagoon Teal)

Gợi nhớ những vùng vịnh nước trong vắt và du lịch thiên nhiên bền vững:

- **Secondary Lagoon (`teal-600`)**: `#0d9488` – Tag trải nghiệm trekking rừng, lặn san hô, tour sinh thái.
- **Secondary Lagoon Light (`teal-100`)**: `#ccfbf1` – Huy hiệu "Đối tác tin cậy", chứng nhận an toàn.

### 1.3. Màu trung tính (Neutrals - Text & Background)

- **Heading Text (`slate-900`)**: `#0f172a` – Tiêu đề chính, văn bản có độ tương phản cao, dễ đọc khi ở ngoài trời.
- **Body Text (`slate-700`)**: `#334155` – Nội dung bài viết, mô tả tour và phòng nghỉ.
- **Muted / Subtitle (`slate-500`)**: `#64748b` – Nhãn phụ, placeholder, timestamp.
- **Border / Divider (`slate-200`)**: `#e2e8f0` – Đường viền bảng, card, thanh phân cách.
- **Card Background (`white`)**: `#ffffff` – Nền các khối nội dung nổi bật.
- **App Background (`slate-50`)**: `#f8fafc` – Nền tổng thể toàn trang (sạch sẽ, không gây chói lóa mắt).
- **Surface Obsidian (`slate-950`)**: `#0b1320` – Nền thẻ Hero ban đêm, thẻ số dư và vé VIP.

### 1.4. Màu phản hồi trạng thái (Feedback & Status)

- **Success / Completed (`emerald-600`)**: `#059669` – Booking hoàn thành, thanh toán thành công, QR check-in hợp lệ.
- **Warning / Pending (`amber-500`)**: `#d97706` – Booking đang chờ duyệt, giữ chỗ trong 15 phút.
- **Danger / Cancelled (`rose-600`)**: `#e11d48` – Hủy đơn, từ chối duyệt, lỗi thao tác.

---

## 2. Quy chuẩn kiểu chữ (Typography - Font Quicksand trên Mobile)

Font chữ chính thức trên Mobile là **Quicksand** (Google Fonts) – kiểu chữ sans-serif hình học với góc bo tròn mềm mại, mang lại cảm xúc thân thiện, thư thái, hiện đại và tràn đầy năng lượng du lịch.

| Cấp bậc        | Web (Tailwind)          | Mobile (Quicksand)      | Cỡ chữ    | Trọng lượng (Font Weight) | Sử dụng cho                           |
| :------------- | :---------------------- | :---------------------- | :-------- | :------------------------ | :------------------------------------ |
| **Display**    | `text-3xl`              | `Quicksand_700Bold`     | 28px      | Bold (700)                | Banner chào đón, số liệu nổi bật      |
| **H1**         | `text-2xl`              | `Quicksand_700Bold`     | 24px      | Bold (700)                | Tiêu đề màn hình chính                |
| **H2**         | `text-xl`               | `Quicksand_700Bold`     | 20px      | Bold (700)                | Tiêu đề danh mục, tour nổi bật        |
| **H3 / Title** | `text-lg`               | `Quicksand_600SemiBold` | 17px-18px | SemiBold (600)            | Tên tour, khách sạn, tiêu đề Card     |
| **Body Large** | `text-base`             | `Quicksand_400Regular`  | 16px      | Regular (400)             | Nội dung chính, mô tả tour            |
| **Body Small** | `text-sm`               | `Quicksand_400Regular`  | 14px      | Regular (400)             | Đoạn trích ngắn, thông tin dịch vụ    |
| **Label**      | `text-sm font-semibold` | `Quicksand_600SemiBold` | 13px      | SemiBold (600)            | Tiêu đề trường nhập, text nút bấm     |
| **Caption**    | `text-xs`               | `Quicksand_500Medium`   | 12px      | Medium (500)              | Badge trạng thái, ngày giờ, số review |

---

## 3. Khoảng cách & Bo góc (Spacing & Border Radius)

### 3.1. Khoảng cách (Spacing Units - Bội số của 4)

- **xs**: 4px (`gap-1`, `p-1`)
- **sm**: 8px (`gap-2`, `p-2`)
- **md**: 12px - 16px (`gap-3` - `gap-4`, `p-3` - `p-4`) – Padding mặc định của Card / Form input.
- **lg**: 20px - 24px (`gap-5` - `gap-6`, `p-5` - `p-6`) – Khoảng cách giữa các khối lớn.

### 3.2. Bo góc (Border Radius)

- **Button / Input**: `rounded-lg` (8px)
- **Card / Modal**: `rounded-xl` (12px) hoặc `rounded-2xl` (16px)
- **Tag / Badge / Avatar**: `rounded-full` (9999px)

---

## 4. Kiến trúc hướng thành phần (Component-Based Architecture Guidelines)

Để đảm bảo mã nguồn dễ bảo trì, dễ kiểm thử và có khả năng mở rộng cao, toàn bộ giao diện Web và Mobile trên hệ thống đều tuân thủ chặt chẽ mô hình **Component-Based Architecture (Kiến trúc hướng thành phần)**:

### 4.1. Phân cấp thành phần (Component Hierarchy)

```
├── 1. Shared / Global Components    (Dùng chung cho toàn bộ dự án)
│     ├── Web: apps/web/src/components/ui/
│     └── Mobile: apps/mobile/src/components/common/
│
├── 2. Feature / Screen Components   (Dùng riêng cho từng tính năng / màn hình)
│     ├── Web: apps/web/src/features/[feature]/components/
│     └── Mobile: apps/mobile/src/features/[feature]/components/ hoặc apps/mobile/src/screens/components/[screen]/
│
└── 3. Screen / Page Orchestrators    (Màn hình điều phối hoàn chỉnh ghép từ các sub-components)
      ├── Web: apps/web/src/features/[feature]/pages/[Page].jsx
      └── Mobile: apps/mobile/src/features/[feature]/screens/[Screen].js
```

### 4.2. Quy tắc phân định trách nhiệm

| Cấp bậc                        | Vị trí thư mục                         | Trách nhiệm                                                                                                                                                    | Ví dụ thực tế                                                                      |
| :----------------------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **Shared Components**          | `components/ui/`, `components/common/` | Các nguyên tử giao diện (Atoms) không chứa logic nghiệp vụ đặc thù của màn hình nào, nhận dữ liệu hoàn toàn qua props.                                         | `<Typography>`, `<AppText>`, `<Modal>`, `<Badge>`                                  |
| **Screen-Specific Components** | `features/[name]/components/`          | Các khối thành phần riêng của màn hình (Molecules / Organisms). Được tách ra thành từng file riêng biệt để giải phóng dung lượng code cho file màn hình chính. | `<AuthHeroShowcase>`, `<LoginForm>`, `<TouristDealCard>`, `<ProviderQrScannerBox>` |
| **Screen Orchestrators**       | `pages/`, `screens/`                   | Đóng vai trò là "nhạc trưởng": quản lý state tổng, gọi Custom Hooks / Context, xử lý logic điều hướng và ghép các sub-components thành màn hình hoàn chỉnh.    | `AuthPage.jsx`, `AuthScreen.js`, `TouristWorkspaceScreen.js`                       |

### 4.3. Các nguyên tắc bắt buộc khi lập trình giao diện

1. **Nguyên tắc Đơn nhiệm (Single Responsibility Principle)**:
   - Mỗi file component con chỉ chịu trách nhiệm hiển thị hoặc xử lý 1 khối chức năng cụ thể (ví dụ: `LoginForm` chỉ lo phần nhập email/mật khẩu, `AuthFeedbackAlert` chỉ lo hiển thị lý do lỗi).
2. **Không gộp toàn bộ màn hình vào 1 file duy nhất**:
   - Tuyệt đối tránh việc viết gộp hàng trăm đến hàng nghìn dòng code (tất cả các form, header, danh sách, modal) trong một file màn hình.
   - Dung lượng khuyến nghị cho file màn hình chính (Page/Screen Orchestrator) là **dưới 150 dòng code**.
3. **Mô hình Dữ liệu Một chiều (Props Down, Events Up)**:
   - Page cha giữ state và truyền data xuống sub-components qua props (`user`, `mode`, `fieldErrors`).
   - Mọi tương tác của người dùng (submit form, click tab, đổi input) được component con phát sự kiện ngược lên page cha qua callback props (`onSubmit`, `onSelectMode`, `onResetFeedback`).
4. **Cô lập lỗi và dễ dàng bảo trì (Fault Isolation)**:
   - Khi cần nâng cấp giao diện của một thẻ card hoặc một form, lập trình viên chỉ mở và chỉnh sửa đúng file component đó mà không làm phát sinh rủi ro cho các thành phần khác trên màn hình.
