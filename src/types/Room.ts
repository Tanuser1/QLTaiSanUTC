import type { ApiAsset } from './Asset';

export interface Room {
  id:             number;
  departmentId:   number | null;
  name:           string;
  building:       string;
  address:        string | null;
  floor:          number;
  type:           string;
  note:           string | null;
  createdAt:      string | null;
  departmentName: string | null;
  assetCount?:    number;
  assets?:        ApiAsset[];
}

export interface RoomListResponse {
  items:      Room[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface RoomFormPayload {
  TenPhong:  string;
  TenToaNha: string;
  Tang:      number;
  LoaiPhong: string;
  MaKhoa?:   number | null;
  DiaChi?:   string | null;
  GhiChu?:   string | null;
}
