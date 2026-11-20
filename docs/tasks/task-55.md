### 1. Mục tiêu

Xây dựng phân hệ **Kiểm duyệt Nội dung & Báo cáo Cộng đồng (`/admin/reports`)** giúp Admin kiểm soát chất lượng nội dung trên Mini Travel Social Feed (`posts`, `comments`, `post_media`):

- Tiếp nhận và xử lý các báo cáo vi phạm từ người dùng đối với bài viết hoặc bình luận (spam, nội dung phản cảm, gắn link lừa đảo).
- Cho phép Admin xem đầy đủ nội dung bài viết (text, ảnh/video, tác giả, dịch vụ affiliate đính kèm) và thực hiện **Ẩn nội dung vi phạm**, **Bỏ qua báo cáo** hoặc **Khóa tài khoản vi phạm nghiêm trọng**.

---

### 2. Phạm vi triển khai

- **Epic cha:** #51 ([EPIC #51] Quản trị Hệ thống & Điều hành Sàn)
- **Sprint:** Sprint 3: Hoàn Thiện Phân Hệ Quản Trị Admin
- **Platform:** `Web (Admin Dashboard)` | `API (Laravel)`
- **Module:** `Admin` / `Social`
- **Role:** `admin`
- **Priority:** `P1 (High)` | **Estimate:** `3 pts`

---

### 3. Danh sách công việc chi tiết (Checklist)

#### A. Backend API (Laravel Monorepo - `apps/api`)

- [ ] **Migration & Model (`content_reports`):**
  - Tạo bảng `content_reports` (`id`, `reporter_id` -> `users`, `reportable_type` [`post`, `comment`], `reportable_id`, `reason`, `status` [`pending`, `resolved_hidden`, `dismissed`], `resolved_by` -> `users`, `resolution_note`, `resolved_at`, timestamps).
  - Thêm cột `is_hidden` (`boolean default false`) trên `posts` và `comments` (nếu chưa có) để Admin ẩn nội dung vi phạm mà vẫn giữ bằng chứng audit.
- [ ] **Controller & Routes (`routes/api/v1/admin.php`):**
  - Tạo `app/Http/Controllers/Api/V1/Admin/AdminReportController.php`:
    - `index(Request $request)`: Lọc theo `status` (`pending`, `resolved_hidden`, `dismissed`, `all`), `type` (`post`, `comment`), tìm kiếm `q`, kèm `counts.pending` (để gắn badge thật trên `AdminSidebar`).
    - `show(int $id)`: Trả về chi tiết báo cáo + nội dung gốc (`post` + `post_media` + tác giả, hoặc `comment`).
    - `resolve(Request $request, int $id)`: Hỗ trợ hành động `action: 'hide' | 'dismiss'`, cập nhật `is_hidden = true` khi `hide`, ghi nhận `resolved_by` và `resolved_at`.

#### B. Frontend Web Portal (`apps/web`)

- [ ] **API Service (`apps/web/src/features/admin/services/adminReportApi.js`)**
- [ ] **Trang & Components (`apps/web/src/features/admin/`):**
  - `pages/AdminReportsPage.jsx` (route `/admin/reports` trong `AppRouter.jsx`).
  - `components/AdminReportsTable.jsx`: Chuẩn bảng quản lý Admin (tabs `Chờ xử lý`, `Đã ẩn nội dung`, `Đã bỏ qua`, `Tất cả`).
  - `components/ReportDetailModal.jsx`: Xem nội dung bài viết/bình luận bị báo cáo, lý do báo cáo và nút hành động (`Ẩn bài viết`, `Bỏ qua báo cáo`).
  - Cập nhật `AdminSidebar.jsx` lấy badge động từ API thay vì số tĩnh `"2"`.

#### C. Kiểm thử (QA & Automated Tests)

- [ ] Viết Feature Test `apps/api/tests/Feature/AdminReportModerationTest.php`:
  - Admin xem danh sách, chi tiết báo cáo.
  - Admin ẩn bài viết vi phạm (`is_hidden = true`, `status = 'resolved_hidden'`) hoặc bỏ qua (`dismissed`).

---

### 4. Đặc tả API liên quan

- `GET /api/v1/admin/reports?status=pending&q=`
- `GET /api/v1/admin/reports/{id}`
- `POST /api/v1/admin/reports/{id}/resolve`

**Body `POST /resolve`:**

```json
{
  "action": "hide",
  "resolution_note": "Bài viết chứa nội dung quảng cáo trái phép."
}
```

---

### 5. Tiêu chuẩn nghiệm thu (Acceptance Criteria - DoD)

- [ ] Admin xử lý được báo cáo bài viết/bình luận từ `/admin/reports`; badge trên Sidebar cập nhật theo số lượng thực tế.
- [ ] Bài viết bị ẩn (`is_hidden = true`) không hiển thị công khai trên Social Feed.
- [ ] `pnpm lint`, `pnpm build:web`, `./vendor/bin/pint --test` và `php artisan test` pass 100%.
