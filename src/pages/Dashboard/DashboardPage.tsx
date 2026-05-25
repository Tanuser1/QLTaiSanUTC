import React, { useEffect, useState } from 'react';
import {
  Package, CheckCircle2, AlertTriangle, Wrench,
  ClipboardList, FileText, Trash2,
  ChevronRight, BarChart3, PieChart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface SupportRequestItem {
  id: number;
  assetCode: string;
  assetName: string;
  location: string;
  description: string;
  priority: string;
  reporter: string;
  createdAt: string;
}

interface RepairReportItem {
  id: number;
  assetCode: string;
  assetName: string;
  location: string;
  estimatedCost: number;
  technicianName: string;
  createdAt: string;
}

interface DashboardStats {
  assets: {
    total: number;
    active: number;
    broken: number;
    underRepair: number;
    pendingLiquidation: number;
  };
  rooms: { total: number };
  supportRequests: { new: number; inProgress: number };
  repairReports: { pendingApproval: number };
  liquidation: { pending: number };
  recentSupportRequests?: SupportRequestItem[];
  recentRepairReports?: RepairReportItem[];
  assetsByDepartment?: Array<{ code: string; name: string; count: number }>;
  assetsByCategory?: Array<{ group: string; count: number }>;
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(n) + 'đ';

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

const PRIORITY_STYLE: Record<string, string> = {
  'Khẩn cấp':      'bg-red-50 text-red-600 border border-red-200',
  'Rất khẩn cấp':  'bg-red-100 text-red-700 border border-red-300',
  'Thường':         'bg-gray-100 text-gray-500',
};

const GROUP_LABELS: Record<string, string> = {
  'ThietBiDienTu':  'Thiết bị điện tử',
  'MayTinh':        'Máy tính',
  'NgoaiViMayTinh': 'Ngoại vi & Linh kiện',
  'InAnQuet':       'In ấn & Scan',
  'MangVienThong':  'Mạng & Viễn thông',
  'DieuHoaQuat':    'Điều hòa & Quạt',
  'ChieuSang':      'Chiếu sáng',
  'NoiThat':        'Bàn ghế & Nội thất',
  'ThietBiChuyen':  'Thiết bị chuyên ngành',
  'Khac':           'Khác'
};

const CHART_COLORS = ['#0A84FF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#FF2D55', '#30B0C7'];

/* ─────────────────────────────────────────────────────────────
   STAT CARD (Row 1)
───────────────────────────────────────────────────────────── */
interface StatCardProps {
  value: number;
  label: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, sub, icon: Icon, color, loading }) => (
  <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div
      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: `${color}18` }}
    >
      <Icon size={22} style={{ color }} strokeWidth={2} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-2xl font-bold text-[#1C1C1E] leading-none mb-1 font-[Manrope,sans-serif]">
        {loading ? <span className="text-gray-200 animate-pulse">—</span> : value.toLocaleString('vi-VN')}
      </p>
      <p className="text-xs font-bold text-[#1C1C1E] uppercase tracking-widest truncate">{label}</p>
      <p className="text-xs text-[#8E8E93] mt-0.5 truncate">{sub}</p>
    </div>
    <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   PIPELINE CARD (Row 2)
───────────────────────────────────────────────────────────── */
interface PipelineCardProps {
  value: number;
  label: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}

const PipelineCard: React.FC<PipelineCardProps> = ({ value, label, sub, icon: Icon, color, loading }) => (
  <div
    className="rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    style={{ backgroundColor: color }}
  >
    <div className="flex flex-col gap-1">
      <p className="text-3xl font-bold text-white leading-none font-[Manrope,sans-serif]">
        {loading ? '—' : value}
      </p>
      <p className="text-xs font-bold text-white uppercase tracking-wider">{label}</p>
      <p className="text-xs text-white/70">{sub}</p>
    </div>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 flex-shrink-0">
      <Icon size={22} color="white" strokeWidth={2} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   HORIZONTAL BAR CHART
───────────────────────────────────────────────────────────── */
const BarChart: React.FC<{ data: Array<{ code: string; name: string; count: number }> }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  if (!data.length) return <p className="text-sm text-[#8E8E93] text-center py-6">Không có dữ liệu</p>;
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={d.code + i} className="flex items-center gap-3">
          <span className="text-xs text-[#8E8E93] w-14 text-right flex-shrink-0 truncate" title={d.name}>
            {d.code || 'Khác'}
          </span>
          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.count / max) * 100}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
          </div>
          <span className="text-xs font-semibold text-[#1C1C1E] w-6 text-right flex-shrink-0">{d.count}</span>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DONUT CHART (CSS conic-gradient)
