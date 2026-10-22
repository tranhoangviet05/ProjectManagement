# Hướng Dẫn Quản Lý & Lưu Trữ Media / Assets (Local VPS)

## 1. Nguyên tắc thiết kế (Architecture)

Để tối ưu chi phí, tốc độ truyền tải trên VPS và đảm bảo tính an toàn dữ liệu, hệ thống lưu trữ media được chia thành 2 phân vùng rõ rệt:

1. **Phân vùng Public (`storage/app/public/`):**
   - Phục vụ các tài nguyên công khai: Ảnh đại diện, ảnh bài viết, ảnh dịch vụ du lịch, banner.
   - Được ánh xạ (symlink / junction) ra `public/storage`.
   - **Tối ưu VPS:** Khi triển khai Nginx trên VPS, Nginx sẽ phục vụ trực tiếp các file tĩnh trong thư mục này với cơ chế cache và gzip/brotli mà **không cần qua tiến trình PHP/Laravel**, giúp tốc độ phản hồi cực nhanh.
   - URL truy cập: `{APP_URL}/storage/{folder}/{filename}`.

2. **Phân vùng Private (`storage/app/private/`):**
   - Phục vụ các tài nguyên nhạy cảm: Giấy phép kinh doanh, CCCD KYC của Provider, hóa đơn ngân hàng.
   - **Tuyệt đối không public ra ngoài internet.**
   - Quyền truy cập phải đi qua API Laravel có Middleware xác thực (Role: `admin` hoặc chính `provider` sở hữu hồ sơ).

---

## 2. Cây thư mục chi tiết

```text
apps/api/storage/app/
├── public/                       # Truy cập công khai qua {APP_URL}/storage/...
│   ├── avatars/                  # Ảnh đại diện (User / Tourist / Provider)
│   ├── services/                 # Media dịch vụ du lịch
│   │   ├── covers/               # Ảnh bìa chính của Tour / Khách sạn / Xe
│   │   └── gallery/              # Album ảnh chi tiết của dịch vụ
│   ├── posts/                    # Bài viết mạng xã hội (Mini Travel Feed)
│   │   └── images/               # Ảnh trải nghiệm, check-in
│   ├── reviews/                  # Ảnh feedback đánh giá của khách hàng sau chuyến đi
│   ├── categories/               # Icon & banner phân loại dịch vụ
│   └── banners/                  # Banner quảng cáo, khuyến mãi trang chủ
│
└── private/                      # Dữ liệu bảo mật (Chặn public, truy cập qua API)
    ├── kyc/                      # Hồ sơ định danh Provider
    │   ├── id_cards/             # Ảnh CCCD (Mặt trước / Mặt sau)
    │   └── licenses/             # Giấy phép kinh doanh lữ hành, chứng chỉ hành nghề
    └── invoices/                 # Chứng từ đối soát, hóa đơn thanh toán
```

---

## 3. Quy chuẩn xử lý File khi Upload trong Code

1. **Đặt tên file:**
   - Sử dụng UUID hoặc chuỗi Hash ngẫu nhiên (`Str::uuid() . '.' . $ext`) để chống trùng lặp và ngăn chặn dò quét URL.
2. **Định dạng & Dung lượng khuyến nghị:**
   - **Ảnh thông thường:** JPG, PNG, WEBP. Khuyến khích convert sang **WebP** để giảm 60-70% dung lượng mà không giảm chất lượng.
   - **Kích thước tối đa:**
     - Avatar: Tối đa 2MB.
     - Dịch vụ / Review / Post: Tối đa 5MB.
     - File KYC (PDF, Ảnh CCCD): Tối đa 10MB.
3. **Mã mẫu Laravel Service:**
   ```php
   // Upload ảnh public (vd: ảnh bìa dịch vụ)
   $path = $request->file('cover_image')->store('services/covers', 'public');
   // URL lưu DB: 'services/covers/' . $filename hoặc dùng Storage::url($path)

   // Upload tài liệu KYC private
   $path = $request->file('license')->store('kyc/licenses', 'local');
   // Chỉ lưu relative path vào database
   ```
