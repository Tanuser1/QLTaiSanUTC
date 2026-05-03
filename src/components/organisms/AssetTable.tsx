import React, { useState, useMemo } from 'react';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Download, Filter, Plus, Trash2, Search,
} from 'lucide-react';
import type { TableRowData } from '../molecules/TableRow';
import { TableRow } from '../molecules/TableRow';
import Button from '../atoms/Button';
import type { StatusType } from '../atoms/StatusChip';

const MOCK_DATA: TableRowData[] = [
  { id: '1',  assetCode: 'MB-001', assetName: 'Máy tính Dell Latitude 5540', category: 'Máy tính', location: 'Phòng KH-01', assignedTo: 'Nguyễn Văn A', status: 'active',      purchaseDate: '12/03/2023', value: '28.500.000 ₫' },
  { id: '2',  assetCode: 'MB-002', assetName: 'Máy tính HP ProBook 450', category: 'Máy tính', location: 'Phòng KT-02', assignedTo: 'Trần Thị B',   status: 'maintenance', purchaseDate: '05/07/2022', value: '22.000.000 ₫', attention: true },
  { id: '3',  assetCode: 'MN-001', assetName: 'Màn hình LG 27" 4K',         category: 'Màn hình',  location: 'Phòng IT-01', assignedTo: 'Lê Minh C',    status: 'active',      purchaseDate: '18/01/2024', value: '12.000.000 ₫' },
  { id: '4',  assetCode: 'MF-003', assetName: 'Máy fax Canon L170',          category: 'Thiết bị',  location: 'Văn phòng',   assignedTo: 'Phạm Thu D',   status: 'inactive',    purchaseDate: '22/09/2020', value: '3.200.000 ₫'  },
  { id: '5',  assetCode: 'XM-001', assetName: 'Xe máy Honda Wave RSX',       category: 'Phương tiện', location: 'Bãi xe',    assignedTo: 'Hoàng Văn E',  status: 'active',      purchaseDate: '30/04/2021', value: '45.000.000 ₫' },
  { id: '6',  assetCode: 'MB-003', assetName: 'MacBook Air M2 13"',          category: 'Máy tính', location: 'BGĐ',         assignedTo: 'Vũ Thị F',     status: 'active',      purchaseDate: '10/08/2023', value: '32.000.000 ₫' },
  { id: '7',  assetCode: 'MF-004', assetName: 'Máy chiếu Epson EB-S41',      category: 'Thiết bị',  location: 'Phòng họp A', assignedTo: 'Đỗ Thành G',  status: 'pending',     purchaseDate: '15/11/2023', value: '9.800.000 ₫', attention: true },
  { id: '8',  assetCode: 'IN-001', assetName: 'Máy in HP LaserJet Pro',       category: 'Thiết bị',  location: 'Phòng KT-02', assignedTo: 'Ngô Bảo H',   status: 'maintenance', purchaseDate: '02/06/2022', value: '6.500.000 ₫'  },
  { id: '9',  assetCode: 'XO-001', assetName: 'Xe ô tô Toyota Innova 2.0',   category: 'Phương tiện', location: 'Bãi xe',    assignedTo: 'Đặng Hữu I',  status: 'active',      purchaseDate: '17/03/2019', value: '680.000.000 ₫' },
  { id: '10', assetCode: 'MB-004', assetName: 'Máy tính Lenovo ThinkPad X1',  category: 'Máy tính', location: 'Phòng IT-02', assignedTo: 'Bùi Lan J',    status: 'active',      purchaseDate: '28/02/2024', value: '36.000.000 ₫' },
];

type SortKey = keyof TableRowData | null;
type SortDir = 'asc' | 'desc';

const COLUMNS = [
  { key: 'assetCode',    label: 'Mã TS',      sortable: true },
  { key: 'assetName',    label: 'Tên tài sản', sortable: true },
  { key: 'category',     label: 'Danh mục',   sortable: true },
  { key: 'location',     label: 'Vị trí',      sortable: true },
  { key: 'assignedTo',   label: 'Phụ trách',  sortable: true },
  { key: 'status',       label: 'Trạng thái', sortable: false },
  { key: 'purchaseDate', label: 'Ngày mua',   sortable: true },
  { key: 'value',        label: 'Giá trị',     sortable: false },
] as const;

