# Social Travel Booking - Monorepo

Hệ thống nền tảng đặt tour du lịch và mạng xã hội du lịch (**Social Travel Booking**) theo kiến trúc Monorepo, quản lý bằng **pnpm workspaces**.

---

## 🏗️ Kiến trúc tổng quan

Dự án phân chia rõ ràng trách nhiệm theo các vai trò: **Admin (Quản trị viên)**, **Provider (Nhà cung cấp dịch vụ)** và **Tourist (Khách du lịch)**:

| Workspace / Module      | Tên Package         | Công nghệ                                  | Đối tượng & Mục đích                                                                                                             |
| ----------------------- | ------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile`           | `@stb/mobile`       | Expo (React Native), React Navigation      | Ứng dụng di động tối ưu cho **Tourist** (khám phá tour, đặt chỗ, ví, mạng xã hội) và **Provider** (quản lý check-in)             |
| `apps/web`              | `@stb/web`          | React 19, Vite, TailwindCSS                | Cổng quản trị web cho **Admin** (kiểm duyệt đối tác, quản lý hệ thống) và **Provider** (quản lý tour, phòng, thống kê doanh thu) |
| `apps/api`              | `apps/api`          | Laravel (PHP 8.3), Sanctum, Firebase Admin | RESTful API backend phục vụ toàn bộ nghiệp vụ, phân quyền theo role                                                              |
| `packages/shared-types` | `@stb/shared-types` | TypeScript                                 | Định nghĩa Enum, Interface, DTO dùng chung giữa Web và Mobile                                                                    |
| `infra`                 | -                   | Docker, PostgreSQL 16 Alpine               | Hạ tầng cơ sở dữ liệu và môi trường chạy container                                                                               |
| `docs`                  | -                   | Markdown, SQL dumps                        | Tài liệu kiến trúc, database schema, quy chuẩn kỹ thuật                                                                          |

---

## 🗂️ Cấu trúc thư mục Monorepo

```
ProjectManagement/
├── .github/                   # GitHub Actions workflows
├── .husky/                    # Git Hooks tự động lint & commitlint
├── .editorconfig              # Quy chuẩn format editor
├── .gitignore                 # Loại trừ file rác, env, build, firebase keys
├── .prettierrc                # Cấu hình chuẩn code formatting
├── commitlint.config.js       # Chuẩn commit message theo Conventional Commits
├── pnpm-workspace.yaml        # Khai báo các workspace apps/* và packages/*
├── package.json               # Root scripts & devDependencies cho monorepo
├── setup.bat                  # Script cài đặt tự động 1 click trên Windows
│
├── apps/
│   ├── mobile/                # [@stb/mobile] React Native Mobile App (Expo)
│   │   ├── app.json           # Expo app config
│   │   ├── App.js             # Entry point gắn Navigation Container
│   │   └── src/
│   │       ├── components/    # Reusable Native UI components dùng chung (AppText, Button...)
│   │       ├── features/      # Module tính năng chuẩn Feature-Based MVC (auth, tourist, provider, tour...)
│   │       │   └── [feature]/ # components/ (View), screens/ (View), hooks/ (Controller), models/ (Model)
│   │       ├── hooks/         # Custom React hooks dùng chung cho mobile (useAuth...)
│   │       ├── utils/         # Helper functions (formatCurrency, formatDate, storage...)
│   │       ├── lib/           # Cấu hình Echo (Reverb WebSocket), apiClient
│   │       ├── navigation/    # Điều hướng React Navigation (RootNavigator)
│   │       └── theme/         # Design tokens (colors, typographyScale, spacing, radius)
│   │
│   ├── web/                   # [@stb/web] Vite React Web Portal (Admin & Provider)
│   │   ├── vite.config.js     # Cấu hình Vite & TailwindCSS plugin
│   │   └── src/
│   │       ├── components/    # Reusable Web UI components (TailwindCSS)
│   │       ├── features/      # Module tính năng theo vai trò: admin/, provider/, auth/
│   │       ├── hooks/         # Custom React hooks (useAuth, useEcho, usePagination...)
│   │       ├── utils/         # Helper functions dùng chung cho web
│   │       ├── lib/           # Firebase client, Echo & Axios API clients
│   │       ├── layouts/       # Khung giao diện Web: AdminLayout, ProviderLayout (Sidebar + Header)
│   │       └── routes/        # Cấu hình React Router theo URL browser path
│   │
│   └── api/                   # Backend Laravel API
│       ├── app/
│       │   ├── Enums/                     # PHP 8.1+ Enums (BookingStatus, PaymentMethod, UserRole...)
│       │   ├── Http/Controllers/Api/V1/   # Tách controller theo role: Admin, Provider, Tourist, Auth
│       │   ├── Http/Requests/             # Form Requests xác thực dữ liệu theo role
│       │   ├── Models/                    # Eloquent Models (User, Service, Booking, Payment...)
│       │   ├── Providers/                 # Service Providers cấu hình IoC, Firebase, Reverb
│       │   └── Services/                  # Business Logic Layer (BookingService, PaymentService, Affiliate...)
│       ├── routes/
│       │   ├── api.php                    # Nạp các phân hệ route v1
│       │   └── api/v1/                    # Tách riêng: admin.php, provider.php, tourist.php, public.php
│       └── storage/app/firebase/          # Chứa file firebase-service-account.json (không commit)
│
├── packages/
│   └── shared-types/          # [@stb/shared-types] Shared TypeScript types & enums
│
├── infra/
│   └── docker-compose.yml     # PostgreSQL service
│
└── docs/
    └── database/              # Schema database chi tiết (schema.md, schema.sql)
