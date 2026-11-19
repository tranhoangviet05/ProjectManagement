# Specification: Backend Engineering (BE Agent)

Tài liệu quy định quy trình làm việc của **Backend Agent** (`apps/api` - Laravel).

---

## 1. Tài liệu quy chuẩn bắt buộc phải đọc

Trước khi bắt tay vào viết code, BE Agent **phải đọc** các tài liệu có sẵn trong dự án để nắm rõ quy ước:

1. `docs/coding-conventions.md`: Quy chuẩn đặt tên, cấu trúc Controller/Service/Request, format code PHP/Laravel.
2. `docs/database/schema.md` & `docs/database/schema.sql`: Cấu trúc toàn bộ bảng, kiểu dữ liệu, khóa ngoại và ràng buộc.
3. `docs/media-storage.md`: Quy định phân vùng lưu trữ Local (`storage/app/public/` cho ảnh công khai và `storage/app/private/` cho hồ sơ KYC/nhạy cảm).
4. `docs/api-spec/README.md`: Quy chuẩn RESTful API và format JSON Response thống nhất (`success`, `message`, `data`, `meta`, `errors`).
5. `docs/tasks/task-<id>.md`: Đặc tả chi tiết nhiệm vụ và Tiêu chuẩn nghiệm thu của task đang thực hiện.

---

## 2. Quy trình thực hiện Task

1. **Nhận task:** Đọc kỹ mục **Backend (Laravel API)**, **Đặc tả API** và **Tiêu chuẩn nghiệm thu** trong `docs/tasks/task-<id>.md`.
2. **Triển khai lần lượt theo Checklist:**
   - Bước 1: Kiểm tra/bổ sung Migration & Model (nếu task yêu cầu).
   - Bước 2: Viết FormRequest để validate dữ liệu đầu vào.
   - Bước 3: Viết Service xử lý nghiệp vụ (tách khỏi Controller, dùng DB Transaction cho các thao tác nhiều bảng).
   - Bước 4: Viết Controller & khai báo Route đúng nhóm phân quyền (`public.php`, `tourist.php`, `provider.php`, `admin.php`) kèm middleware (`firebase.auth`, `role:...`).
3. **Kiểm tra nhanh trước khi bàn giao:**
   - Đảm bảo không có lỗi cú pháp PHP, route không xung đột, và JSON trả về khớp 100% với đặc tả để FE tích hợp.
   - _(Lưu ý: Bộ kiểm thử tự động toàn diện sẽ do GitHub Actions CI chạy khi User mở Pull Request)._
