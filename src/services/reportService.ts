export interface MaintenanceStat {
  month: string;
  total: number;
  completed: number;
  pending: number;
}

export interface DepartmentStat {
  department: string;
  deviceCount: number;
  activeCount: number;
  maintenanceCount: number;
}

// Mock report data
const MAINTENANCE_STATS: MaintenanceStat[] = [
  { month: '01/2026', total: 45, completed: 38, pending: 7 },
  { month: '02/2026', total: 32, completed: 30, pending: 2 },
  { month: '03/2026', total: 58, completed: 50, pending: 8 },
  { month: '04/2026', total: 40, completed: 35, pending: 5 },
  { month: '05/2026', total: 27, completed: 20, pending: 7 },
];

const DEPARTMENT_STATS: DepartmentStat[] = [
  { department: 'Khoa CNTT',        deviceCount: 450, activeCount: 400, maintenanceCount: 50 },
  { department: 'Khoa Điện',        deviceCount: 320, activeCount: 290, maintenanceCount: 30 },
  { department: 'Khoa Cơ khí',      deviceCount: 280, activeCount: 250, maintenanceCount: 30 },
  { department: 'Phòng Hành chính', deviceCount: 120, activeCount: 115, maintenanceCount: 5  },
];

export const reportService = {
  async getMaintenanceStats(): Promise<MaintenanceStat[]> {
    await new Promise((r) => setTimeout(r, 300));
    return MAINTENANCE_STATS;
  },

  async getDepartmentStats(): Promise<DepartmentStat[]> {
    await new Promise((r) => setTimeout(r, 300));
    return DEPARTMENT_STATS;
  },
};
