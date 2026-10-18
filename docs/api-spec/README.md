# API Specifications (Đặc tả API)

Thư mục này dùng để lưu trữ các **bản hợp đồng giao tiếp dữ liệu (API Contract / Spec)** giữa **Backend (Laravel API)** và **Frontend (Mobile Expo & Web Vite)**.

---

## Mục đích sử dụng

1. **Lập trình song song (Contract-first Development):**
   - Đội Backend và Frontend thống nhất cấu trúc dữ liệu JSON, status code, query params trước khi viết code.
   - Đội Frontend (Mobile/Web) có thể nhìn vào spec để mock data dựng giao diện ngay mà không cần chờ Backend hoàn thành API.
2. **Kiểm thử và tích hợp (Testing & Integration):**
   - Chứa file xuất bộ test API để kiểm thử qua Postman hoặc Insomnia.
3. **Đồng bộ tài liệu tự động:**
   - Lưu trữ file đặc tả OpenAPI (Swagger) được sinh tự động từ code Laravel (qua thư viện `Scribe`).

---

## Các tài liệu thường lưu tại đây:

- `openapi.yaml` / `swagger.json`: File đặc tả chuẩn OpenAPI 3.0 mô tả toàn bộ endpoint theo từng vai trò (`/api/v1/admin/*`, `/api/v1/provider/*`, `/api/v1/tourist/*`, `/api/v1/public/*`).
- `postman_collection.json`: Bộ sưu tập các API endpoints để team import trực tiếp vào Postman chạy test.
- `postman_environment.json`: Chứa các biến môi trường cho Postman (ví dụ `base_url`: `http://localhost:8000/api/v1`, `bearer_token`...).

---

## Cách sinh tài liệu tự động từ Laravel

Backend Laravel đã tích hợp sẵn thư viện **Knuckleswtf/Scribe**. Để cập nhật tài liệu API mới nhất:

```bash
cd apps/api
php artisan scribe:generate
```

Tài liệu tương tác sẽ có sẵn tại: `http://localhost:8000/docs` hoặc xuất ra định dạng OpenAPI tại thư mục này.
