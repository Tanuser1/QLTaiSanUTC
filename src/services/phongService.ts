import apiClient from './apiClient';
import type { Room, RoomListResponse, RoomFormPayload } from '../types/Room';

export interface RoomFilter {
  MaKhoa?:  string | number;
  keyword?: string;
  page?:    number;
  limit?:   number;
}

export const phongService = {
  async getAll(filter: RoomFilter = {}): Promise<RoomListResponse> {
    const params: Record<string, unknown> = {
      page:  filter.page  ?? 1,
      limit: filter.limit ?? 20,
    };
    if (filter.MaKhoa)  params.MaKhoa  = filter.MaKhoa;
    if (filter.keyword) params.keyword  = filter.keyword;

    const { data } = await apiClient.get('/phong', { params });
    return data.data as RoomListResponse;
  },

  async getById(id: number | string): Promise<Room> {
    const { data } = await apiClient.get(`/phong/${id}`);
    return data.data as Room;
  },

  async create(form: RoomFormPayload): Promise<Room> {
    const { data } = await apiClient.post('/phong', form);
    return data.data as Room;
  },

  async update(id: number | string, form: Partial<RoomFormPayload>): Promise<Room> {
    const { data } = await apiClient.put(`/phong/${id}`, form);
    return data.data as Room;
  },

  async deleteById(id: number | string): Promise<void> {
    await apiClient.delete(`/phong/${id}`);
  },
};
