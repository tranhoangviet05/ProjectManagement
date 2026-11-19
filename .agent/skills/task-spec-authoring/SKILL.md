---
name: task-spec-authoring
description: >-
  Use this skill when the user asks to write, update, or detail a project task/issue
  specification (e.g., "viết nội dung task #16", "chỉnh sửa task #8") with full
  checklist, API contract, and Acceptance Criteria (DoD) saved as a standalone .md file.
---

# Task Specification Authoring Workflow

## Quy trình bắt buộc

1. **Kiểm tra Issue & Roadmap:** Đọc thông tin Issue trên GitHub (hoặc `ROADMAP.md`) để lấy đúng Title, Epic cha, Sprint, Platform, Priority và Estimate.
2. **Đối chiếu Database & Codebase thực tế:**
   - Đọc các file migration liên quan trong `apps/api/database/migrations/` và Models trong `apps/api/app/Models/`.
   - Đảm bảo JSON Request/Response và tên cột khớp 100% với schema hiện hành (không bịa trường, không dùng trường đã xóa).
   - Xác minh các quy tắc nghiệp vụ cốt lõi:
     - Tài liệu KYC lưu ở phân vùng Private (`storage/app/private/kyc/`).
     - Dịch vụ Provider tạo mới chỉ nhận `draft` hoặc `pending_review`; chỉ hiển thị công khai sau khi Admin duyệt thành `active`.
3. **Xuất ra file `.md` hoàn chỉnh:**
   - Lưu toàn bộ nội dung task vào `docs/tasks/task-<id>.md`.
   - Bắt buộc có đủ 5 phần:
     1. Mục tiêu
     2. Phạm vi triển khai
     3. Danh sách công việc chi tiết (Checklist tách rõ BE / FE Web / FE Mobile / QA Test)
     4. Đặc tả API liên quan (Endpoint, Headers, Body, Response JSON)
     5. Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)
