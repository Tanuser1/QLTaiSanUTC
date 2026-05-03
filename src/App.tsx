import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssetListPage from './pages/AssetListPage';

// Placeholder pages for nav items
const PlaceholderPage: React.FC<{ label: string }> = ({ label }) => {
  const MainLayout = React.lazy(() => import('./components/templates/MainLayout'));
  return (
    <React.Suspense fallback={null}>
      <MainLayout title={label} breadcrumbs={[{ label: 'Trang chủ', href: '/' }, { label }]}>
        <div className="flex flex-col items-center justify-center py-24 text-[#74777d]">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="font-manrope font-bold text-lg text-[#191c1d] mb-2">{label}</h2>
          <p className="text-sm">Tính năng đang được phát triển</p>
        </div>
      </MainLayout>
    </React.Suspense>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetListPage />} />
        <Route path="/maintenance" element={<PlaceholderPage label="Sửa chữa thiết bị" />} />
        <Route path="/requests" element={<PlaceholderPage label="Yêu cầu thiết bị" />} />
        <Route path="/departments" element={<PlaceholderPage label="Phòng" />} />
        <Route path="/users" element={<PlaceholderPage label="Quản lý người dùng" />} />
        <Route path="/reports" element={<PlaceholderPage label="Báo cáo - Thống kê" />} />
        <Route path="/audit" element={<PlaceholderPage label="Lịch kiểm tra thiết bị" />} />
        <Route path="/settings" element={<PlaceholderPage label="Cài đặt" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App;