───────────────────────────────────────────────────────────── */
const DonutChart: React.FC<{ data: Array<{ group: string; count: number }> }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (!total) return <p className="text-sm text-[#8E8E93] text-center py-6">Không có dữ liệu</p>;

  let angle = 0;
  const segments = data.map((d, i) => {
    const pct = (d.count / total) * 100;
    const start = angle;
    angle += pct;
    return { ...d, pct, start, color: CHART_COLORS[i % CHART_COLORS.length] };
  });

  const gradient = segments
    .map(s => `${s.color} ${s.start.toFixed(2)}% ${(s.start + s.pct).toFixed(2)}%`)
    .join(', ');

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0 w-28 h-28">
        <div
          className="w-28 h-28 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white flex flex-col items-center justify-center shadow-sm">
            <span className="text-lg font-bold text-[#1C1C1E] leading-none">{total}</span>
            <span className="text-[10px] text-[#8E8E93] leading-tight">thiết bị</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {segments.map(s => (
          <div key={s.group} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-[#3C3C43] flex-1 truncate">{GROUP_LABELS[s.group] || s.group}</span>
            <span className="text-xs font-semibold text-[#1C1C1E] flex-shrink-0">{s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SKELETON ROWS (loading state for lists)
───────────────────────────────────────────────────────────── */
const SkeletonRows: React.FC = () => (
  <>
    {[1, 2, 3].map(i => (
      <div key={i} className="px-5 py-3 flex flex-col gap-1.5 animate-pulse">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
      </div>
    ))}
  </>
);

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/admin/dashboard')
      .then(({ data }) => { if (data.success) setStats(data.data); else setError(data.message); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-[#F0F2F5] p-6 flex flex-col gap-6">

      {/* ── ERROR ── */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* ── ROW 1: TỔNG QUAN TÀI SẢN ── */}
      <section>
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-3">
          Tổng quan tài sản
        </p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard value={stats?.assets.total ?? 0}       label="Tổng TB"    sub="toàn trường"  icon={Package}       color="#0A84FF" loading={loading} />
          <StatCard value={stats?.assets.active ?? 0}      label="Đang dùng"  sub="hoạt động"    icon={CheckCircle2}  color="#34C759" loading={loading} />
          <StatCard value={stats?.assets.broken ?? 0}      label="Hư hỏng"    sub="cần xử lý"    icon={AlertTriangle} color="#FF3B30" loading={loading} />
          <StatCard value={stats?.assets.underRepair ?? 0} label="Đang sửa"   sub="đang xử lý"   icon={Wrench}        color="#FF9500" loading={loading} />
        </div>
      </section>

      {/* ── ROW 2: QUY TRÌNH XỬ LÝ ── */}
      <section>
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-3">
          Quy trình xử lý
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PipelineCard
            value={stats?.supportRequests.new ?? 0}
            label="YC chờ tiếp nhận" sub="yêu cầu hỗ trợ mới"
            icon={ClipboardList} color="#FF9500" loading={loading}
          />
          <PipelineCard
            value={stats?.repairReports.pendingApproval ?? 0}
            label="Biên bản chờ duyệt" sub="chờ duyệt kinh phí"
            icon={FileText} color="#5856D6" loading={loading}
          />
          <PipelineCard
            value={stats?.assets.pendingLiquidation ?? 0}
            label="Chờ thanh lý" sub="cần ưu tiên xử lý"
            icon={Trash2} color="#FF3B30" loading={loading}
          />
        </div>
      </section>

      {/* ── ROW 3: DANH SÁCH CẦN XỬ LÝ ── */}
      <section>
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-3">
          Cần xử lý ngay
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Yêu cầu hỗ trợ */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ClipboardList size={15} className="text-[#FF9500]" />
                <h3 className="text-sm font-bold text-[#1C1C1E]">Yêu cầu chờ phân công KTV</h3>
                {!loading && stats?.supportRequests.new !== undefined && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FF9500]/10 text-[#FF9500]">
                    {stats.supportRequests.new}
                  </span>
                )}
              </div>
              <Link to="/requests" className="text-xs text-[#0A84FF] font-medium hover:underline flex items-center gap-0.5">
                Xem tất cả <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? <SkeletonRows /> : !stats?.recentSupportRequests?.length ? (
                <p className="px-5 py-8 text-center text-sm text-[#8E8E93]">Không có yêu cầu nào</p>
              ) : stats.recentSupportRequests.map(r => (
                <div key={r.id} className="px-5 py-3.5 hover:bg-gray-50/70 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1C1C1E] truncate">
                        #{r.id} · {r.assetName}
                      </p>
                      <p className="text-xs text-[#8E8E93] truncate mt-0.5">
                        {r.assetCode} · {r.location}
                      </p>
                      <p className="text-xs text-[#3C3C43] line-clamp-1 mt-1">{r.description}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${PRIORITY_STYLE[r.priority] ?? 'bg-gray-100 text-gray-500'}`}>
                        {r.priority}
                      </span>
                      <span className="text-[10px] text-[#8E8E93]">{fmtDate(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biên bản chờ duyệt */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-[#5856D6]" />
                <h3 className="text-sm font-bold text-[#1C1C1E]">Biên bản chờ duyệt kinh phí</h3>
                {!loading && stats?.repairReports.pendingApproval !== undefined && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#5856D6]/10 text-[#5856D6]">
                    {stats.repairReports.pendingApproval}
                  </span>
                )}
              </div>
              <Link to="/maintenance" className="text-xs text-[#0A84FF] font-medium hover:underline flex items-center gap-0.5">
                Xem tất cả <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? <SkeletonRows /> : !stats?.recentRepairReports?.length ? (
                <p className="px-5 py-8 text-center text-sm text-[#8E8E93]">Không có biên bản nào</p>
              ) : stats.recentRepairReports.map(r => (
                <div key={r.id} className="px-5 py-3.5 hover:bg-gray-50/70 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1C1C1E] truncate">
                        BB#{r.id} · {r.assetName}
                      </p>
                      <p className="text-xs text-[#8E8E93] truncate mt-0.5">
                        {r.assetCode} · {r.location}
                      </p>
                      <p className="text-xs text-[#3C3C43] truncate mt-1">KTV: {r.technicianName}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-sm font-bold" style={{ color: '#FF9500' }}>
                        {fmt(r.estimatedCost)}
                      </span>
                      <span className="text-[10px] text-[#8E8E93]">{fmtDate(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── ROW 4: THỐNG KÊ NHANH ── */}
      <section>
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-3">
          Thống kê nhanh
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Bar chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={15} className="text-[#0A84FF]" />
              <h3 className="text-sm font-bold text-[#1C1C1E]">Thiết bị theo khoa / phòng ban</h3>
            </div>
            {loading
              ? <div className="flex flex-col gap-3 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-5 bg-gray-100 rounded-full" />)}</div>
              : <BarChart data={stats?.assetsByDepartment ?? []} />
            }
          </div>

          {/* Donut chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <PieChart size={15} className="text-[#5856D6]" />
              <h3 className="text-sm font-bold text-[#1C1C1E]">Thiết bị theo nhóm loại</h3>
            </div>
            {loading
              ? <div className="flex items-center gap-6 animate-pulse"><div className="w-28 h-28 rounded-full bg-gray-100 flex-shrink-0" /><div className="flex flex-col gap-2 flex-1">{[1,2,3].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}</div></div>
              : <DonutChart data={stats?.assetsByCategory ?? []} />
            }
          </div>

        </div>
      </section>

    </div>
  );
};

export default DashboardPage;
