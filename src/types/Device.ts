import type { StatusType } from './common';

export interface Device {
  id: string;
  assetCode: string;
  assetName: string;
  category: string;
  categoryId?: string;
  value: string;
  assignedTo: string;
  specs: string;
  location: string;
  status: StatusType;
  assetType: string;
  attention?: boolean;
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DeviceFormData = Omit<Device, 'id' | 'createdAt' | 'updatedAt'>;
