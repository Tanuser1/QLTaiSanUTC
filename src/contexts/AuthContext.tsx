/**
 * contexts/AuthContext.tsx
 * Context xác thực + phân quyền toàn ứng dụng.
 *
 * Cách dùng:
 *   const { user, isAdmin, canApprove, login, logout } = useAuthContext();
 *
 * Lưu ý: Wrap ở App.tsx (bên ngoài BrowserRouter không cần, nhưng bên trong để navigate được)
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser, UserRole } from '../types/auth.types';
import { authService } from '../services/authService';

// ─── Redirect map theo role ───────────────────────────────────────────────────
const ROLE_HOME: Record<UserRole, string> = {
  admin:      '/dashboard',
  bgh:        '/bgh/dashboard',
  technician: '/ktv/dashboard',
  teacher:    '/giaovien/dashboard',
};

// ─── Context type ─────────────────────────────────────────────────────────────
interface AuthContextType {
  // State
  user:        AuthUser | null;
  isLoading:   boolean;
  error:       string | null;

  // Computed flags
  isAuthenticated: boolean;
  isAdmin:         boolean;
  isBGH:           boolean;
  isKTV:           boolean;
  isGiaoVien:      boolean;
  canApprove:      boolean;  // Admin + BGH — duyệt kinh phí
  canRepair:       boolean;  // Admin + KyThuat — lập biên bản
  canManage:       boolean;  // Admin only — CRUD tài sản/người dùng

  // Helpers
  homeRoute:       string;   // Route mặc định sau khi login
  hasRole:         (role: UserRole) => boolean;

  // Actions
  login:           (tenDangNhap: string, matKhau: string) => Promise<void>;
  logout:          () => void;
  clearError:      () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser]         = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ── Computed flags (memo để tránh re-render thừa) ─────────────────────────
  const flags = useMemo(() => {
    const role = user?.role ?? null;
    return {
      isAuthenticated: !!user,
      isAdmin:         role === 'admin',
      isBGH:           role === 'bgh',
      isKTV:           role === 'technician',
      isGiaoVien:      role === 'teacher',
      canApprove:      role === 'admin' || role === 'bgh',
      canRepair:       role === 'admin' || role === 'technician',
      canManage:       role === 'admin',
      homeRoute:       role ? (ROLE_HOME[role] ?? '/dashboard') : '/login',
    };
  }, [user]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const login = useCallback(async (tenDangNhap: string, matKhau: string) => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await authService.login(tenDangNhap, matKhau);
      setUser(authUser);
      navigate(ROLE_HOME[authUser.role] ?? '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const clearError = useCallback(() => setError(null), []);

  const hasRole = useCallback((role: UserRole) => user?.role === role, [user]);

  // ── Value ─────────────────────────────────────────────────────────────────
  const value: AuthContextType = {
    user,
    isLoading,
    error,
    ...flags,
    hasRole,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext phải được dùng bên trong <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
