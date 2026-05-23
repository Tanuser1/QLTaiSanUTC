import apiClient from './apiClient';
import type { Supplier, SupplierFormData } from '../types/Supplier';

export const nhaCungCapService = {
  async getAll(keyword?: string): Promise<Supplier[]> {
    const { data } = await apiClient.get('/nhacc', {
      params: keyword ? { keyword } : undefined,
    });
    return data.data as Supplier[];
  },

  async create(form: SupplierFormData): Promise<Supplier> {
    const { data } = await apiClient.post('/nhacc', form);
    return data.data as Supplier;
  },

  async update(id: number, form: Partial<SupplierFormData>): Promise<Supplier> {
    const { data } = await apiClient.put(`/nhacc/${id}`, form);
    return data.data as Supplier;
  },

  async deleteById(id: number): Promise<void> {
    await apiClient.delete(`/nhacc/${id}`);
  },
};
