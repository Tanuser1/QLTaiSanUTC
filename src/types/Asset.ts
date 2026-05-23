export interface ComponentLink {
  linkId:        number;
  attachedAt:    string;
  detachedAt:    string | null;
  note:          string | null;
  assetId:       number | null;
  code:          string | null;
  name:          string | null;
  status:        string | null;
  categoryName:  string | null;
  categoryGroup: string | null;
}

export interface RepairHistory {
  id:             number;
  assetId:        number;
  requestId:      number | null;
  reportId:       number | null;
  date:           string;
  cost:           number;
  description:    string | null;
  result:         number;
  resultLabel:    string | null;
  technicianId:   number | null;
  technicianName: string | null;
  createdAt:      string;
}

export interface ApiAsset {
  id:              number;
  code:            string;
  name:            string;
  categoryId:      number | null;
  categoryName:    string | null;
  categoryGroup:   string | null;
  categoryCode:    string | null;
  roomId:          number | null;
  roomName:        string | null;
  building:        string | null;
  floor:           number | null;
  departmentId:    number | null;
  departmentName:  string | null;
  userId:          number | null;
  assignedTo:      string | null;
  assignedEmail:   string | null;
  supplierId:      number | null;
  supplierName:    string | null;
  supplierPhone:   string | null;
  price:           number;
  specs:           Record<string, unknown> | null;
  image:           string | null;
  qrCode:          string | null;
  warrantyMonths:  number | null;
  purchaseDate:    string | null;
  manufactureYear: number | null;
  status:          string;
  statusLabel:     string | null;
  createdAt:       string | null;
  updatedAt:       string | null;
  components?:     ComponentLink[];
  repairHistory?:  RepairHistory[];
}

export interface AssetPagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface AssetListResponse {
  items:      ApiAsset[];
  pagination: AssetPagination;
}
