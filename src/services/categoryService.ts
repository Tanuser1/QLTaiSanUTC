/**
 * src/services/categoryService.ts
 * Gọi API thật tới backend /api/loai-taisan
 */
import apiClient from './apiClient';
import type { DeviceCategory } from '../types/DeviceCategory';

function mapToCategory(l: any): DeviceCategory {
  return {
    id:          String(l.MaLoai),
    name:        l.TenLoai,
    slug:        l.KyHieu?.toLowerCase() || String(l.MaLoai),
    count:       0, // API có thể bổ sung sau
    description: l.GhiChu || l.NhomLoai || '',
    // Trường gốc DB
    KyHieu:      l.KyHieu,
    NhomLoai:    l.NhomLoai,
    ThuTu:       l.ThuTu,
  };
}

export const categoryService = {
  async getAll(NhomLoai?: string): Promise<DeviceCategory[]> {
    const { data } = await apiClient.get('/loai-taisan', {
      params: NhomLoai ? { NhomLoai } : undefined,
    });
    return (data.data as any[]).map(mapToCategory);
  },

  async getById(id: string): Promise<DeviceCategory & { LoaiCon: any[] }> {
    const { data } = await apiClient.get(`/loai-taisan/${id}`);
    const cat = mapToCategory(data.data) as DeviceCategory & { LoaiCon: any[] };
    cat.LoaiCon = data.data.LoaiCon ?? [];
    return cat;
  },

  async create(form: {
    TenLoai: string;
    KyHieu?: string;
    NhomLoai?: string;
    GhiChu?: string;
    ThuTu?: number;
  }): Promise<DeviceCategory> {
    const { data } = await apiClient.post('/loai-taisan', form);
    return mapToCategory(data.data);
  },

  async update(id: string, form: Partial<{
    TenLoai: string;
    KyHieu: string;
    NhomLoai: string;
    GhiChu: string;
    ThuTu: number;
  }>): Promise<DeviceCategory> {
    const { data } = await apiClient.put(`/loai-taisan/${id}`, form);
    return mapToCategory(data.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/loai-taisan/${id}`);
  },

  // Quản lý loại con
  async addChildType(parentId: string, MaLoaiCon: number, GhiChu?: string): Promise<void> {
    await apiClient.post(`/loai-taisan/${parentId}/loai-con`, { MaLoaiCon, GhiChu });
  },

  async removeChildType(parentId: string, childId: string): Promise<void> {
    await apiClient.delete(`/loai-taisan/${parentId}/loai-con/${childId}`);
  },
};
