import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Search, RefreshCw, TrendingDown, PackageX, CheckCircle2, Clock, XCircle } from 'lucide-react';
import api from '../../services/apiClient';

/* ── Types ── */
interface LiquidationItem {
  id:             number;
  assetCode:      string;
  assetName:      string;
  category:       string;
  roomName:       string;
  building:       string;
  department:     string;
  reason:         string;
  status:         number;
  statusLabel:    string;
  receivedDate:   string;
  liquidatedDate: string | null;
  salePrice:      number;
  note:           string | null;
  createdBy:      string;
  approvedBy:     string | null;
}

interface Summary {
  total:          number;
  tongGiaThanhLy: number;
}

/* ── Helpers ── */
function fmt(d: string | null) {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('vi-VN');
}
function fmtMoney(n: number) {
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

const STATUS_STYLE: Record<number, { bg: string; text: string; dot: string; Icon: React.ElementType }> = {
  1: { bg: 'rgba(255,202,40,0.15)', text: '#b8860b', dot: '#ffca28', Icon: Clock          },
  2: { bg: 'rgba(38,166,154,0.12)', text: '#1b8a80', dot: '#26a69a', Icon: CheckCircle2   },
  3: { bg: 'rgba(239,83,80,0.12)',  text: '#c62828', dot: '#ef5350', Icon: XCircle        },
};

/* ══════════════════════════════════════════════════ */
const LiquidatedDevicePage: React.FC = () => {
  const [items,      setItems]      = useState<LiquidationItem[]>([]);
  const [summary,    setSummary]    = useState<Summary>({ total: 0, tongGiaThanhLy: 0 });
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  /* filters */
  const [keyword,    setKeyword]    = useState('');
  const [statusF,    setStatusF]    = useState('2');
  const [from,       setFrom]       = useState('');
  const [to,         setTo]         = useState('');
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (statusF) params.set('TrangThai', statusF);
      if (from)    params.set('from', from);
      if (to)      params.set('to', to);
      params.set('page', String(page));
      params.set('limit', String(LIMIT));

      const res = await api.get(`/admin/thanh-ly?${params}`);
      const d   = res.data.data;
      setItems(d.items);
      setSummary(d.summary);
      setTotal(d.pagination.total);
      setTotalPages(d.pagination.totalPages);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, statusF, from, to, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData(); };

  return (
    <div className="p-8 flex flex-col gap-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#b71c1c,#e53935)' }}>
            <Trash2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Thiết bị thanh lý
            </h1>
            <p className="text-sm text-[#74777d]">Lịch sử bán / thanh lý tài sản hỏng, lỗi thời</p>
          </div>
        </div>
        <button
          onClick={() => fetchData()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-[#c4c6cd] text-[#44474c] bg-white hover:bg-[#f3f4f5] transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Tổng lượt thanh lý', value: summary.total.toString(), Icon: PackageX,    color: '#b71c1c', bg: '#ffebee' },
          { label: 'Tổng tiền thu về',   value: fmtMoney(summary.tongGiaThanhLy), Icon: TrendingDown, color: '#1b8a80', bg: '#e0f2f1' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-[#e1e3e4] px-5 py-4 flex items-center gap-4"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-[#74777d]">{label}</p>
              <p className="text-lg font-bold text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <form onSubmit={handleSearch}
        className="bg-white rounded-xl border border-[#e1e3e4] px-5 py-4 flex flex-wrap gap-3 items-end"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {/* Keyword */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-[#44474c]">Tìm kiếm</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d]" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Tên thiết bị, mã quản lý..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#c4c6cd] rounded-lg focus:border-[#b71c1c] focus:ring-1 focus:ring-[#b71c1c] outline-none"
            />
          </div>
        </div>
        {/* Status */}
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-xs font-semibold text-[#44474c]">Trạng thái</label>
          <select
            value={statusF}
            onChange={e => { setStatusF(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#b71c1c] outline-none"
          >
            <option value="all">Tất cả lịch sử</option>
            <option value="2">Đã thanh lý</option>
            <option value="3">Đã hủy</option>
          </select>
        </div>
        {/* Date range */}
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs font-semibold text-[#44474c]">Từ ngày</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg focus:border-[#b71c1c] outline-none" />
        </div>
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs font-semibold text-[#44474c]">Đến ngày</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg focus:border-[#b71c1c] outline-none" />
        </div>
        <button type="submit"
          className="px-5 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#b71c1c' }}>
          Lọc
        </button>
      </form>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-[#e1e3e4] overflow-hidden"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-3 border-b border-[#f0f2f5] flex items-center gap-2"
          style={{ backgroundColor: '#fafbff' }}>
          <Trash2 size={14} style={{ color: '#b71c1c' }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#b71c1c' }}>
            Danh sách thiết bị thanh lý
          </span>
          <span className="ml-auto text-xs text-[#74777d]">{total} bản ghi</span>
        </div>

        {error && (
          <div className="p-6 text-center text-sm text-[#c62828]">{error}</div>
        )}

        {isLoading ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#b71c1c]" />
            <p className="text-sm text-[#74777d]">Đang tải dữ liệu...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <PackageX size={36} className="mx-auto mb-3 text-[#c4c6cd]" />
            <p className="text-sm text-[#74777d]">Chưa có bản ghi thanh lý nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '900px' }}>
              <thead>
                <tr className="border-b border-[#e1e3e4] bg-[#fafbff]">
                  {['Thiết bị', 'Loại', 'Vị trí', 'Trạng thái', 'Ngày nhập kho', 'Ngày thanh lý', 'Giá bán', 'Người lập'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#74777d]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const ss = STATUS_STYLE[item.status] ?? STATUS_STYLE[1];
                  const StatusIcon = ss.Icon;
                  return (
                    <tr key={item.id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafbff] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#191c1d] truncate max-w-[180px]">{item.assetName}</p>
                        <p className="text-[11px] font-mono text-[#74777d]">{item.assetCode}</p>
                      </td>
                      <td className="px-4 py-3 text-[#44474c] text-xs">{item.category}</td>
                      <td className="px-4 py-3">
                        <p className="text-[#44474c] text-xs">{item.roomName}</p>
                        <p className="text-[11px] text-[#74777d]">{item.building}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: ss.bg, color: ss.text }}>
                          <StatusIcon size={11} />
                          {item.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#44474c] text-xs whitespace-nowrap">{fmt(item.receivedDate)}</td>
                      <td className="px-4 py-3 text-[#44474c] text-xs whitespace-nowrap">{fmt(item.liquidatedDate)}</td>
                      <td className="px-4 py-3 font-semibold text-[#1b8a80] whitespace-nowrap text-xs">
                        {item.salePrice > 0 ? fmtMoney(item.salePrice) : '—'}
                      </td>
                      <td className="px-4 py-3 text-[#44474c] text-xs">{item.createdBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#f0f2f5] flex items-center justify-between">
            <span className="text-xs text-[#74777d]">
              Trang {page} / {totalPages} ({total} bản ghi)
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded border border-[#c4c6cd] disabled:opacity-40 hover:bg-[#f3f4f5] transition-colors">
                ‹ Trước
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded border border-[#c4c6cd] disabled:opacity-40 hover:bg-[#f3f4f5] transition-colors">
                Sau ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidatedDevicePage;
