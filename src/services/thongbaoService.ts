import apiClient from './apiClient';

export const thongbaoService = {
  async getAll(params?: { chuaDoc?: boolean; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/thongbao', { params });
    return data.data; // { items, unreadCount, pagination }
  },

  async markAsRead(id: number | string) {
    const { data } = await apiClient.put(`/thongbao/${id}/doc`);
    return data;
  },

  async markAllAsRead() {
    const { data } = await apiClient.put('/thongbao/doc-tat-ca');
    return data;
  }
};
