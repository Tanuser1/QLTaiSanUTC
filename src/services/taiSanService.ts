import apiClient from './apiClient';
import type { ApiAsset, AssetListResponse } from '../types/Asset';

export interface AssetFilter {
  loai?:      number | string;
  keyword?:   string;
  trangThai?: string | number;
  page?:      number;
  limit?:     number;
}

export const taiSanService = {
  async getAll(filter: AssetFilter = {}): Promise<AssetListResponse> {
    const params: Record<string, unknown> = {
      page:  filter.page  ?? 1,
      limit: filter.limit ?? 20,
    };
    if (filter.loai)      params.MaLoai    = filter.loai;
    if (filter.keyword)   params.keyword   = filter.keyword;
    if (filter.trangThai) params.TrangThai = filter.trangThai;

    const { data } = await apiClient.get('/taisan', { params });
    return data.data as AssetListResponse;
  },

  async getById(id: number | string): Promise<ApiAsset> {
    const { data } = await apiClient.get(`/taisan/${id}`);
    return data.data as ApiAsset;
  },

  async create(payload: Record<string, unknown>): Promise<ApiAsset> {
    const { data } = await apiClient.post('/taisan', payload);
    return data.data as ApiAsset;
  },

  async updateById(id: number | string, payload: Record<string, unknown>): Promise<ApiAsset> {
    const { data } = await apiClient.put(`/taisan/${id}`, payload);
    return data.data as ApiAsset;
  },

  async deleteById(id: number | string): Promise<void> {
    await apiClient.delete(`/taisan/${id}`);
  },
};
