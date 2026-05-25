import apiClient from './apiClient';
import type { SupportRequest, SupportRequestType } from '../types/yeucau.types';

export const yeucauService = {
  async getAll(params?: { TrangThai?: string; LoaiYeuCau?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/yeucau', { params });
    return data.data; // { items, pagination }
  },

  async getById(id: number | string): Promise<SupportRequest> {
    const { data } = await apiClient.get(`/yeucau/${id}`);
    return data.data;
  },

  async create(payload: { MaTaiSan: number; LoaiYeuCau?: SupportRequestType; MoTaLoi: string; MucDo?: number }): Promise<SupportRequest> {
    const { data } = await apiClient.post('/yeucau', payload);
    return data.data;
  },

  async assign(id: number | string, NguoiXuLy: number): Promise<SupportRequest> {
    const { data } = await apiClient.put(`/yeucau/${id}/phan-cong`, { NguoiXuLy });
    return data.data;
  },

  async accept(id: number | string): Promise<SupportRequest> {
    const { data } = await apiClient.put(`/yeucau/${id}/nhan`);
    return data.data;
  },

  async reject(id: number | string, LyDoTuChoi: string): Promise<SupportRequest> {
    const { data } = await apiClient.put(`/yeucau/${id}/tu-choi`, { LyDoTuChoi });
    return data.data;
  }
};
