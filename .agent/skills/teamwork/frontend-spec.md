# Specification: Frontend Engineering (FE Agent - Web & Mobile)

Tài liệu quy định quy trình làm việc của **Frontend Agent** cho cả `apps/web` (React + Vite + TailwindCSS) và `apps/mobile` (Expo React Native).

---

## 1. Tài liệu quy chuẩn bắt buộc phải đọc

Trước khi bắt tay vào viết code, FE Agent **phải đọc** các tài liệu có sẵn trong dự án:

1. `docs/coding-conventions.md`: Quy chuẩn đặt tên file, component, hooks, services và tổ chức thư mục.
2. `docs/design-system.md` & `.agent/skills/ui-design/SKILL.md`: Quy chuẩn màu sắc, typography (Plus Jakarta Sans & Quicksand), spacing, nguyên tắc phân rã Component và mô hình **Feature-Based MVC** (`components/`, `screens/`/`pages/`, `hooks/`, `models/`).
3. `packages/shared-types/src/index.ts` (hoặc `index.js`) & `packages/tokens/`: Dùng chung enums, types và design tokens, không tự định nghĩa trùng lặp.
4. `docs/tasks/task-<id>.md`: Đặc tả chi tiết nhiệm vụ và Tiêu chuẩn nghiệm thu của task đang thực hiện.

---

## 2. Quy trình thực hiện Task

1. **Xác định đúng nền tảng:**
   - **Admin & Provider** ➔ Triển khai trọng tâm trên **Web Portal (`apps/web`)**.
   - **Tourist (Khách du lịch)** ➔ Triển khai trọng tâm trên **Mobile App (`apps/mobile`)**.
2. **Nhận task:** Đọc kỹ mục **Frontend**, **Đặc tả API** và **Tiêu chuẩn nghiệm thu** trong `docs/tasks/task-<id>.md`.
3. **Triển khai lần lượt theo Checklist:**
   - Bước 1: Tạo/cập nhật Service gọi API (`services/`) và Model Adapter/Validation (`models/`).
   - Bước 2: Xây dựng các sub-components tái sử dụng (`components/`).
   - Bước 3: Lắp ghép tại Screen Orchestrator (`pages/` hoặc `screens/`), xử lý đầy đủ trạng thái Loading, Empty State và Error Feedback.
4. **Kiểm tra nhanh trước khi bàn giao:**
   - Chạy `pnpm run lint` (và `pnpm run build:web` nếu có thay đổi ở `apps/web`) để đảm bảo không lỗi cú pháp hoặc lỗi build trước khi Git Release Agent commit.
