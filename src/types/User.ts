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
