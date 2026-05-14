// Dashboard stats hook — trả về mock data tổng quan hệ thống.
// Sau này có thể kết nối API thật bằng cách thay mock bằng fetch call.

export interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  maintenanceDevices: number;
  pendingRequests: number;
  labComputers: number;
  projectors: number;
  overdueDevices: number;
  staffLaptops: number;
  networkDevices: number;
  scheduledToday: number;
  systemUsers: number;
  lastUpdated: Date;
}

export function useDashboardStats(): DashboardStats {
  // Mock data — thay bằng useEffect + API call khi tích hợp backend
  return {
    totalDevices:      2500,
    activeDevices:     2087,
    maintenanceDevices: 183,
    pendingRequests:     75,
    labComputers:       450,
    projectors:         120,
    overdueDevices:      23,
    staffLaptops:        60,
    networkDevices:      85,
    scheduledToday:      14,
    systemUsers:        148,
    lastUpdated: new Date(),
  };
}
