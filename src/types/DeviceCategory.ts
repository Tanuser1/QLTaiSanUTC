export interface DeviceCategory {
  id:        number;
  parentId:  number | null;
  name:      string;
  code:      string | null;
  group:     string;
  note:      string | null;
  sortOrder: number;
  createdAt: string | null;
  children:  DeviceCategory[];
  total?:    number;
}
