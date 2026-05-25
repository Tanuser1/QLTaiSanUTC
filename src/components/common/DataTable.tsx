import React, { useState, useMemo } from 'react';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Plus, Trash2, Search, Eye, Filter,
} from 'lucide-react';
import { StatusChip } from './StatusChip';
import type { StatusType } from './StatusChip';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
export interface TableRowData {
  id: string;
  assetCode: string;
  assetName: string;
  category: string;
  quantity?: number;
  value: string;
  assignedTo: string;
  specs: string;
  location: string;
  status: StatusType;
  assetType: string;
  attention?: boolean;
}

/* ─────────────────────────────────────────────────────────────
   MOCK DATA (fallback khi chưa có dữ liệu thật)
───────────────────────────────────────────────────────────── */
const MOCK_DATA: TableRowData[] = [
  { id: '1',  assetCode: 'MB-001', assetName: 'Máy tính Dell Latitude 5540',   category: 'Máy tính',   location: 'Phòng KH-01', assignedTo: 'Nguyễn Văn A', status: 'active',      value: '28.500.000 ₫', specs: 'Core i5, 16GB RAM, 512GB SSD', assetType: 'Cố định' },
  { id: '2',  assetCode: 'MB-002', assetName: 'Máy tính HP ProBook 450',       category: 'Máy tính',   location: 'Phòng KT-02', assignedTo: 'Trần Thị B',   status: 'maintenance', value: '22.000.000 ₫', specs: 'Core i5, 8GB RAM, 256GB SSD',  assetType: 'Cố định', attention: true },
  { id: '3',  assetCode: 'MN-001', assetName: 'Màn hình LG 27" 4K',           category: 'Màn hình',   location: 'Phòng IT-01', assignedTo: 'Lê Minh C',    status: 'active',      value: '12.000.000 ₫', specs: '27 inch, 4K UHD, 60Hz',       assetType: 'Cố định' },
  { id: '4',  assetCode: 'MF-003', assetName: 'Máy fax Canon L170',           category: 'Thiết bị',   location: 'Văn phòng',   assignedTo: 'Phạm Thu D',   status: 'inactive',    value: '3.200.000 ₫',  specs: 'In Laser đen trắng',           assetType: 'Vật tư' },
  { id: '5',  assetCode: 'XM-001', assetName: 'Xe máy Honda Wave RSX',        category: 'Phương tiện', location: 'Bãi xe',      assignedTo: 'Hoàng Văn E',  status: 'active',      value: '45.000.000 ₫', specs: '110cc',                        assetType: 'Cố định' },
  { id: '6',  assetCode: 'MB-003', assetName: 'MacBook Air M2 13"',           category: 'Máy tính',   location: 'BGĐ',         assignedTo: 'Vũ Thị F',     status: 'ready',       value: '32.000.000 ₫', specs: 'M2, 8GB RAM, 256GB SSD',       assetType: 'Cố định' },
  { id: '7',  assetCode: 'MF-004', assetName: 'Máy chiếu Epson EB-S41',      category: 'Thiết bị',   location: 'Phòng họp A', assignedTo: 'Đỗ Thành G',   status: 'pending',     value: '9.800.000 ₫',  specs: '3300 Ansi Lumens',             assetType: 'Cố định', attention: true },
  { id: '8',  assetCode: 'IN-001', assetName: 'Máy in HP LaserJet Pro',       category: 'Thiết bị',   location: 'Phòng KT-02', assignedTo: 'Ngô Bảo H',    status: 'maintenance', value: '6.500.000 ₫',  specs: 'In Laser, Wifi',               assetType: 'Vật tư' },
  { id: '9',  assetCode: 'XO-001', assetName: 'Xe ô tô Toyota Innova 2.0',   category: 'Phương tiện', location: 'Bãi xe',      assignedTo: 'Đặng Hữu I',   status: 'active',      value: '680.000.000 ₫', specs: '7 chỗ, số tự động',           assetType: 'Cố định' },
  { id: '10', assetCode: 'MB-004', assetName: 'Máy tính Lenovo ThinkPad X1', category: 'Máy tính',   location: 'Phòng IT-02', assignedTo: 'Bùi Lan J',    status: 'ready',       value: '36.000.000 ₫', specs: 'Core i7, 16GB RAM, 512GB SSD', assetType: 'Cố định' },
];

