import React from 'react';
import { Route, Outlet, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { DeviceCategoryProvider } from '../contexts/DeviceCategoryContext';
import { storage } from '../utils/storage';

// ── Pages ──────────────────────────────────────────────────────────
import DashboardPage                from '../pages/Dashboard/DashboardPage';
import DeviceByCategoryPage         from '../pages/DeviceManagement/DeviceByCategoryPage';
import AssetDetailPage              from '../pages/DeviceManagement/AssetDetailPage';
import RoomListPage                 from '../pages/RoomManagement/RoomListPage';
import RepairRoomPage               from '../pages/RoomManagement/RepairRoomPage';
import DeviceRequestPage            from '../pages/RoomManagement/DeviceRequestPage';
import SupplierManagementPage       from '../pages/TaskManagement/SupplierManagementPage';
import UserManagementPage           from '../pages/TaskManagement/UserManagementPage';
import DeviceCategoryManagementPage from '../pages/TaskManagement/DeviceCategoryManagementPage';
import StatByDeviceTypePage         from '../pages/Reports/StatByDeviceTypePage';
import StatByDepartmentPage         from '../pages/Reports/StatByDepartmentPage';
import MaintenanceHistoryPage       from '../pages/Reports/MaintenanceHistoryPage';
import LiquidatedDevicePage         from '../pages/Reports/LiquidatedDevicePage';

/**
 * ProtectedLayout – kiểm tra token, redirect /login nếu chưa đăng nhập.
 * DeviceCategoryProvider mount tại đây để chỉ fetch sau khi authenticated.
 */
export const ProtectedLayout: React.FC = () => {
  const token = storage.get<string>('token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <DeviceCategoryProvider>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </DeviceCategoryProvider>
  );
};

export const adminRouteElements = (
  <>
    <Route path="/dashboard"             element={<DashboardPage />} />

    {/* Thiết bị */}
    <Route path="/assets"                element={<DeviceByCategoryPage />} />
    <Route path="/assets/:id"            element={<AssetDetailPage />} />

    {/* Phòng & Khoa */}
    <Route path="/departments"           element={<RoomListPage />} />

    {/* Yêu cầu hỗ trợ */}
    <Route path="/requests"              element={<DeviceRequestPage />} />

    {/* Biên bản sửa chữa */}
    <Route path="/maintenance"           element={<RepairRoomPage />} />

    {/* Quản lý */}
    <Route path="/tasks/suppliers"       element={<SupplierManagementPage />} />
    <Route path="/tasks/categories"      element={<DeviceCategoryManagementPage />} />

    {/* Báo cáo */}
    <Route path="/reports/by-type"       element={<StatByDeviceTypePage />} />
    <Route path="/reports/by-department" element={<StatByDepartmentPage />} />
    <Route path="/reports/maintenance"   element={<MaintenanceHistoryPage />} />
    <Route path="/reports/disposal"      element={<LiquidatedDevicePage />} />

    {/* Người dùng */}
    <Route path="/users"                 element={<UserManagementPage />} />
  </>
);
