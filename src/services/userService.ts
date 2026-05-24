import apiClient from './apiClient';
import type { ApiUser, UserListResponse } from '../types/User';

export interface UserFilter {
  keyword?:   string;
  VaiTro?:    string;
  TrangThai?: string | number;
  MaKhoa?:    string | number;
  page?:      number;
  limit?:     number;
}

export const userService = {
  async getAll(filter: UserFilter = {}): Promise<UserListResponse> {
    const params: Record<string, unknown> = {
      page:  filter.page  ?? 1,
      limit: filter.limit ?? 20,
    };
    if (filter.keyword)                           params.keyword   = filter.keyword;
    if (filter.VaiTro)                            params.VaiTro    = filter.VaiTro;
    if (filter.TrangThai !== undefined && filter.TrangThai !== '') params.TrangThai = filter.TrangThai;
    if (filter.MaKhoa)                            params.MaKhoa    = filter.MaKhoa;

    const { data } = await apiClient.get('/users', { params });
    return data.data as UserListResponse;
  },

  async create(payload: Record<string, unknown>): Promise<ApiUser> {
    const { data } = await apiClient.post('/users', payload);
    return data.data as ApiUser;
  },

  async toggleStatus(id: number | string): Promise<{ isActive: boolean }> {
    const { data } = await apiClient.put(`/users/${id}/toggle-status`);
    return data.data as { isActive: boolean };
  },

  async resetPassword(id: number | string, MatKhauMoi: string): Promise<void> {
    await apiClient.put(`/users/${id}/reset-password`, { MatKhauMoi });
  },
};