/* ─────────────────────────────────────────────────────────────
   INLINE TABLE ROW
───────────────────────────────────────────────────────────── */
const DataTableRow: React.FC<{
  row: TableRowData;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (row: TableRowData) => void;
  onView:   (row: TableRowData) => void;
}> = ({ row, selected, onSelect, onDelete, onView }) => (
  <tr className={`border-b border-[#e1e3e4] last:border-0 cursor-pointer transition-colors duration-100 ${row.attention ? 'bg-[#fff176]/10' : ''} ${selected ? 'bg-[#041627]/5' : 'hover:bg-[#041627]/5'}`}>
    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={selected} onChange={() => onSelect(row.id)} className="w-4 h-4 rounded border-[#c4c6cd] accent-[#26a69a] cursor-pointer" />
    </td>
    <td className="px-3 py-2.5 text-sm font-medium text-[#002957] tabular-nums whitespace-nowrap">{row.assetCode}</td>
    <td className="px-3 py-2.5 text-sm text-[#191c1d] max-w-[200px] truncate">{row.assetName}</td>
    <td className="px-3 py-2.5 text-sm text-[#44474c] whitespace-nowrap">{row.category}</td>
    <td className="px-3 py-2.5 text-sm text-center whitespace-nowrap">
      <span className="font-semibold text-[#191c1d]">
        {row.quantity ?? 1}
      </span>
    </td>
    <td className="px-3 py-2.5 text-sm font-medium text-[#191c1d] tabular-nums whitespace-nowrap">{row.value}</td>
    <td className="px-3 py-2.5 text-sm text-[#44474c] whitespace-nowrap">{row.assignedTo}</td>
    <td className="px-3 py-2.5 text-sm text-[#44474c] max-w-[150px] truncate">{row.specs}</td>
    <td className="px-3 py-2.5 text-sm text-[#44474c] whitespace-nowrap">{row.location}</td>
    <td className="px-3 py-2.5"><StatusChip status={row.status} /></td>
    <td className="px-3 py-2.5 text-sm text-[#44474c] whitespace-nowrap">{row.assetType}</td>
    <td className="px-3 py-2.5">
      <button
        className="text-[#041627] hover:text-[#26a69a] transition-colors p-1"
        title="Xem chi tiết"
        onClick={(e) => { e.stopPropagation(); onView(row); }}
      >
        <Eye size={16} />
      </button>
    </td>
    <td className="px-3 py-2.5">
      <button
        className="text-[#ef5350] hover:text-[#d32f2f] transition-colors p-1"
        title="Xóa"
        onClick={(e) => { e.stopPropagation(); onDelete(row); }}
      >
        <Trash2 size={16} />
      </button>
    </td>
  </tr>
);

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
type SortKey = keyof TableRowData | null;
type SortDir = 'asc' | 'desc';

const COLUMNS = [
  { key: 'assetCode',  label: 'Mã',            sortable: true  },
  { key: 'assetName',  label: 'Tên thiết bị',  sortable: true  },
  { key: 'category',   label: 'Loại',          sortable: true  },
  { key: 'quantity',   label: 'Số lượng',      sortable: false },
  { key: 'value',      label: 'Giá',           sortable: true  },
  { key: 'assignedTo', label: 'Người dùng',    sortable: true  },
  { key: 'specs',      label: 'Cấu hình',      sortable: false },
  { key: 'location',   label: 'Phòng',         sortable: true  },
  { key: 'status',     label: 'Trạng thái',    sortable: false },
  { key: 'assetType',  label: 'Kiểu thiết bị', sortable: true  },
] as const;

const LIMIT_OPTIONS = [10, 20, 50] as const;

const STATUS_OPTIONS: { value: StatusType | 'all'; label: string }[] = [
  { value: 'all',         label: 'Tất cả trạng thái' },
  { value: 'active',      label: 'Đang sử dụng'      },
  { value: 'ready',       label: 'Trong kho'          },
  { value: 'maintenance', label: 'Hỏng / Đang sửa'   },
  { value: 'pending',     label: 'Chờ thanh lý'       },
  { value: 'inactive',    label: 'Đã thanh lý'        },
];

