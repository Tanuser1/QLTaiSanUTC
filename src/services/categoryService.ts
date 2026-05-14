import type { DeviceCategory } from '../types/DeviceCategory';

// Mock data
const MOCK_CATEGORIES: DeviceCategory[] = [
  { id: '1', name: 'Máy tính phòng Lab',    slug: 'may-tinh-phong-lab',    count: 450,  description: 'Máy tính dùng trong phòng thực hành' },
  { id: '2', name: 'Máy chiếu giảng đường', slug: 'may-chieu-giang-duong', count: 120,  description: 'Máy chiếu dùng trong giảng đường' },
  { id: '3', name: 'Thiết bị mạng',         slug: 'thiet-bi-mang',         count: 85,   description: 'Switch, Router, Access Point' },
  { id: '4', name: 'Micro & Âm thanh',      slug: 'micro-am-thanh',        count: 150,  description: 'Hệ thống âm thanh, micro' },
  { id: '5', name: 'Laptop Cán bộ',         slug: 'laptop-can-bo',         count: 60,   description: 'Laptop cấp cho cán bộ giảng viên' },
  { id: '6', name: 'Linh kiện',             slug: 'linh-kien',             count: 320,  description: 'Linh kiện điện tử thay thế' },
  { id: '7', name: 'Bàn ghế sinh viên',     slug: 'ban-ghe-sinh-vien',     count: 1315, description: 'Bàn ghế phòng học' },
];

export const categoryService = {
  async getAll(): Promise<DeviceCategory[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_CATEGORIES];
  },

  async getById(id: string): Promise<DeviceCategory | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return MOCK_CATEGORIES.find((c) => c.id === id);
  },

  async create(data: Omit<DeviceCategory, 'id'>): Promise<DeviceCategory> {
    await new Promise((r) => setTimeout(r, 300));
    const newCat: DeviceCategory = { ...data, id: String(Date.now()) };
    MOCK_CATEGORIES.push(newCat);
    return newCat;
  },

  async update(id: string, data: Partial<DeviceCategory>): Promise<DeviceCategory> {
    await new Promise((r) => setTimeout(r, 300));
    const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    MOCK_CATEGORIES[idx] = { ...MOCK_CATEGORIES[idx], ...data };
    return MOCK_CATEGORIES[idx];
  },

  async delete(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
    if (idx !== -1) MOCK_CATEGORIES.splice(idx, 1);
  },
};
