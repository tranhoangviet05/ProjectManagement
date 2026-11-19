# Specification: Git Release Management (Git Release Agent)

Tài liệu quy định quy trình thao tác Git của **Git Release Agent** trước và sau khi thực hiện mỗi task.

---

## 1. Tài liệu tham chiếu bắt buộc

- `CONTRIBUTING.md`: Quy chuẩn commit message (Conventional Commits) và quy ước Git của dự án.
- `commitlint.config.js`: Cấu hình kiểm tra commit message tự động qua Husky.

---

## 2. Nguyên tắc Bắt buộc

1. **Đồng bộ từ `main` trước khi làm:** Luôn pull code mới nhất từ `origin/main` trước khi tách nhánh cho task mới.
2. **Chờ User Review trước khi Commit:** Sau khi BE và FE hoàn thành code, **KHÔNG tự động commit ngay**. Phải dừng lại báo cáo các thay đổi (`git status` / tóm tắt file) để **Người dùng (User / Project Lead) trực tiếp review giao diện và mã nguồn trên máy trước**. Chỉ khi User xác nhận đồng ý / duyệt xong mới tiến hành commit và push.
3. **Tách riêng Commit BE và FE:** Tuyệt đối không dùng `git add .` để gộp chung BE và FE vào một commit quá lớn. Phải chia thành từng commit riêng theo từng tầng (`api`, `web`, `mobile`, `docs`) để lịch sử git gọn gàng, dễ review.
4. **KHÔNG tạo Pull Request & KHÔNG đóng Task:** Chỉ dừng lại ở bước `git push origin <ten_nhanh>`. Không thêm `closes #id` vào commit message. Người dùng (User) sẽ là người kiểm thử cuối cùng, tự tạo PR (để kích hoạt GitHub Actions CI) và tự quyết định đóng Issue.

---

## 3. Quy trình thực hiện (2 Giai đoạn)

### Giai đoạn A: Chuẩn bị nhánh (Chạy TRƯỚC khi BE/FE code)

1. Kiểm tra trạng thái làm việc hiện tại (`git status`) đảm bảo không lẫn thay đổi rác.
2. Chuyển về `main` và kéo code mới nhất:
   ```powershell
   git checkout main
   git pull origin main
   ```
3. Tạo nhánh mới cho task từ `main`:
   ```powershell
   git checkout -b feat/#<task_id>-<ten-ngan-gon>
   ```
   _(Ví dụ: `feat/#16-provider-services-crud`, `fix/#22-booking-overlap`)_

### Giai đoạn B: Review, Đóng gói & Push nhánh (Chạy SAU khi BE/FE hoàn thành)

1. **Báo cáo chờ User Review:** Chạy `git status` để kiểm tra toàn bộ các file đã tạo/chỉnh sửa, thông báo cho **User** kiểm tra thực tế (UI/API/Code). **Dừng tại đây chờ User xác nhận đồng ý commit.**
2. **Commit phần Backend (sau khi User duyệt):**
   ```powershell
   git add apps/api/...
   git commit -m "feat(api): <mo ta ngan gon thay doi backend>"
   ```
3. **Commit phần Frontend (nếu có - tách riêng Web / Mobile nếu mỗi bên có nhiều file):**
   ```powershell
   git add apps/web/...
   git commit -m "feat(web): <mo ta ngan gon thay doi web>"

   git add apps/mobile/...
   git commit -m "feat(mobile): <mo ta ngan gon thay doi mobile>"
   ```
4. **Commit phần Shared Packages / Docs (nếu có cập nhật `packages/` hoặc `docs/`):**
   ```powershell
   git add packages/... docs/...
   git commit -m "chore(shared): <mo ta ngan gon>"
   ```
5. **Đẩy nhánh lên GitHub:**
   ```powershell
   git push -u origin feat/#<task_id>-<ten-ngan-gon>
   ```
6. **Báo cáo cho PM / User:** Cung cấp tên nhánh đã push và danh sách các commit vừa tạo để User tạo PR và nghiệm thu cuối cùng.
