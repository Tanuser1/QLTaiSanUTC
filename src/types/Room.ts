export interface Room {
  id: string;
  code: string;
  name: string;
  building?: string;
  floor?: number;
  capacity?: number;
  deviceCount?: number;
  managedBy?: string;
  notes?: string;
}
