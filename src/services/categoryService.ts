import apiClient from './apiClient';
import type { DeviceCategory } from '../types/DeviceCategory';

// BE đã map qua mapDeviceCategory() — trả về English camelCase, không cần map thêm ở FE.

export const categoryService = {
  async getAll(NhomLoai?: string): Promise<DeviceCategory[]> {
    const { data } = await apiClient.get('/loai-taisan', {
      params: NhomLoai ? { NhomLoai } : undefined,
    });
    return data.data as DeviceCategory[];
  },

  async getById(id: number | string): Promise<DeviceCategory> {
    const { data } = await apiClient.get(`/loai-taisan/${id}`);
    return data.data as DeviceCategory;
  },

  async create(form: {
    TenLoai: string;
    KyHieu?: string;
    NhomLoai?: string;
    GhiChu?: string;
    ThuTu?: number;
    MaLoaiCha?: number | null;
  }): Promise<DeviceCategory> {
    const { data } = await apiClient.post('/loai-taisan', form);
    return data.data as DeviceCategory;
  },

  async update(id: number | string, form: Partial<{
    TenLoai:  string;
    KyHieu:   string;
    NhomLoai: string;
    GhiChu:   string;
    ThuTu:    number;
    MaLoaiCha: number | null;
  }>): Promise<DeviceCategory> {
    const { data } = await apiClient.put(`/loai-taisan/${id}`, form);
    return data.data as DeviceCategory;
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/loai-taisan/${id}`);
  },

  async addChildType(parentId: number | string, MaLoaiCon: number): Promise<void> {
    await apiClient.post(`/loai-taisan/${parentId}/loai-con`, { MaLoaiCon });
  },

  async removeChildType(parentId: number | string, childId: number | string): Promise<void> {
    await apiClient.delete(`/loai-taisan/${parentId}/loai-con/${childId}`);
  },
};
