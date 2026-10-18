# Quy chuẩn viết mã (Coding Conventions & Naming Guidelines)

Tài liệu này quy định chi tiết về **cách đặt tên file, hàm, biến, class và phong cách viết code (Code Style)** áp dụng chung cho toàn bộ dự án **Social Travel Booking** trên cả Frontend (Web & Mobile) và Backend (Laravel).

---

## 📌 Bảng tra cứu nhanh quy tắc đặt tên (Quick Reference)

| Đối tượng                                     | Quy chuẩn (Casing)                 | Ví dụ chuẩn                                 | Ví dụ sai                             |
| --------------------------------------------- | ---------------------------------- | ------------------------------------------- | ------------------------------------- |
| **Component React / Screen**                  | `PascalCase`                       | `HomeScreen.jsx`, `TourCard.jsx`            | `homeScreen.js`, `tour-card.jsx`      |
| **Class, Controller, Model (PHP)**            | `PascalCase`                       | `BookingController`, `Service`              | `booking_controller`, `serviceModel`  |
| **Tên file Utility, Hook, Helper**            | `camelCase`                        | `useAuth.js`, `formatCurrency.js`           | `UseAuth.js`, `format_currency.js`    |
| **Biến (Variables), Thuộc tính (Properties)** | `camelCase`                        | `userId`, `totalPrice`, `userList`          | `user_id`, `Total_Price`, `u`         |
| **Biến logic (Boolean)**                      | `camelCase` (`is/has/can/should`)  | `isLoading`, `hasPermission`, `canEdit`     | `loading`, `check`, `flag`            |
| **Hàm / Phương thức (Functions / Methods)**   | `camelCase` (bắt đầu bằng động từ) | `getTourById()`, `calculateTotal()`         | `tour()`, `data()`, `handle()`        |
| **Hằng số cố định (Constants)**               | `UPPER_SNAKE_CASE`                 | `MAX_FILE_SIZE`, `DEFAULT_PAGE_LIMIT`       | `maxFileSize`, `limit`                |
| **Bảng cơ sở dữ liệu (DB Tables)**            | `snake_case` (số nhiều)            | `users`, `services`, `bookings`             | `User`, `tbl_services`, `bookingList` |
| **Cột cơ sở dữ liệu (DB Columns)**            | `snake_case`                       | `firebase_uid`, `created_at`, `total_price` | `firebaseUid`, `CreatedAt`            |
| **Khóa ngoại (Foreign Keys)**                 | `<bảng_số_ít>_id`                  | `user_id`, `service_id`, `booking_id`       | `id_user`, `serviceId`                |
| **Thư mục (Folders)**                         | `kebab-case` hoặc `camelCase`      | `features/tour-detail/`, `shared-types`     | `Tour_Detail`, `tourDetail`           |

---

## 1. Nguyên tắc viết code sạch (Clean Code Principles)

1. **Ngôn ngữ trong mã nguồn:**
   - Tên biến, tên hàm, class, comments kỹ thuật và commit message **100% sử dụng Tiếng Anh**.
   - Văn bản hiển thị trên giao diện người dùng (UI text) hoặc thông báo lỗi cho người dùng có thể là Tiếng Việt.
2. **Đặt tên có ngữ nghĩa rõ ràng (Descriptive & Meaningful):**
   - Tránh đặt tên biến 1 ký tự (`a`, `b`, `x`, `temp`, `data`).
   - Đọc tên hàm phải hiểu ngay hàm đó làm nhiệm vụ gì.
3. **Nguyên tắc Early Return / Guard Clauses (Tránh lồng `if/else` quá sâu):**
   - Xử lý các trường hợp lỗi hoặc điều kiện dừng ngay ở đầu hàm và `return` sớm.

```javascript
// ❌ SAI: Lồng nhau quá sâu (Kim tự tháp if/else)
function processBooking(booking) {
  if (booking) {
    if (booking.status === "pending") {
      if (booking.isPaid) {
        confirmBooking(booking);
      }
    }
  }
}

// ✅ ĐÚNG: Early return, code phẳng và dễ đọc
function processBooking(booking) {
  if (!booking) return;
  if (booking.status !== "pending") return;
  if (!booking.isPaid) return;

  confirmBooking(booking);
}
```

---

## 2. Quy chuẩn Frontend & Mobile (JavaScript / React / React Native)

### 2.1. Khai báo biến (`const` vs `let`)

- **Luôn dùng `const` làm mặc định.**
- Chỉ dùng `let` khi giá trị biến thực sự cần gán lại (re-assigned).
- **Tuyệt đối KHÔNG sử dụng `var`**.

```javascript
// ❌ SAI
var userName = "Hoang Viet";
let role = "admin"; // Không hề gán lại giá trị phía sau nhưng vẫn dùng let

// ✅ ĐÚNG
const userName = "Hoang Viet";
let retryCount = 0;
retryCount += 1;
```

### 2.2. Biến Boolean (Đúng / Sai)

Luôn bắt đầu bằng các tiền tố nghi vấn: `is`, `has`, `can`, `should`:

```javascript
// ❌ SAI
const active = true;
const permission = false;
const open = true;

// ✅ ĐÚNG
const isActive = true;
const hasPermission = false;
const isModalOpen = true;
const shouldRefresh = false;
```

