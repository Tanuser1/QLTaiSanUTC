import type { Room } from '../types/Room';

const MOCK_ROOMS: Room[] = [
  { id: '1', code: 'KH-01', name: 'Phòng Kỹ thuật 01',   building: 'A', floor: 1, capacity: 30, deviceCount: 32, managedBy: 'Nguyễn Văn A' },
  { id: '2', code: 'KT-02', name: 'Phòng Kế toán 02',    building: 'A', floor: 2, capacity: 20, deviceCount: 24, managedBy: 'Trần Thị B' },
  { id: '3', code: 'IT-01', name: 'Phòng IT 01',          building: 'B', floor: 1, capacity: 40, deviceCount: 45, managedBy: 'Lê Minh C' },
  { id: '4', code: 'HP-A',  name: 'Phòng họp A',          building: 'C', floor: 0, capacity: 50, deviceCount: 8,  managedBy: 'Phạm Thu D' },
];

export const roomService = {
  async getAll(): Promise<Room[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_ROOMS];
  },

  async getById(id: string): Promise<Room | undefined> {
    return MOCK_ROOMS.find((r) => r.id === id);
  },
};
