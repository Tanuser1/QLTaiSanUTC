export type UserRole = 'admin' | 'technician' | 'staff' | 'viewer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthUser extends User {
  token: string;
}

/* ── API shape từ BE (mapUser) ── */
export interface ApiUser {
  id:                 number;
  departmentId:       number | null;
  username:           string;
  fullName:           string;
  email:              string | null;
  phone:              string | null;
  role:               string;
  roleRaw:            string;
  mustChangePassword: boolean;
  isActive:           boolean;
  lastLogin:          string | null;
  createdAt:          string | null;
  departmentName:     string | null;
}

export interface UserListResponse {
  items:      ApiUser[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
