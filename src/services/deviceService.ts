import type { Device, DeviceFormData } from '../types/Device';

const MOCK_DEVICES: Device[] = [
  { id: '1',  assetCode: 'MB-001', assetName: 'Máy tính Dell Latitude 5540',   category: 'Máy tính',     value: '28.500.000 ₫', assignedTo: 'Nguyễn Văn A', specs: 'Core i5, 16GB RAM, 512GB SSD', location: 'Phòng KH-01',  status: 'ready',       assetType: 'Cố định' },
  { id: '2',  assetCode: 'MB-002', assetName: 'Máy tính HP ProBook 450',        category: 'Máy tính',     value: '22.000.000 ₫', assignedTo: 'Trần Thị B',   specs: 'Core i5, 8GB RAM, 256GB SSD', location: 'Phòng KT-02',  status: 'maintenance', assetType: 'Cố định', attention: true },
  { id: '3',  assetCode: 'MN-001', assetName: 'Màn hình LG 27" 4K',            category: 'Màn hình',     value: '12.000.000 ₫', assignedTo: 'Lê Minh C',    specs: '27 inch, 4K UHD, 60Hz',      location: 'Phòng IT-01',  status: 'active',      assetType: 'Cố định' },
  { id: '4',  assetCode: 'MF-003', assetName: 'Máy fax Canon L170',             category: 'Thiết bị',     value: '3.200.000 ₫',  assignedTo: 'Phạm Thu D',   specs: 'In Laser đen trắng',          location: 'Văn phòng',    status: 'inactive',    assetType: 'Vật tư' },
  { id: '5',  assetCode: 'XM-001', assetName: 'Xe máy Honda Wave RSX',          category: 'Phương tiện',  value: '45.000.000 ₫', assignedTo: 'Hoàng Văn E',  specs: '110cc',                       location: 'Bãi xe',       status: 'active',      assetType: 'Cố định' },
  { id: '6',  assetCode: 'MB-003', assetName: 'MacBook Air M2 13"',             category: 'Máy tính',     value: '32.000.000 ₫', assignedTo: 'Vũ Thị F',     specs: 'M2, 8GB RAM, 256GB SSD',      location: 'BGĐ',          status: 'ready',       assetType: 'Cố định' },
  { id: '7',  assetCode: 'MF-004', assetName: 'Máy chiếu Epson EB-S41',         category: 'Thiết bị',     value: '9.800.000 ₫',  assignedTo: 'Đỗ Thành G',   specs: '3300 Ansi Lumens',            location: 'Phòng họp A', status: 'pending',     assetType: 'Cố định', attention: true },
  { id: '8',  assetCode: 'IN-001', assetName: 'Máy in HP LaserJet Pro',          category: 'Thiết bị',     value: '6.500.000 ₫',  assignedTo: 'Ngô Bảo H',    specs: 'In Laser, Wifi',              location: 'Phòng KT-02',  status: 'maintenance', assetType: 'Vật tư' },
  { id: '9',  assetCode: 'XO-001', assetName: 'Xe ô tô Toyota Innova 2.0',      category: 'Phương tiện',  value: '680.000.000 ₫',assignedTo: 'Đặng Hữu I',   specs: '7 chỗ, số tự động',           location: 'Bãi xe',       status: 'active',      assetType: 'Cố định' },
  { id: '10', assetCode: 'MB-004', assetName: 'Máy tính Lenovo ThinkPad X1',    category: 'Máy tính',     value: '36.000.000 ₫', assignedTo: 'Bùi Lan J',    specs: 'Core i7, 16GB RAM, 512GB SSD', location: 'Phòng IT-02', status: 'ready',       assetType: 'Cố định' },
];

export const deviceService = {
  async getAll(): Promise<Device[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_DEVICES];
  },

  async getById(id: string): Promise<Device | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return MOCK_DEVICES.find((d) => d.id === id);
  },

  async create(data: DeviceFormData): Promise<Device> {
    await new Promise((r) => setTimeout(r, 300));
    const newDevice: Device = { ...data, id: String(Date.now()) };
    MOCK_DEVICES.push(newDevice);
    return newDevice;
  },

  async update(id: string, data: Partial<Device>): Promise<Device> {
    await new Promise((r) => setTimeout(r, 300));
    const idx = MOCK_DEVICES.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Device not found');
    MOCK_DEVICES[idx] = { ...MOCK_DEVICES[idx], ...data };
    return MOCK_DEVICES[idx];
  },

  async delete(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const idx = MOCK_DEVICES.findIndex((d) => d.id === id);
    if (idx !== -1) MOCK_DEVICES.splice(idx, 1);
  },
};