const STATUS_LABELS: Record<StatusType, string> = {
  active: 'Hoạt động',
  maintenance: 'Bảo trì',
  pending: 'Chờ duyệt',
  inactive: 'Ngừng dùng',
};

interface AssetTableProps {
  onAddAsset?: () => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({ onAddAsset }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredData = useMemo(() => {
    let data = [...MOCK_DATA];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.assetCode.toLowerCase().includes(q) ||
          r.assetName.toLowerCase().includes(q) ||
          r.assignedTo.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      data = data.filter((r) => r.status === filterStatus);
    }
    if (sortKey) {
      data.sort((a, b) => {
        const aVal = a[sortKey] ?? '';
        const bVal = b[sortKey] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal), 'vi');
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [search, filterStatus, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const pageData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const allSelected = pageData.length > 0 && pageData.every((r) => selected.has(r.id));
  const someSelected = pageData.some((r) => selected.has(r.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageData.forEach((r) => next.delete(r.id));
      } else {
        pageData.forEach((r) => next.add(r.id));
      }
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
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-[#26a69a]" />
      : <ChevronDown size={12} className="text-[#26a69a]" />;
  };

  return (
    <div
      className="bg-white rounded-lg border border-[#e1e3e4] overflow-hidden flex flex-col"
      style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-[#e1e3e4]">
        {/* Search */}
        <div className="relative flex items-center flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 text-[#74777d] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm kiếm..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#c4c6cd] rounded bg-[#f3f4f5] focus:bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-[#74777d]" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as StatusType | 'all'); setCurrentPage(1); }}
            className="text-sm border border-[#c4c6cd] rounded px-2 py-1.5 bg-white text-[#191c1d] focus:border-[#26a69a] outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            {(Object.entries(STATUS_LABELS) as [StatusType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#74777d]">Đã chọn {selected.size}</span>
            <button className="flex items-center gap-1.5 text-xs text-[#ef5350] hover:bg-[#ef5350]/10 px-2 py-1.5 rounded transition-colors">
              <Trash2 size={13} />
              Xoá
            </button>
          </div>
        )}
        <Button
          variant="secondary"
          size="sm"
          icon={<Download size={14} />}
        >
          Xuất Excel
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={onAddAsset}
        >
          Thêm tài sản
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse" style={{ minWidth: '900px' }}>
          <thead className="sticky top-0 z-10">
            <tr
              className="border-b border-[#e1e3e4]"
              style={{ backgroundColor: '#f3f4f5' }}
            >
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
                  className={`px-3 py-3 text-[11px] font-semibold text-[#44474c] uppercase tracking-wider whitespace-nowrap
                    ${col.sortable ? 'cursor-pointer hover:text-[#191c1d] select-none' : ''}
                    ${col.key === 'value' ? 'text-right' : ''}
                  `}
                  onClick={() => col.sortable && handleSort(col.key as SortKey)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon column={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-sm text-[#74777d]">
                  Không tìm thấy tài sản nào
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <TableRow
                  key={row.id}
                  row={row}
                  selected={selected.has(row.id)}
                  onSelect={toggleSelect}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#e1e3e4] bg-[#f8f9fa]">
        <span className="text-xs text-[#74777d]">
          Hiển thị {Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)}–{Math.min(currentPage * rowsPerPage, filteredData.length)} / {filteredData.length} tài sản
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 rounded flex items-center justify-center text-[#44474c] hover:bg-[#e1e3e4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-7 h-7 rounded text-xs flex items-center justify-center transition-colors
                ${p === currentPage
                  ? 'bg-[#002957] text-white font-semibold'
                  : 'text-[#44474c] hover:bg-[#e1e3e4]'
                }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-7 h-7 rounded flex items-center justify-center text-[#44474c] hover:bg-[#e1e3e4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetTable;