```

---

## 🚀 Hướng dẫn cài đặt và khởi chạy

### 1. Chuẩn bị môi trường

- **Node.js**: >= 20.x
- **pnpm**: >= 9.x (`corepack enable && corepack prepare pnpm@latest --activate`)
- **PHP**: >= 8.2 & **Composer**
- **Docker** (dành cho cơ sở dữ liệu PostgreSQL)

### 2. Cài đặt tự động (Windows)

Chỉ cần chạy file:

```cmd
setup.bat
```

Script sẽ tự động:

1. Kiểm tra các công cụ Node, pnpm, PHP, Composer, Git.
2. Cài đặt toàn bộ dependencies cho Monorepo (`pnpm install`).
3. Khởi tạo file `.env` và `composer install` cho Backend Laravel.
4. Cấu hình Husky Git hooks.

### 3. Khởi chạy toàn bộ dịch vụ (1 Click trên Windows)

Chỉ cần nhấp đúp hoặc chạy file:

```cmd
start.bat
```

Script sẽ tự động khởi động:

1. Container PostgreSQL (nếu có Docker).
2. **Laravel API Backend** tại `http://localhost:8000`.
3. **Laravel Reverb WebSocket** tại `ws://localhost:8080`.
4. **Vite Web Portal** tại `http://localhost:5173`.
5. **Expo Mobile App** (mã QR kết nối Expo Go).

Để dừng tất cả các dịch vụ cùng lúc, bạn chạy file:

```cmd
stop.bat
```

_(Hoặc khởi chạy thủ công từng phần bằng lệnh pnpm)_:

```bash
pnpm dev:api       # Laravel API
pnpm dev:reverb    # Reverb WebSocket
pnpm dev:web       # Web Portal
pnpm dev:mobile    # Mobile App
```

---

## 🔒 Quy chuẩn bảo mật & Biến môi trường

- File chứa thông tin xác thực Firebase Admin (`firebase-service-account.json`) được lưu trữ tại `apps/api/storage/app/firebase/` và đã được thêm vào `.gitignore`.
- Cấu hình vị trí trong `apps/api/.env`:
  ```env
  FIREBASE_CREDENTIALS=storage/app/firebase/firebase-service-account.json
  ```
