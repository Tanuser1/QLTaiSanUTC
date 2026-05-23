export interface Supplier {
  id:          number;
  name:        string;
  email:       string | null;
  phone:       string | null;
  address:     string | null;
  supportInfo: string | null;
  isActive:    boolean;
  createdAt:   string | null;
  assetCount:  number;
}

export interface SupplierFormData {
  TenNCC:        string;
  Email:         string;
  SoDienThoai:   string;
  DiaChi:        string;
  ThongTinHoTro: string;
  TrangThai:     number;
}
