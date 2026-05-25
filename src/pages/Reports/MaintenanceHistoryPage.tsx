import React, { useEffect, useState, useCallback } from 'react';
import { Wrench, Download, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../../services/apiClient';

/* ── Types ── */
interface RepairItem {
  id:          number;
  assetCode:   string;
  assetName:   string;
  roomName:    string;
  building:    string;
  khoaId:      number | null;
  khoaName:    string;
  date:        string;
  cost:        number;
  description: string | null;
  ktvId:       number | null;
  ktvName:     string;
  result:      number;
  resultLabel: string;
}

interface Summary {
  total:       number;
  totalCost:   number;
  done:        number;
  failed:      number;
  needReplace: number;
  highestCost: { code: string; name: string; cost: number } | null;
  topKTV:      { name: string; count: number } | null;
}

interface PageData {
  items:      RepairItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  summary:    Summary;
  filters:    { from: string; to: string };
}

interface Dept   { id: number; name: string; }
interface KtvOpt { id: number; name: string; }

/* ── Helpers ── */
const RESULT_CONFIG: Record<number, { label: string; color: string; bg: string; icon: string }> = {
  1: { label: 'Đã sửa xong',      color: '#15803d', bg: '#dcfce7', icon: '✅' },
  2: { label: 'Không sửa được',   color: '#dc2626', bg: '#fee2e2', icon: '❌' },
  3: { label: 'Cần thay thế',     color: '#b45309', bg: '#fef3c7', icon: '⚠' },
};

function fmtCurrency(n: number) {
  if (!n) return '0 ₫';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ ₫`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)} tr ₫`;
  return n.toLocaleString('vi-VN') + ' ₫';
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ── Export CSV ── */
function exportCSV(items: RepairItem[], from: string, to: string) {
  const headers = [
    'STT', 'Mã quản lý', 'Tên tài sản', 'Phòng', 'Tòa nhà', 'Khoa',
    'Ngày sửa', 'Mô tả công việc', 'Chi phí (VNĐ)', 'KTV thực hiện', 'Kết quả',
  ];

  const data = items.map((r, i) => [
    i + 1,
    r.assetCode, r.assetName, r.roomName, r.building, r.khoaName,
    fmtDate(r.date), r.description ?? '', r.cost,
    r.ktvName, r.resultLabel,
  ]);

  const totalCost = items.reduce((s, r) => s + r.cost, 0);
  data.push(['', '', 'TỔNG CỘNG', '', '', '', '', '', totalCost, '', '']);

  const csv = [headers, ...data]
    .map(row =>
      row.map(cell => {
        const s = String(cell ?? '').replace(/"/g, '""');
        return /[,\n"]/.test(s) ? `"${s}"` : s;
      }).join(',')
    ).join('\n');

  const BOM  = '﻿';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `LichSuSuaChua_${from}_den_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Today / year-start defaults ── */
function isoToday() { return new Date().toISOString().slice(0, 10); }
function isoYearStart() { return `${new Date().getFullYear()}-01-01`; }

/* ══════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════ */
const MaintenanceHistoryPage: React.FC = () => {
  const [pageData,     setPageData]     = useState<PageData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const [from,         setFrom]         = useState(isoYearStart());
  const [to,           setTo]           = useState(isoToday());
  const [filterKhoa,   setFilterKhoa]   = useState('');
  const [filterKTV,    setFilterKTV]    = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [page,         setPage]         = useState(1);
  const limit = 20;

  const [depts, setDepts] = useState<Dept[]>([]);
  const [ktvs,  setKtvs]  = useState<KtvOpt[]>([]);

  /* Load khoa + KTV lists once */
  useEffect(() => {
    apiClient.get('/khoa')
      .then(r => setDepts((r.data.data as Dept[]) ?? []))
      .catch(() => {});
    apiClient.get('/users', { params: { VaiTro: 'KyThuat', limit: 100 } })
      .then(r => setKtvs(((r.data.data?.items ?? []) as { id: number; fullName: string }[]).map(u => ({ id: u.id, name: u.fullName }))))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: Record<string, unknown> = { from, to, page, limit };
    if (filterKhoa)   params.MaKhoa  = filterKhoa;
    if (filterKTV)    params.MaKTV   = filterKTV;
    if (filterResult) params.KetQua  = filterResult;

    apiClient.get('/admin/stats/repair-history', { params })
      .then(r => setPageData(r.data.data as PageData))
      .catch(e => setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, [from, to, filterKhoa, filterKTV, filterResult, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Reset page khi đổi filter */
  const applyFilter = (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

  const items   = pageData?.items   ?? [];
  const summary = pageData?.summary;
  const pag     = pageData?.pagination;

  /* ── Pagination buttons ── */
  const totalPages  = pag?.totalPages ?? 1;
  const pageButtons: (number | '…')[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const around = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages));
    const sorted = Array.from(around).sort((a, b) => a - b);
    const result: (number | '…')[] = [];
    sorted.forEach((p, i) => { if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push('…'); result.push(p); });
    return result;
  })();

  const inputCls = 'px-3 py-1.5 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#26a69a] outline-none';

  return (
    <div className="flex-1 p-8 flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(38,166,154,0.1)' }}>
            <Wrench size={20} className="text-[#26a69a]" />
          </div>
          <div>
            <h1 className="font-manrope font-bold text-xl text-[#191c1d]">Lịch sử Sửa chữa</h1>
            <p className="text-xs text-[#74777d]">
              {summary ? `${summary.total} lần · ${fmtCurrency(summary.totalCost)}` : 'Đang tải...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#44474c] border border-[#c4c6cd] hover:bg-[#f3f4f5] transition-colors">
            <RefreshCw size={14} />
            Làm mới
          </button>
          <button
            onClick={() => items.length > 0 && exportCSV(items, from, to)}
            disabled={items.length === 0 || loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#26a69a' }}
          >
            <Download size={14} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl px-5 py-4 flex flex-wrap gap-3 items-end" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#44474c]">Từ ngày</span>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#44474c]">Đến ngày</span>
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#44474c]">Khoa</span>
          <select value={filterKhoa} onChange={e => applyFilter(setFilterKhoa)(e.target.value)} className={inputCls}>
            <option value="">Tất cả khoa</option>
            {depts.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#44474c]">KTV</span>
          <select value={filterKTV} onChange={e => applyFilter(setFilterKTV)(e.target.value)} className={inputCls}>
            <option value="">Tất cả KTV</option>
            {ktvs.map(k => <option key={k.id} value={String(k.id)}>{k.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#44474c]">Kết quả</span>
          <select value={filterResult} onChange={e => applyFilter(setFilterResult)(e.target.value)} className={inputCls}>
            <option value="">Tất cả</option>
            <option value="1">✅ Đã sửa xong</option>
            <option value="2">❌ Không sửa được</option>
            <option value="3">⚠ Cần thay thế</option>
          </select>
        </div>
      </div>

      {/* ── Summary cards ── */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tất cả',          value: summary.total,       color: '#44474c', bg: '#f3f4f5'  },
            { label: 'Đã sửa xong',     value: summary.done,        color: '#15803d', bg: '#dcfce7'  },
            { label: 'Không sửa được',  value: summary.failed,      color: '#dc2626', bg: '#fee2e2'  },
            { label: 'Cần thay thế',    value: summary.needReplace, color: '#b45309', bg: '#fef3c7'  },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <span className="text-sm text-[#44474c]">{c.label}</span>
              <span className="text-xl font-bold px-2 py-0.5 rounded-lg" style={{ color: c.color, backgroundColor: c.bg }}>{c.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        {/* Toolbar */}
        <div className="px-5 py-3.5 border-b border-[#f3f4f5] flex items-center">
          <span className="text-sm font-semibold text-[#191c1d]">Danh sách lần sửa chữa</span>
          <span className="ml-auto text-xs text-[#74777d]">{pag?.total ?? 0} bản ghi</span>
        </div>

        {/* Content */}
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-4 px-5 py-3 border-b border-[#f3f4f5] animate-pulse">
                {Array.from({ length: 8 }).map((__, j) => (
                  <div key={j} className="h-3 bg-[#e1e3e4] rounded" />
                ))}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertTriangle size={32} className="text-red-400" />
            <p className="text-sm text-[#74777d]">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 text-sm font-semibold text-white rounded-lg" style={{ backgroundColor: '#26a69a' }}>
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '900px' }}>
              <thead>
                <tr className="border-b border-[#00695c] text-xs font-semibold text-white uppercase tracking-wide" style={{ backgroundColor: '#00796b' }}>
                  <th className="px-4 py-3 text-center w-10">#</th>
                  <th className="px-4 py-3 text-left">Tài sản</th>
                  <th className="px-4 py-3 text-left">Phòng</th>
                  <th className="px-4 py-3 text-left">Khoa</th>
                  <th className="px-4 py-3 text-center">Ngày sửa</th>
                  <th className="px-4 py-3 text-right">Chi phí</th>
                  <th className="px-4 py-3 text-left">KTV</th>
                  <th className="px-4 py-3 text-center">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-sm text-[#74777d]">Không có dữ liệu trong khoảng thời gian đã chọn</td></tr>
                ) : items.map((r, i) => {
                  const rc = RESULT_CONFIG[r.result] ?? { label: r.resultLabel, color: '#44474c', bg: '#f3f4f5', icon: '' };
                  return (
                    <tr key={r.id} className="border-b border-[#f3f4f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-4 py-3 text-center text-xs text-[#74777d]">
                        {(page - 1) * limit + i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-[#f3f4f5] text-[#44474c]">
                            {r.assetCode}
                          </span>
                          <span className="font-medium text-[#191c1d] max-w-[150px] truncate">{r.assetName}</span>
                        </div>
                        {r.description && (
                          <p className="text-xs text-[#74777d] mt-0.5 max-w-[220px] truncate">{r.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#44474c] whitespace-nowrap">
                        {r.roomName}
                        {r.building && r.building !== '—' && (
                          <span className="block text-xs text-[#74777d]">{r.building}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#44474c] whitespace-nowrap">{r.khoaName}</td>
                      <td className="px-4 py-3 text-center text-sm text-[#44474c] whitespace-nowrap">{fmtDate(r.date)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-[#191c1d] whitespace-nowrap">
                        {r.cost > 0 ? fmtCurrency(r.cost) : <span className="text-[#c4c6cd]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#44474c] whitespace-nowrap">{r.ktvName}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                          style={{ backgroundColor: rc.bg, color: rc.color }}
                        >
                          {rc.icon} {rc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {(pag?.totalPages ?? 1) > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#f3f4f5] bg-[#f8f9fa]">
            <span className="text-xs text-[#74777d]">
              Hiển thị {Math.min((page - 1) * limit + 1, pag?.total ?? 0)}–{Math.min(page * limit, pag?.total ?? 0)} / {pag?.total ?? 0}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded flex items-center justify-center text-[#44474c] hover:bg-[#e1e3e4] disabled:opacity-40 transition-colors">
                <ChevronLeft size={14} />
              </button>
              {pageButtons.map((p, i) =>
                p === '…' ? (
                  <span key={`e-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-[#74777d]">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`w-7 h-7 rounded text-xs flex items-center justify-center transition-colors ${p === page ? 'text-white font-semibold' : 'text-[#44474c] hover:bg-[#e1e3e4]'}`}
                    style={p === page ? { backgroundColor: '#26a69a' } : {}}
                  >{p}</button>
                )
              )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-7 h-7 rounded flex items-center justify-center text-[#44474c] hover:bg-[#e1e3e4] disabled:opacity-40 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Summary footer ── */}
      {summary && !loading && (
        <div className="bg-white rounded-xl px-6 py-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-bold text-[#191c1d] mb-4 pb-2 border-b border-[#f3f4f5]">
            TỔNG KẾT KỲ BÁO CÁO
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#74777d]">Tổng lần sửa chữa</p>
              <p className="text-lg font-bold text-[#191c1d]">{summary.total}</p>
            </div>
            <div>
              <p className="text-xs text-[#74777d]">Tổng chi phí</p>
              <p className="text-lg font-bold text-[#191c1d]">{fmtCurrency(summary.totalCost)}</p>
            </div>
            <div>
              <p className="text-xs text-[#74777d]">Sửa thành công</p>
              <p className="text-lg font-bold text-[#15803d]">
                {summary.done}
                {summary.total > 0 && (
                  <span className="text-sm font-normal text-[#74777d] ml-1.5">
                    ({Math.round((summary.done / summary.total) * 100)}%)
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#74777d]">Không sửa được</p>
              <p className="text-lg font-bold text-[#dc2626]">
                {summary.failed}
                {summary.total > 0 && (
                  <span className="text-sm font-normal text-[#74777d] ml-1.5">
                    ({Math.round((summary.failed / summary.total) * 100)}%)
                  </span>
                )}
              </p>
            </div>
            {summary.highestCost && (
              <div>
                <p className="text-xs text-[#74777d]">Chi phí cao nhất</p>
                <p className="text-sm font-semibold text-[#191c1d]">
                  <span className="font-mono text-xs bg-[#f3f4f5] px-1 rounded mr-1">{summary.highestCost.code}</span>
                  {fmtCurrency(summary.highestCost.cost)}
                </p>
              </div>
            )}
            {summary.topKTV && (
              <div>
                <p className="text-xs text-[#74777d]">KTV nhiều nhất</p>
                <p className="text-sm font-semibold text-[#191c1d]">
                  {summary.topKTV.name}
                  <span className="text-xs font-normal text-[#74777d] ml-1">— {summary.topKTV.count} lần</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceHistoryPage;
