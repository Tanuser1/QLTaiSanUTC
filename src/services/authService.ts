import type { AuthUser, LoginResponse } from '../types/auth.types';
import { storage } from '../utils/storage';
import apiClient from './apiClient';

export const authService = {
  async login(tenDangNhap: string, matKhau: string): Promise<AuthUser> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      TenDangNhap: tenDangNhap,
      MatKhau: matKhau,
    });

    storage.set('token', data.token);
    storage.set('auth_user', data.user);

    return data.user;
  },

  logout(): void {
    storage.remove('auth_user');
    storage.remove('token');
  },

  getCurrentUser(): AuthUser | null {
    return storage.get<AuthUser>('auth_user') ?? null;
  },

  getToken(): string | null {
    return storage.get<string>('token') ?? null;
  },

  isAuthenticated(): boolean {
    return !!storage.get('token');
  },
};
