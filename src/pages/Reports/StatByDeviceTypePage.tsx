import React, { useEffect, useState } from 'react';
import { BarChart3, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import apiClient from '../../services/apiClient';

/* ── Types ── */
interface CategoryRow {
  id:                 number;
  name:               string;
  group:              string;
  code:               string | null;
  total:              number;
  active:             number;
  broken:             number;
  underRepair:        number;
  pendingLiquidation: number;
  totalValue:         number;
}

interface StatsData {
  summary:    { total: number; active: number; broken: number; underRepair: number; pendingLiquidation: number; totalValue: number };
  byGroup:    unknown[];
  byCategory: CategoryRow[];
}

/* ── Helpers ── */
const GROUP_LABEL: Record<string, string> = {
  MayTinh:     'Máy tính',
  ManHinh:     'Màn hình',
  MayIn:       'Máy in',
  ThietBiMang: 'Thiết bị mạng',
  DienTu:      'Điện tử',
  Khac:        'Khác',
};

const GROUP_COLOR: Record<string, string> = {
  MayTinh:     '#26a69a',
  ManHinh:     '#3b82f6',
  MayIn:       '#f59e0b',
  ThietBiMang: '#8b5cf6',
  DienTu:      '#ec4899',
  Khac:        '#94a3b8',
};

function groupLabel(g: string)  { return GROUP_LABEL[g]  ?? g; }
function groupColor(g: string)  { return GROUP_COLOR[g]  ?? '#94a3b8'; }

function fmtCurrency(n: number) {
  if (!n) return '0 ₫';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ ₫`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(0)} tr ₫`;
  return n.toLocaleString('vi-VN') + ' ₫';
}

function pct(part: number, total: number) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

/* ── Export to CSV (Excel-compatible, UTF-8 BOM) ── */
function exportCSV(rows: CategoryRow[]) {
  const headers = [
    'STT', 'Mã', 'Danh mục', 'Nhóm loại',
    'Tổng', 'Đang dùng', 'Hỏng', 'Đang sửa', 'Chờ thanh lý',
    'Giá trị (VNĐ)',
  ];

  const data = rows.map((c, i) => [
    i + 1,
    c.code ?? '',
    c.name,
    groupLabel(c.group),
    c.total,
    c.active,
    c.broken,
    c.underRepair,
    c.pendingLiquidation,
    c.totalValue,
  ]);

  /* Totals row */
  data.push([
    '', '', 'TỔNG CỘNG', '',
    rows.reduce((s, c) => s + c.total, 0),
    rows.reduce((s, c) => s + c.active, 0),
    rows.reduce((s, c) => s + c.broken, 0),
    rows.reduce((s, c) => s + c.underRepair, 0),
    rows.reduce((s, c) => s + c.pendingLiquidation, 0),
    rows.reduce((s, c) => s + c.totalValue, 0),
  ]);

  const csv = [headers, ...data]
    .map(row =>
      row.map(cell => {
        const s = String(cell ?? '').replace(/"/g, '""');
        return /[,\n"]/.test(s) ? `"${s}"` : s;
      }).join(',')
    )
    .join('\n');

  const BOM  = '﻿';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `thong-ke-loai-thiet-bi-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════ */
const StatByDeviceTypePage: React.FC = () => {
  const [data,      setData]      = useState<StatsData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filterGrp, setFilterGrp] = useState('');

  const fetchData = () => {
    setLoading(true);
    setError(null);
    apiClient.get('/admin/stats/by-type')
      .then(r => setData(r.data.data as StatsData))
      .catch(e => setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="flex-1 p-8 flex flex-col gap-5">
        <div className="h-8 w-72 bg-[#f3f4f5] rounded animate-pulse" />
        <div className="h-12 bg-[#f3f4f5] rounded-xl animate-pulse" />
        <div className="h-96 bg-[#f3f4f5] rounded-xl animate-pulse" />
      </div>
    );
  }

  /* Error */
  if (error || !data) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center gap-4">
        <AlertTriangle size={40} className="text-red-400" />
        <p className="text-[#74777d]">{error ?? 'Không tải được dữ liệu'}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#26a69a' }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { byCategory, summary } = data;
  const groups = Array.from(new Set(byCategory.map(c => c.group)));

  const visible = filterGrp
    ? byCategory.filter(c => c.group === filterGrp)
    : byCategory;

  /* Totals for visible rows */
  const totals = {
    total:              visible.reduce((s, c) => s + c.total, 0),
    active:             visible.reduce((s, c) => s + c.active, 0),
    broken:             visible.reduce((s, c) => s + c.broken, 0),
    underRepair:        visible.reduce((s, c) => s + c.underRepair, 0),
    pendingLiquidation: visible.reduce((s, c) => s + c.pendingLiquidation, 0),
    totalValue:         visible.reduce((s, c) => s + c.totalValue, 0),
  };

  return (
    <div className="flex-1 p-8 flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(38,166,154,0.1)' }}
          >
            <BarChart3 size={20} className="text-[#26a69a]" />
          </div>
          <div>
            <h1 className="font-manrope font-bold text-xl text-[#191c1d]">
              Thống kê theo Loại thiết bị
            </h1>
            <p className="text-xs text-[#74777d]">
              Tổng cộng {summary.total.toLocaleString('vi-VN')} thiết bị &nbsp;·&nbsp;
              Giá trị: {fmtCurrency(summary.totalValue)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#44474c] border border-[#c4c6cd] hover:bg-[#f3f4f5] transition-colors"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
          <button
            onClick={() => exportCSV(visible)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#26a69a' }}
          >
            <Download size={14} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
      >
        {/* Toolbar */}
        <div className="px-5 py-3.5 border-b border-[#f3f4f5] flex items-center gap-3">
          <span className="text-sm font-semibold text-[#191c1d]">
            Chi tiết theo danh mục
          </span>

          {/* Group filter */}
          <select
            value={filterGrp}
            onChange={e => setFilterGrp(e.target.value)}
            className="ml-auto px-3 py-1.5 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#26a69a] outline-none"
          >
            <option value="">Tất cả nhóm</option>
            {groups.map(g => (
              <option key={g} value={g}>{groupLabel(g)}</option>
            ))}
          </select>

          <span className="text-xs text-[#74777d] flex-shrink-0">
            {visible.length} danh mục
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#00695c] text-xs font-semibold text-white uppercase tracking-wide" style={{ backgroundColor: '#00796b' }}>
                <th className="px-4 py-3 text-center w-12">STT</th>
                <th className="px-4 py-3 text-left">Danh mục</th>
                <th className="px-4 py-3 text-left">Nhóm loại</th>
                <th className="px-4 py-3 text-center">Tổng TB</th>
                <th className="px-4 py-3 text-center">Đang dùng</th>
                <th className="px-4 py-3 text-center">Hỏng</th>
                <th className="px-4 py-3 text-center">Đang sửa</th>
                <th className="px-4 py-3 text-center">Chờ TL</th>
                <th className="px-4 py-3 text-right">Giá trị</th>
              </tr>
            </thead>

            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-sm text-[#74777d]">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : visible.map((cat, i) => {
                const color = groupColor(cat.group);

                return (
                  <tr
                    key={cat.id}
                    className="border-b border-[#f3f4f5] hover:bg-[#fafafa] transition-colors"
                  >
                    {/* STT */}
                    <td className="px-4 py-3 text-center text-xs text-[#74777d]">{i + 1}</td>

                    {/* Danh mục */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {cat.code && (
                          <span
                            className="font-mono text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${color}15`, color }}
                          >
                            {cat.code}
                          </span>
                        )}
                        <span className="font-medium text-[#191c1d]">{cat.name}</span>
                      </div>
                    </td>

                    {/* Nhóm */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${color}12`, color }}
                      >
                        {groupLabel(cat.group)}
                      </span>
                    </td>

                    {/* Tổng */}
                    <td className="px-4 py-3 text-center font-bold text-[#191c1d]">
                      {cat.total}
                    </td>

                    {/* Đang dùng */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-[#15803d]">{cat.active}</span>
                    </td>

                    {/* Hỏng */}
                    <td className="px-4 py-3 text-center">
                      {cat.broken > 0
                        ? <span className="font-semibold text-[#b91c1c]">{cat.broken}</span>
                        : <span className="text-[#c4c6cd]">—</span>}
                    </td>

                    {/* Đang sửa */}
                    <td className="px-4 py-3 text-center">
                      {cat.underRepair > 0
                        ? <span className="font-semibold text-[#c2410c]">{cat.underRepair}</span>
                        : <span className="text-[#c4c6cd]">—</span>}
                    </td>

                    {/* Chờ TL */}
                    <td className="px-4 py-3 text-center">
                      {cat.pendingLiquidation > 0
                        ? <span className="font-semibold text-[#92400e]">{cat.pendingLiquidation}</span>
                        : <span className="text-[#c4c6cd]">—</span>}
                    </td>

                    {/* Giá trị */}
                    <td className="px-4 py-3 text-right text-xs text-[#44474c] font-mono">
                      {fmtCurrency(cat.totalValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer totals */}
            {visible.length > 0 && (
              <tfoot>
                <tr
                  className="text-sm font-bold text-[#191c1d] border-t-2 border-[#c4c6cd]"
                  style={{ backgroundColor: 'rgba(38,166,154,0.05)' }}
                >
                  <td className="px-4 py-3 text-center text-xs text-[#74777d]" colSpan={3}>
                    Tổng cộng
                  </td>
                  <td className="px-4 py-3 text-center">{totals.total}</td>
                  <td className="px-4 py-3 text-center text-[#15803d]">{totals.active}</td>
                  <td className="px-4 py-3 text-center text-[#b91c1c]">
                    {totals.broken || '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-[#c2410c]">
                    {totals.underRepair || '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-[#92400e]">
                    {totals.pendingLiquidation || '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-mono">
                    {fmtCurrency(totals.totalValue)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#74777d]">
                      {pct(totals.active, totals.total)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatByDeviceTypePage;
