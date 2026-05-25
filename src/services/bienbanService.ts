import apiClient from './apiClient';
import type { RepairReport, RepairProposal } from '../types/bienban.types';

export const bienbanService = {
  async getAll(params?: { TrangThai?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/bienban', { params });
    return data.data; // { items, pagination }
  },

  async getById(id: number | string): Promise<RepairReport> {
    const { data } = await apiClient.get(`/bienban/${id}`);
    return data.data;
  },

  async create(payload: { MaYeuCau: number; ChiTietHong: string; DeXuat?: RepairProposal; ChiPhiUocTinh?: number; GhiChu?: string }): Promise<RepairReport> {
    const { data } = await apiClient.post('/bienban', payload);
    return data.data;
  },

  async approve(id: number | string, payload: { QuyetDinh: 'DongY' | 'TuChoi'; KinhPhiDuyet?: number; GhiChu?: string }): Promise<RepairReport> {
    const { data } = await apiClient.put(`/bienban/${id}/duyet`, payload);
    return data.data;
  },

  async complete(id: number | string, payload: { ChiPhi?: number; MoTa?: string; KetQua?: number }) {
    const { data } = await apiClient.put(`/bienban/${id}/hoan-thanh`, payload);
    return data;
  }
};
