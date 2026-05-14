# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# Phần mềm Quản lý Tài sản và Bảo trì Thiết bị UTC

Dự án Frontend được xây dựng bằng React, TypeScript, Vite và Tailwind CSS.

---

## 📝 Nhật ký Refactor Kiến trúc Frontend (Changelog)

### 🎯 Mục tiêu
Chuyển đổi toàn bộ cấu trúc thư mục Frontend từ mô hình **Atomic Design** (atoms, molecules, organisms, templates) sang kiến trúc **Domain-Based** (chia theo tính năng/nghiệp vụ). Yêu cầu cốt lõi là **giữ nguyên 100% UI, logic, chức năng và behavior**, đồng thời làm cho source code dễ bảo trì và mở rộng hơn.

### 🛠️ Các thay đổi chính đã thực hiện

#### 1. Tái cấu trúc thư mục
Xóa bỏ hoàn toàn mô hình Atomic Design cũ (`atoms/`, `molecules/`, `organisms/`, `templates/`) và cấu trúc lại theo chuẩn mới:

```text
src/
├── contexts/       # Global State (VD: DeviceCategoryContext)
├── hooks/          # Custom hooks xử lý logic (VD: useAuth, useDevices, ...)
├── services/       # Lớp giao tiếp API/Mock data (VD: authService, deviceService)
├── types/          # TypeScript interfaces
├── utils/          # Các hàm tiện ích (formatNumber, storage, ...)
├── components/
│   ├── common/     # Component dùng chung (Button, Input, DataTable, StatCard, ...)
│   ├── forms/      # Component biểu mẫu (LoginForm, DeviceForm, ...)
│   └── layout/     # Component khung giao diện (AdminLayout, AuthLayout, Sidebar, Header)
├── pages/          # Các trang được chia theo Domain (nghiệp vụ)
│   ├── Auth/
│   ├── Dashboard/
│   ├── DeviceManagement/
│   ├── RoomManagement/
│   ├── TaskManagement/
│   └── Reports/
└── routes/         # Cấu hình routing (AppRoutes, AdminRoutes, PrivateRoute)
```

#### 2. Nâng cấp Kỹ thuật & Logic
- **Tách biệt Components (Standalone):** Viết lại các component lớn (`DataTable`, `Header`, `LoginForm`, `StatCard`) thành các module độc lập, loại bỏ hoàn toàn sự phụ thuộc rối rắm (import chéo) của mô hình Atomic Design cũ.
- **Quản lý State động (Context API):** Triển khai `DeviceCategoryContext`. Sidebar giờ đây được render **động** dựa trên dữ liệu từ Context thay vì hardcode một mảng cố định. Bất kỳ thay đổi CRUD nào trên danh mục cũng tự động cập nhật lên Sidebar mà không cần reload trang.
- **Routing chuẩn SPA:** Nâng cấp cấu hình React Router. Thay thế các thẻ `<a>` và `window.location` bằng `NavLink`/`Link`. Áp dụng Nested Routing thông qua `<Outlet>` bên trong `AdminLayout`.
- **Services & Hooks Layer:** Đưa toàn bộ logic fetch data và mock data vào tầng `services` và `hooks`. Giao diện (UI Components) giờ đây chỉ chịu trách nhiệm hiển thị (Dumb components), giúp dễ dàng thay thế bằng API thật của Backend sau này.

#### 3. Kết quả đạt được
- ✅ **Bảo toàn giao diện:** 100% UI, CSS và trải nghiệm người dùng được giữ nguyên.
- ✅ **Clean Code:** Loại bỏ hoàn toàn code rác, các file không sử dụng và các dependency thừa.
- ✅ **Type Safety:** Biên dịch TypeScript (`tsc -b`) thành công với **0 lỗi, 0 cảnh báo**.
- ✅ **Tối ưu Build:** Quá trình build production thành công trơn tru, dung lượng bundle được tối ưu (~306 kB JS).

---
*Nhật ký này được tạo tự động để ghi nhận quá trình tái cấu trúc toàn diện hệ thống Frontend.*