/* ─────────────────────────────────────────────────────────────
   DATA TABLE
───────────────────────────────────────────────────────────── */
interface DataTableProps {
  onAddAsset?:      () => void;
  rows?:            TableRowData[];
  isLoading?:       boolean;
  serverTotal?:     number;
  serverTotalQuantity?: number;
  page?:            number;
  limit?:           number;
  onPageChange?:    (page: number) => void;
  onLimitChange?:   (limit: number) => void;
  onSearch?:        (q: string) => void;
  onFilterStatus?:  (status: StatusType | 'all') => void;
  onDeleteRow?:     (row: TableRowData) => void;
  onViewRow?:       (row: TableRowData) => void;
  categoryName?:    string;
}

export const DataTable: React.FC<DataTableProps> = ({
  onAddAsset,
  rows: externalRows,
  isLoading = false,
  serverTotal,
  serverTotalQuantity,
  page: externalPage,
  limit: externalLimit,
  onPageChange,
  onLimitChange,
  onSearch,
  onFilterStatus,
  onDeleteRow,
  onViewRow,
  categoryName,
}) => {
  const isServerMode = externalRows !== undefined;

  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [sortKey,       setSortKey]       = useState<SortKey>(null);
  const [sortDir,       setSortDir]       = useState<SortDir>('asc');
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState<StatusType | 'all'>('all');
  const [localPage,     setLocalPage]     = useState(1);
  const [localLimit,    setLocalLimit]    = useState(20);

  const rowsPerPage = isServerMode ? (externalLimit ?? 20) : localLimit;
  const activePage  = isServerMode ? (externalPage  ?? 1)  : localPage;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleLimitChange = (n: number) => {
    if (isServerMode) {
      onLimitChange?.(n);
      onPageChange?.(1);
    } else {
      setLocalLimit(n);
      setLocalPage(1);
    }
  };

  const handleStatusChange = (s: StatusType | 'all') => {
    setFilterStatus(s);
    if (!isServerMode) setLocalPage(1);
    onFilterStatus?.(s);
  };

  const handlePageChange = (p: number) => {
    if (isServerMode) onPageChange?.(p);
    else setLocalPage(p);
  };

  const filteredData = useMemo(() => {
    const source = isServerMode ? (externalRows ?? []) : MOCK_DATA;
    let data = [...source];
    if (!isServerMode && search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        r.assetCode.toLowerCase().includes(q) || r.assetName.toLowerCase().includes(q) ||
        r.assignedTo.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') data = data.filter((r) => r.status === filterStatus);
    if (!isServerMode && sortKey) {
      data.sort((a, b) => {
        const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), 'vi');
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [isServerMode, externalRows, search, filterStatus, sortKey, sortDir]);

  const total      = (isServerMode && filterStatus === 'all')
    ? (serverTotal ?? filteredData.length)
    : filteredData.length;

  const totalQuantityView = isServerMode && filterStatus === 'all' && serverTotalQuantity !== undefined
    ? serverTotalQuantity
    : filteredData.reduce((sum, r) => sum + (r.quantity ?? 1), 0);
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const pageData   = isServerMode
    ? filteredData
    : filteredData.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage);

  const allSelected  = pageData.length > 0 && pageData.every((r) => selected.has(r.id));
  const someSelected = pageData.some((r) => selected.has(r.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageData.forEach((r) => next.delete(r.id));
      else pageData.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const SortIcon: React.FC<{ column: string }> = ({ column }) => {
    if (sortKey !== column) return <ChevronsUpDown size={12} className="text-[#c4c6cd]" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-[#26a69a]" /> : <ChevronDown size={12} className="text-[#26a69a]" />;
  };

  /* ── page buttons: show at most 7 pages with ellipsis ── */
  const pageButtons = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const around = new Set([1, totalPages, activePage - 1, activePage, activePage + 1].filter((p) => p >= 1 && p <= totalPages));
    const sorted = Array.from(around).sort((a, b) => a - b);
    const result: (number | '…')[] = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) result.push('…');
      result.push(p);
    });
    return result;
  }, [totalPages, activePage]);

  return (
    <div className="bg-white rounded-lg border border-[#e1e3e4] overflow-hidden flex flex-col" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-[#e1e3e4]">
        <h2 className="text-[17px] font-bold text-[#041627] mr-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {categoryName ? `Danh mục: ${categoryName}` : `Tìm thấy ${totalQuantityView} Thiết Bị`}
        </h2>

        {/* Search */}
        <div className="relative flex items-center flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 text-[#74777d] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isServerMode) setLocalPage(1);
              onSearch?.(e.target.value);
            }}
            placeholder="Tìm kiếm..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#c4c6cd] rounded bg-[#f3f4f5] focus:bg-white focus:border-[#00796b] focus:ring-1 focus:ring-[#00796b] outline-none transition-all"
          />
        </div>

        {/* Hiển thị */}
        <div className="flex items-center gap-1.5 border border-[#c4c6cd] rounded px-2.5 py-1.5 bg-white">
          <span className="text-sm text-[#44474c]">Hiển thị</span>
          <select
            value={rowsPerPage}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="text-sm text-[#191c1d] outline-none bg-transparent font-semibold cursor-pointer"
          >
            {LIMIT_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-sm text-[#44474c]">hàng</span>
        </div>

        {/* Trạng thái */}
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-[#74777d]" />
          <select
            value={filterStatus}
            onChange={(e) => handleStatusChange(e.target.value as StatusType | 'all')}
            className="text-sm border border-[#c4c6cd] rounded px-2 py-1.5 bg-white text-[#191c1d] focus:border-[#00796b] outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        {/* Bulk delete */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#74777d]">Đã chọn {selected.size}</span>
            <button className="flex items-center gap-1.5 text-xs text-[#ef5350] hover:bg-[#ef5350]/10 px-2 py-1.5 rounded transition-colors">
              <Trash2 size={13} /> Xoá
            </button>
          </div>
        )}

        {/* Thêm mới */}
        <button
          onClick={onAddAsset}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#26a69a' }}
        >
          <Plus size={14} />
          Thêm thiết bị
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
        <table className="w-full text-left border-collapse" style={{ minWidth: '900px' }}>
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[#00695c]" style={{ backgroundColor: '#00796b', color: '#ffffff' }}>
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-[#c4c6cd] accent-[#26a69a] cursor-pointer"
                />
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key as SortKey)}
                  className={`px-3 py-3 text-[11px] font-semibold text-white uppercase tracking-wider whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-gray-200 select-none' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon column={col.key} />}
                  </span>
                </th>
              ))}
              <th className="px-3 py-3 text-[11px] font-semibold text-white uppercase tracking-wider whitespace-nowrap">Xem</th>
              <th className="px-3 py-3 text-[11px] font-semibold text-white uppercase tracking-wider whitespace-nowrap">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#e1e3e4] animate-pulse">
                  {Array.from({ length: 13 }).map((__, j) => (
                    <td key={j} className="px-3 py-3"><div className="h-3 bg-[#e1e3e4] rounded" /></td>
                  ))}
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-5 py-12 text-center text-sm text-[#74777d]">
                  Không tìm thấy tài sản nào
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <DataTableRow key={row.id} row={row} selected={selected.has(row.id)} onSelect={toggleSelect} onDelete={onDeleteRow ?? (() => {})} onView={onViewRow ?? (() => {})} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#e1e3e4] bg-[#f8f9fa]">
        <span className="text-xs text-[#74777d]">
          {total === 0 ? 'Không có dữ liệu' : `Hiển thị ${Math.min((activePage - 1) * rowsPerPage + 1, total)}–${Math.min(activePage * rowsPerPage, total)} / ${total} mục`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(Math.max(1, activePage - 1))}
            disabled={activePage === 1}
            className="w-7 h-7 rounded flex items-center justify-center text-[#44474c] hover:bg-[#e1e3e4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >‹</button>

          {pageButtons.map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-[#74777d]">…</span>
            ) : (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-7 h-7 rounded text-xs flex items-center justify-center transition-colors ${p === activePage ? 'bg-[#00796b] text-white font-semibold' : 'text-[#44474c] hover:bg-[#e1e3e4]'}`}
              >{p}</button>
            )
          )}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
            disabled={activePage === totalPages}
            className="w-7 h-7 rounded flex items-center justify-center text-[#44474c] hover:bg-[#e1e3e4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >›</button>
        </div>
      </div>
    </div>
  );
};

export { DataTable as AssetTable };
export default DataTable;
