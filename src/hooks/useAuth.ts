import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser, UserRole } from '../types/auth.types';
import { authService } from '../services/authService';

const ROLE_REDIRECT: Record<UserRole, string> = {
  admin:      '/dashboard',
  bgh:        '/dashboard',
  technician: '/dashboard',
  teacher:    '/dashboard',
};

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (tenDangNhap: string, matKhau: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const authUser = await authService.login(tenDangNhap, matKhau);
      setUser(authUser);
      navigate(ROLE_REDIRECT[authUser.role] ?? '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return { user, isAuthenticated: !!user, isLoading, error, login, logout };
}
