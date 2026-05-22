// Khớp với mapUser() trong backend/mappers/index.js

export type UserRole = 'admin' | 'bgh' | 'technician' | 'teacher';

export interface AuthUser {
  id: number;
  departmentId: number | null;
  username: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  roleRaw: string;
  mustChangePassword: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string | null;
  departmentName: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}
