import React, { useEffect, useState, useCallback } from 'react';
import { Building2, Download, RefreshCw, AlertTriangle, ChevronDown } from 'lucide-react';
import apiClient from '../../services/apiClient';

/* ── Types ── */
interface RoomRow {
  khoaId:     number;
  khoaName:   string;
  building:   string;
  roomName:   string;
  roomType:   string | null;
  assetCount: number;
  totalValue: number;
}

interface StatsData {
  summary: { assetCount: number; totalValue: number };
  byRoom:  RoomRow[];
}

interface Dept { id: number; name: string; }

/* ── Helpers ── */
const ROOM_TYPE_LABEL: Record<string, string> = {
  PhongMay:  'Phòng máy',
  PhongHoc:  'Phòng học',
  VanPhong:  'Văn phòng',
  Kho:       'Kho',
  Xuong:     'Xưởng',
};

function roomTypeLabel(t: string | null) {
  if (!t) return '—';
  return ROOM_TYPE_LABEL[t] ?? t;
}

function fmtCurrency(n: number) {
  if (!n) return '0 ₫';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ ₫`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(0)} tr ₫`;
  return n.toLocaleString('vi-VN') + ' ₫';
}

/* ── Export CSV ── */
function exportCSV(rows: RoomRow[], khoaName: string) {
  const headers = ['Khoa', 'Tòa nhà', 'Phòng', 'Loại phòng', 'Số tài sản', 'Tổng giá trị (VNĐ)'];

  const data = rows.map(r => [
    r.khoaName, r.building, r.roomName, roomTypeLabel(r.roomType),
    r.assetCount, r.totalValue,
  ]);

  data.push([
    'TỔNG CỘNG', '', '', '',
    rows.reduce((s, r) => s + r.assetCount, 0),
    rows.reduce((s, r) => s + r.totalValue, 0),
  ]);

  const csv = [headers, ...data]
    .map(row =>
      row.map(cell => {
        const s = String(cell ?? '').replace(/"/g, '""');
        return /[,\n"]/.test(s) ? `"${s}"` : s;
      }).join(',')
    )
    .join('\n');

  const now    = new Date();
  const suffix = `${String(now.getMonth() + 1).padStart(2, '0')}_${now.getFullYear()}`;
  const slug   = khoaName.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_');

  const BOM  = '﻿';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `ThongKe_${slug}_${suffix}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════ */
const StatByDepartmentPage: React.FC = () => {
  const [depts,      setDepts]      = useState<Dept[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');   // '' = tất cả
  const [data,       setData]       = useState<StatsData | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  /* Load khoa list once */
  useEffect(() => {
    apiClient.get('/khoa')
      .then(r => setDepts((r.data.data as Dept[]) ?? []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = selectedId ? { MaKhoa: selectedId } : {};
    apiClient.get('/admin/stats/by-department', { params })
      .then(r => setData(r.data.data as StatsData))
      .catch(e => setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Selected department name */
  const selectedDept = depts.find(d => String(d.id) === selectedId);
  const exportLabel  = selectedDept?.name ?? 'TatCaKhoa';
  const rows         = data?.byRoom ?? [];

  /* Totals */
  const totals = {
    assetCount: rows.reduce((s, r) => s + r.assetCount, 0),
    totalValue: rows.reduce((s, r) => s + r.totalValue, 0),
  };

  return (
    <div className="flex-1 p-8 flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(38,166,154,0.1)' }}
          >
            <Building2 size={20} className="text-[#26a69a]" />
          </div>
          <div>
            <h1 className="font-manrope font-bold text-xl text-[#191c1d]">
              Thống kê theo Khoa / Bộ môn
            </h1>
            <p className="text-xs text-[#74777d]">
              {data
                ? `${totals.assetCount.toLocaleString('vi-VN')} tài sản · ${fmtCurrency(totals.totalValue)}`
                : 'Chọn khoa để xem thống kê'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Khoa selector */}
          <div className="relative">
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="pl-3 pr-8 py-2 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#26a69a] outline-none appearance-none cursor-pointer"
            >
              <option value="">Tất cả khoa</option>
              {depts.map(d => (
                <option key={d.id} value={String(d.id)}>{d.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#74777d] pointer-events-none" />
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#44474c] border border-[#c4c6cd] hover:bg-[#f3f4f5] transition-colors"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>

          <button
            onClick={() => rows.length > 0 && exportCSV(rows, exportLabel)}
            disabled={rows.length === 0 || loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#26a69a' }}
          >
            <Download size={14} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div
        className="bg-white rounded-xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
      >
        {/* Toolbar */}
        <div className="px-5 py-3.5 border-b border-[#f3f4f5] flex items-center gap-2">
          <span className="text-sm font-semibold text-[#191c1d]">
            {selectedDept ? `Khoa ${selectedDept.name}` : 'Tất cả khoa'}
          </span>
          <span className="text-xs text-[#74777d] ml-auto">{rows.length} phòng</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 px-5 py-3 border-b border-[#f3f4f5] animate-pulse">
                {Array.from({ length: 6 }).map((__, j) => (
                  <div key={j} className="h-3 bg-[#e1e3e4] rounded" />
                ))}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertTriangle size={32} className="text-red-400" />
            <p className="text-sm text-[#74777d]">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
              style={{ backgroundColor: '#26a69a' }}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8f9fa] text-xs font-semibold text-[#44474c] uppercase tracking-wide border-b border-[#e1e3e4]">
                  {!selectedId && <th className="px-4 py-3 text-left">Khoa</th>}
                  <th className="px-4 py-3 text-left">Tòa nhà</th>
                  <th className="px-4 py-3 text-left">Phòng</th>
                  <th className="px-4 py-3 text-left">Loại phòng</th>
                  <th className="px-4 py-3 text-center">Số tài sản</th>
                  <th className="px-4 py-3 text-right">Tổng giá trị</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={selectedId ? 5 : 6} className="py-16 text-center text-sm text-[#74777d]">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : rows.map((r, i) => {
                  /* Group divider khi đổi khoa (chỉ khi xem tất cả) */
                  const prevKhoa  = i > 0 ? rows[i - 1].khoaName : null;
                  const isNewKhoa = !selectedId && r.khoaName !== prevKhoa;

                  return (
                    <React.Fragment key={`${r.khoaId}-${r.roomName}`}>
                      {isNewKhoa && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-2 text-xs font-bold text-[#26a69a] uppercase tracking-wide"
                            style={{ backgroundColor: 'rgba(38,166,154,0.04)', borderTop: '1px solid rgba(38,166,154,0.15)', borderBottom: '1px solid rgba(38,166,154,0.15)' }}
                          >
                            {r.khoaName}
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-[#f3f4f5] hover:bg-[#fafafa] transition-colors">
                        {!selectedId && (
                          <td className="px-4 py-3 text-sm text-[#44474c]">{r.khoaName}</td>
                        )}
                        <td className="px-4 py-3 text-sm text-[#44474c] whitespace-nowrap">{r.building}</td>
                        <td className="px-4 py-3 font-medium text-[#191c1d] whitespace-nowrap">{r.roomName}</td>
                        <td className="px-4 py-3 text-sm text-[#44474c]">
                          {r.roomType ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-[#f3f4f5] text-[#44474c]">
                              {roomTypeLabel(r.roomType)}
                            </span>
                          ) : <span className="text-[#c4c6cd]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-[#191c1d]">{r.assetCount}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-[#44474c]">
                          {fmtCurrency(r.totalValue)}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>

              {rows.length > 0 && (
                <tfoot>
                  <tr
                    className="text-sm font-bold text-[#191c1d] border-t-2 border-[#c4c6cd]"
                    style={{ backgroundColor: 'rgba(38,166,154,0.05)' }}
                  >
                    <td
                      className="px-4 py-3 text-xs text-[#74777d]"
                      colSpan={selectedId ? 3 : 4}
                    >
                      Tổng cộng
                    </td>
                    <td className="px-4 py-3 text-center">{totals.assetCount}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {fmtCurrency(totals.totalValue)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatByDepartmentPage;
