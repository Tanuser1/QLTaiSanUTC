import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

// ── Pages ──────────────────────────────────────────────────────────────────
import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssetListPage from './pages/AssetListPage';

// ── Layout templates ────────────────────────────────────────────────────────
// AuthLayout: đã được dùng trực tiếp bên trong LoginPage → không cần bọc ở đây.
// MainLayout: bọc toàn bộ các route protected thông qua <Outlet />.
import MainLayout from './components/templates/MainLayout';

/* ─────────────────────────────────────────────────────────────────────────────
   PLACEHOLDER PAGE
   Dùng cho các route đã khai báo nhưng chưa xây dựng page thật.
   Sau này thay thế từng route bằng page thật, xóa PlaceholderPage tương ứng.
───────────────────────────────────────────────────────────────────────────── */
const PlaceholderPage: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-24 text-[#74777d]">
    <div className="text-5xl mb-4">🚧</div>
    <h2 className="font-manrope font-bold text-lg text-[#191c1d] mb-2">{label}</h2>
    <p className="text-sm">Tính năng đang được phát triển</p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   PROTECTED LAYOUT WRAPPER
   Bọc tất cả route yêu cầu đăng nhập trong MainLayout.
   Sau này chỉ cần thêm kiểm tra auth vào đây để có PrivateRoute:
     if (!isAuthenticated) return <Navigate to="/login" replace />;
   Hiện tại pass thẳng để dev không bị chặn.
───────────────────────────────────────────────────────────────────────────── */
const ProtectedLayout: React.FC = () => {
  // TODO: Kiểm tra auth token tại đây khi tích hợp authentication thật.
  // Ví dụ:
  //   const isAuthenticated = !!localStorage.getItem('token');
  //   if (!isAuthenticated) return <Navigate to="/login" replace />;

  // MainLayout render <Outlet /> bên trong vùng main content
  // → mọi route con sẽ được render đúng vị trí.
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   APP – CẤU HÌNH ROUTING
   Cấu trúc:
     /            → redirect sang /login  (trang gốc luôn vào Login)
     /login       → LoginPage (dùng AuthLayout bên trong)
     /dashboard   → DashboardPage   ┐
     /assets      → AssetListPage   │  tất cả bọc trong ProtectedLayout
     /maintenance → PlaceholderPage │  (MainLayout + Sidebar + Header)
     /requests    → PlaceholderPage │
     /departments → PlaceholderPage │
     /audit       → PlaceholderPage │
     /tasks/*     → PlaceholderPage │
     /reports/*   → PlaceholderPage │
     /users       → PlaceholderPage ┘
     *            → redirect sang /login  (catch-all)
───────────────────────────────────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── AUTH ROUTES (không cần layout ứng dụng) ── */}
        {/*
         * / và /login đều vào LoginPage.
         * LoginPage đã tự bọc AuthLayout bên trong nên không cần bọc thêm ở đây.
         */}
        <Route path="/"      element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ── PROTECTED ROUTES (bọc trong MainLayout qua ProtectedLayout) ── */}
        <Route element={<ProtectedLayout />}>

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Quản lý tài sản */}
          <Route path="/assets"      element={<AssetListPage />} />
          <Route path="/assets/:id"  element={<PlaceholderPage label="Chi tiết tài sản" />} />

          {/* Các chức năng nghiệp vụ */}
          <Route path="/departments" element={<PlaceholderPage label="Phòng" />} />
          <Route path="/maintenance" element={<PlaceholderPage label="Sửa chữa thiết bị" />} />
          <Route path="/requests"    element={<PlaceholderPage label="Yêu cầu thiết bị" />} />
          <Route path="/audit"       element={<PlaceholderPage label="Lịch kiểm tra thiết bị" />} />

          {/* Quản lý tác vụ */}
          <Route path="/tasks/barcode"   element={<PlaceholderPage label="Quản lý mã vạch" />} />
          <Route path="/tasks/devices"   element={<PlaceholderPage label="Quản lý thiết bị" />} />
          <Route path="/tasks/suppliers" element={<PlaceholderPage label="Quản lý nhà cung cấp" />} />
          <Route path="/tasks/hierarchy" element={<PlaceholderPage label="Quản lý TB cha con" />} />

          {/* Báo cáo - Thống kê */}
          <Route path="/reports/by-type"       element={<PlaceholderPage label="Thống kê theo Loại thiết bị" />} />
          <Route path="/reports/by-department" element={<PlaceholderPage label="Thống kê theo Khoa/Bộ môn" />} />
          <Route path="/reports/maintenance"   element={<PlaceholderPage label="Báo cáo lịch sử Bảo trì" />} />
          <Route path="/reports/disposal"      element={<PlaceholderPage label="Báo cáo thiết bị Thanh lý" />} />

          {/* Quản lý người dùng */}
          <Route path="/users" element={<PlaceholderPage label="Quản lý người dùng" />} />

        </Route>

        {/* ── CATCH-ALL: mọi path không khớp → về Login ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
