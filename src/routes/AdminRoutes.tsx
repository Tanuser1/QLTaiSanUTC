import React from 'react';
import { Route, Outlet, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { storage } from '../utils/storage';

// ── Pages ──────────────────────────────────────────────────────────
import DashboardPage           from '../pages/Dashboard/DashboardPage';
import DeviceByCategoryPage    from '../pages/DeviceManagement/DeviceByCategoryPage';
import RoomListPage            from '../pages/RoomManagement/RoomListPage';
import RepairRoomPage          from '../pages/RoomManagement/RepairRoomPage';
import DeviceRequestPage       from '../pages/RoomManagement/DeviceRequestPage';
import InspectionSchedulePage  from '../pages/RoomManagement/InspectionSchedulePage';
import BarcodeManagementPage   from '../pages/TaskManagement/BarcodeManagementPage';
import SupplierManagementPage  from '../pages/TaskManagement/SupplierManagementPage';
import ParentChildDevicePage   from '../pages/TaskManagement/ParentChildDevicePage';
import UserManagementPage      from '../pages/TaskManagement/UserManagementPage';
import DeviceCategoryManagementPage from '../pages/TaskManagement/DeviceCategoryManagementPage';
import StatByDeviceTypePage    from '../pages/Reports/StatByDeviceTypePage';
import StatByDepartmentPage    from '../pages/Reports/StatByDepartmentPage';
import MaintenanceHistoryPage  from '../pages/Reports/MaintenanceHistoryPage';
import LiquidatedDevicePage    from '../pages/Reports/LiquidatedDevicePage';

/**
 * ProtectedLayout – bọc AdminLayout + Outlet.
 * Redirect về /login nếu không có token trong localStorage.
 */
export const ProtectedLayout: React.FC = () => {
  const token = storage.get<string>('token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

/**
 * AdminRoutes – danh sách tất cả route protected.
 * Dùng trong AppRoutes dưới dạng children của <Route element={<ProtectedLayout />}>.
 *
 * NOTE: Export các Route riêng lẻ để AppRoutes compose linh hoạt.
 */
export const adminRouteElements = (
  <>
    <Route path="/dashboard"              element={<DashboardPage />} />
    <Route path="/assets"                 element={<DeviceByCategoryPage />} />
    <Route path="/assets/:id"             element={<DeviceByCategoryPage />} />
    <Route path="/departments"            element={<RoomListPage />} />
    <Route path="/maintenance"            element={<RepairRoomPage />} />
    <Route path="/requests"               element={<DeviceRequestPage />} />
    <Route path="/audit"                  element={<InspectionSchedulePage />} />
    <Route path="/tasks/barcode"          element={<BarcodeManagementPage />} />
    <Route path="/tasks/devices"          element={<DeviceByCategoryPage />} />
    <Route path="/tasks/suppliers"        element={<SupplierManagementPage />} />
    <Route path="/tasks/hierarchy"        element={<ParentChildDevicePage />} />
    <Route path="/tasks/categories"       element={<DeviceCategoryManagementPage />} />
    <Route path="/reports/by-type"        element={<StatByDeviceTypePage />} />
    <Route path="/reports/by-department"  element={<StatByDepartmentPage />} />
    <Route path="/reports/maintenance"    element={<MaintenanceHistoryPage />} />
    <Route path="/reports/disposal"       element={<LiquidatedDevicePage />} />
    <Route path="/users"                  element={<UserManagementPage />} />
  </>
);
