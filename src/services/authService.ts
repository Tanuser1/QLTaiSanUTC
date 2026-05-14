import type { AuthUser } from '../types/User';
import { storage } from '../utils/storage';

// Mock credentials for dev
const MOCK_CREDENTIALS = {
  email: 'admin@utc.edu.vn',
  password: '123456',
};

const MOCK_USER: AuthUser = {
  id: '1',
  email: 'admin@utc.edu.vn',
  fullName: 'Quản trị viên',
  role: 'admin',
  department: 'Phòng Kỹ thuật',
  isActive: true,
  token: 'mock-jwt-token-utc-2026',
};

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 400));
    if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
      storage.set('auth_user', MOCK_USER);
      storage.set('token', MOCK_USER.token);
      return MOCK_USER;
    }
    // Dev mode: bypass auth with any credentials
    const devUser: AuthUser = { ...MOCK_USER, email };
    storage.set('auth_user', devUser);
    storage.set('token', devUser.token);
    return devUser;
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
