import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from '../pages/Auth/LoginPage';
import { ProtectedLayout, adminRouteElements } from './AdminRoutes';
import { giaoVienRouteElements } from './GiaoVienRoutes';
import { ktvRouteElements } from './KTVRoutes';
import { bghRouteElements } from './BGHRoutes';

/**
 * AppRoutes – cấu hình routing toàn ứng dụng.
 *
 * Cấu trúc:
 *   /              → redirect /login
 *   /login         → LoginPage (AuthLayout bên trong)
 *   /dashboard/*   → ProtectedLayout (Admin only — allowedRoles=['admin'])
 *   /bgh/*         → ProtectedLayout (BGH — sẽ thêm ở bước sau)
 *   /ktv/*         → ProtectedLayout (KyThuat — sẽ thêm ở bước sau)
 *   /giaovien/*    → ProtectedLayout (GiaoVien — sẽ thêm ở bước sau)
 *   *              → redirect /login
 *
 * AuthProvider wrap toàn bộ để mọi component đều dùng được useAuthContext().
 */
const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* ── AUTH ── */}
        <Route path="/"        element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<LoginPage />} />

        {/* ── ADMIN (admin only) ── */}
        <Route element={<ProtectedLayout allowedRoles={['admin']} />}>
          {adminRouteElements}
        </Route>

        {/* ── GIAO VIEN (teacher only) ── */}
        <Route path="/giaovien" element={<ProtectedLayout allowedRoles={['teacher']} />}>
          {giaoVienRouteElements}
        </Route>

        {/* ── KTV (technician only) ── */}
        <Route path="/ktv" element={<ProtectedLayout allowedRoles={['technician']} />}>
          {ktvRouteElements}
        </Route>

        {/* ── BGH (bgh only) ── */}
        <Route path="/bgh" element={<ProtectedLayout allowedRoles={['bgh']} />}>
          {bghRouteElements}
        </Route>

        {/* ── CATCH-ALL ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;

