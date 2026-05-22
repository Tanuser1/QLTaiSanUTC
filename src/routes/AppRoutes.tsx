import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import { ProtectedLayout, adminRouteElements } from './AdminRoutes';

/**
 * AppRoutes – cấu hình routing toàn ứng dụng.
 *
 * Cấu trúc:
 *   /            → redirect /login
 *   /login       → LoginPage (AuthLayout bên trong)
 *   /* protected → ProtectedLayout (AdminLayout + Sidebar + Header)
 *   *            → redirect /login
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ── AUTH ── */}
      <Route path="/"      element={<Navigate to="/login" replace />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── PROTECTED (AdminLayout) ── */}
      <Route element={<ProtectedLayout />}>
        {adminRouteElements}
      </Route>

      {/* ── CATCH-ALL ── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
