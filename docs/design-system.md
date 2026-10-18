# Quy chuẩn thiết kế giao diện (Design System & UI Guidelines)

Tài liệu này định nghĩa hệ thống màu sắc (Color Palette), kiểu chữ (Typography), kích thước và khoảng cách dùng chung cho cả **Web Portal (`@stb/web`)** và **Mobile App (`@stb/mobile`)**, giúp đảm bảo tính nhất quán trên toàn bộ nền tảng **Social Travel Booking**.

---

## 1. Bảng màu chuẩn (Color Palette)

### 1.1. Màu chủ đạo (Primary & Brand Colors)

- **Primary Main (`sky-600`)**: `#0284c7` – Dùng cho nút bấm chính, tiêu đề quan trọng, tab active.
- **Primary Hover/Dark (`sky-700`)**: `#0369a1` – Dùng cho trạng thái hover, active state.
- **Primary Light (`sky-100`)**: `#e0f2fe` – Dùng cho badge, background thẻ nổi bật.

### 1.2. Màu trung tính (Neutrals - Text & Background)

- **Heading Text (`slate-900`)**: `#0f172a` – Tiêu đề chính, văn bản có độ ưu tiên cao.
- **Body Text (`slate-700`)**: `#334155` – Nội dung bài viết, mô tả tour.
- **Muted / Subtitle (`slate-500`)**: `#64748b` – Nhãn phụ, placeholder, timestamp.
- **Border / Divider (`slate-200`)**: `#e2e8f0` – Đường viền bảng, card, thanh phân cách.
- **Card Background (`white`)**: `#ffffff` – Nền các khối nội dung.
- **App Background (`slate-50`)**: `#f8fafc` – Nền tổng thể toàn trang / toàn màn hình.

### 1.3. Màu trạng thái (Feedback & Role Colors)

- **Success / Completed (`emerald-600`)**: `#059669` – Booking hoàn thành, thanh toán thành công.
- **Warning / Pending (`amber-500`)**: `#f59e0b` – Booking đang chờ duyệt, dịch vụ chờ review.
- **Danger / Cancelled (`rose-600`)**: `#e11d48` – Hủy đơn, từ chối duyệt, báo cáo vi phạm.

---

## 2. Quy chuẩn kiểu chữ (Typography)

| Cấp bậc        | Web (Tailwind) | Mobile (React Native) | Cỡ chữ (Font Size) | Trọng lượng (Font Weight) | Sử dụng cho                  |
| -------------- | -------------- | --------------------- | ------------------ | ------------------------- | ---------------------------- |
| **H1**         | `text-2xl`     | `fontSize: 24`        | 24px (1.5rem)      | Bold (700)                | Tiêu đề trang chính          |
| **H2**         | `text-xl`      | `fontSize: 20`        | 20px (1.25rem)     | Bold (700)                | Tiêu đề danh mục, section    |
| **H3 / Title** | `text-lg`      | `fontSize: 18`        | 18px (1.125rem)    | SemiBold (600)            | Tên tour, tiêu đề Card       |
| **Body Large** | `text-base`    | `fontSize: 16`        | 16px (1.0rem)      | Regular (400) / 500       | Nội dung chính, text nút bấm |
| **Body Small** | `text-sm`      | `fontSize: 14`        | 14px (0.875rem)    | Regular (400)             | Mô tả ngắn, thông tin phụ    |
| **Caption**    | `text-xs`      | `fontSize: 12`        | 12px (0.75rem)     | Medium (500)              | Badge trạng thái, ngày giờ   |

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
