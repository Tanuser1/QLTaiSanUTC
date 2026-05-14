// ── Pagination ──────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ── API Response ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// ── Sort ─────────────────────────────────────────────────────
export interface SortConfig<T = string> {
  key: T | null;
  direction: 'asc' | 'desc';
}

// ── Select option ────────────────────────────────────────────
export interface SelectOption {
  value: string;
  label: string;
}

// ── Status chung ─────────────────────────────────────────────
export type StatusType = 'active' | 'maintenance' | 'pending' | 'inactive' | 'ready';