### 2.3. Quy tắc đặt tên hàm & Sự kiện (Event Handlers)

- **Hàm thông thường:** Bắt đầu bằng động từ hành động: `fetch*`, `get*`, `create*`, `update*`, `delete*`, `calculate*`.
- **Hàm xử lý sự kiện trong Component:** Đặt tiền tố `handle<Action>` (ví dụ: `handleSubmit`, `handleSearch`, `handleSelectTour`).
- **Prop truyền hàm sự kiện vào Component con:** Đặt tiền tố `on<Event>` (ví dụ: `onClose`, `onSelect`, `onSubmit`).

```jsx
// ✅ ĐÚNG:
function TourList({ onSelectTour }) {
  const handleCardPress = (tour) => {
    onSelectTour(tour);
  };

  return <TourCard onPress={() => handleCardPress(tour)} />;
}
```

### 2.4. Custom Hooks

Tất cả Custom Hook phải bắt đầu bằng từ khóa `use`:

```javascript
// File: src/hooks/useAuth.js
export function useAuth() {
  // ...
}
```

### 2.5. Cấu trúc một Component React chuẩn

Ưu tiên theo thứ tự từ trên xuống dưới:

1. Import các thư viện bên ngoài (React, React Router, UI packages).
2. Import các file nội bộ (components con, hooks, utils, types, assets).
3. Định nghĩa Component:
   - Khởi tạo State & Hooks (`useState`, `useEffect`, `useAuth`...).
   - Các hàm xử lý sự kiện (`handle...`).
   - Khối `return` JSX.
4. Export Component.

---

## 3. Quy chuẩn Backend (PHP / Laravel)

### 3.1. Tuân thủ tiêu chuẩn PSR-12

- Sử dụng công cụ **Laravel Pint** đã cài sẵn để tự động format code PHP:
  ```bash
  cd apps/api && ./vendor/bin/pint
  ```

### 3.2. Quy tắc đặt tên File & Class theo vai trò

| Loại File         | Quy tắc đặt tên                                                             | Thư mục lưu trữ                       |
| ----------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| **Model**         | `PascalCase` danh từ số ít: `User`, `Service`, `Booking`                    | `app/Models/`                         |
| **Controller**    | `PascalCase` kết thúc bằng `Controller`: `AuthController`, `TourController` | `app/Http/Controllers/Api/V1/<Role>/` |
| **Form Request**  | `<Action><Model>Request`: `CreateTourRequest`, `UpdateProfileRequest`       | `app/Http/Requests/<Role>/`           |
| **API Resource**  | `<Model>Resource`: `UserResource`, `BookingResource`                        | `app/Http/Resources/`                 |
| **Policy**        | `<Model>Policy`: `BookingPolicy`                                            | `app/Policies/`                       |
| **Service Class** | `<Feature>Service`: `PaymentService`, `RecommendationService`               | `app/Services/`                       |

### 3.3. Các phương thức trong REST Controller

Các action chuẩn trong Controller cần tuân theo quy ước của Laravel:

- `index()`: Lấy danh sách (GET `/items`)
- `store()`: Tạo mới (POST `/items`)
- `show($id)`: Xem chi tiết (GET `/items/{id}`)
- `update($id)`: Cập nhật (PUT/PATCH `/items/{id}`)
- `destroy($id)`: Xóa (DELETE `/items/{id}`)

### 3.4. Định nghĩa quan hệ Eloquent Relationships

Tên hàm quan hệ phải phản ánh đúng số lượng:

- **`belongsTo` / `hasOne`**: Dùng danh từ **số ít** (`user`, `service`, `providerProfile`).
- **`hasMany` / `belongsToMany`**: Dùng danh từ **số nhiều** (`bookings`, `reviews`, `images`).

```php
// In app/Models/Service.php
class Service extends Model
{
    // Quan hệ 1 - N (Số nhiều)
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // Quan hệ N - 1 (Số ít)
    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}
```

---

## 4. Chuẩn hóa cấu trúc phản hồi API (API Response Format)

Mọi API trả về cho Frontend (Mobile & Web) phải tuân theo cấu trúc JSON chuẩn thống nhất:

### 4.1. Phản hồi thành công (Success Response):

```json
{
  "success": true,
  "message": "Tour created successfully.",
  "data": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "Tour Da Nang 3N2D",
    "price": 2500000
  }
}
```

### 4.2. Phản hồi lỗi (Error Response):

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "base_price": ["The base price field is required."]
  }
}
```

### 4.3. Các mã HTTP Status Code cần tuân thủ:

- `200 OK`: Truy vấn / cập nhật thành công.
- `201 Created`: Tạo mới tài nguyên thành công.
- `400 Bad Request`: Yêu cầu không hợp lệ.
- `401 Unauthorized`: Chưa đăng nhập hoặc Token Firebase hết hạn.
- `403 Forbidden`: Không có quyền truy cập (Ví dụ: Tourist cố vào API của Admin).
- `404 Not Found`: Không tìm thấy dữ liệu.
- `422 Unprocessable Entity`: Dữ liệu gửi lên sai định dạng validate (Form Request fail).
- `500 Internal Server Error`: Lỗi logic máy chủ.
