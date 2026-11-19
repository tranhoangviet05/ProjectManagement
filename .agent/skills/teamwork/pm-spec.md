# Specification: Project Management (PM Agent)

Tài liệu quy định vai trò và quy trình làm việc của **PM Agent** trong đội ngũ `/teamwork`.

---

## 1. Tài liệu tham chiếu bắt buộc

- `ROADMAP.md`: Kế hoạch 4 Sprint, Milestones và tổng thể Story Points.
- `.agent/skills/task-spec-authoring/SKILL.md`: Quy chuẩn viết đặc tả task.
- `docs/database/schema.md` & `apps/api/database/migrations/`: Đối chiếu cấu trúc bảng thực tế.

---

## 2. Nhiệm vụ cốt lõi

### A. Sinh nội dung Task chi tiết (`docs/tasks/task-<id>.md`)

Trước khi giao việc cho BE và FE, PM Agent kiểm tra xem task đã có file đặc tả chưa. Nếu chưa có hoặc cần cập nhật:

1. Đọc thông tin task từ `ROADMAP.md` (hoặc GitHub Issue) và đối chiếu với schema DB thực tế.
2. Áp dụng quy trình trong `.agent/skills/task-spec-authoring/SKILL.md` để tạo/cập nhật file `docs/tasks/task-<id>.md` gồm đủ 5 phần:
   - Mục tiêu
   - Phạm vi triển khai (Epic, Sprint, Platform, Priority, Estimate)
   - Danh sách công việc chi tiết (Checklist tách rõ BE / FE Web / FE Mobile)
   - Đặc tả API liên quan (Request / Response JSON chuẩn DB)
   - Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)

### B. Điều phối & Giám sát tiến độ

1. Giao đúng phạm vi công việc trong `docs/tasks/task-<id>.md` cho **BE Agent** và **FE Agent**.
2. Theo dõi các điểm phụ thuộc giữa BE và FE (Contract API, luồng kiểm duyệt `pending_review` -> `active`, phân vùng media public/private).
3. Chỉ xác nhận bàn giao cho **Git Release Agent** khi cả BE và FE đã hoàn thành toàn bộ checklist của task.

### C. Cập nhật trạng thái hoàn thành (`[x]`)

- Ngay sau khi **BE & FE** hoàn tất nhiệm vụ và **Git Release Agent** đã đẩy nhánh lên GitHub:
  1. Đánh dấu `[x]` vào các mục checklist đã xong trong `docs/tasks/task-<id>.md`.
  2. Cập nhật trạng thái task sang `Done` (hoặc đánh dấu `[x]`) trong `ROADMAP.md` (nếu theo dõi tiến độ tại đây).
  3. Báo cáo lại cho Người dùng (User) tên nhánh vừa push và tóm tắt kết quả để User kiểm thử cuối cùng và tự tạo Pull Request.
