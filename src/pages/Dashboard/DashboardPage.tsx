/**
 * pages/Dashboard/DashboardPage.tsx
 * Di chuyển từ pages/DashboardPage.tsx — giữ nguyên 100% logic và UI.
 * Import MainLayout được cập nhật → AdminLayout từ components/layout/.
 */
import React from 'react';
import {
  Monitor, Wrench, ClipboardList, CheckCircle2,
  Package, TrendingUp, AlertTriangle, Users,
  ArrowUpRight, Activity, Clock, BarChart3,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   BENTO TILE DATA
───────────────────────────────────────────────────────────── */
interface BentoTile {
  id: string;
  color: string;
  icon: React.ElementType;
  value: string;
  label: string;
  sub?: string;
  trend?: { dir: 'up' | 'down' | 'neutral'; text: string };
  colSpan?: number;
  rowSpan?: number;
}

const TILES: BentoTile[] = [
  { id: 'total',      color: '#00796b', icon: Package,       value: '2.500', label: 'TỔNG THIẾT BỊ',            sub: 'Toàn trường',       trend: { dir: 'up',      text: '+120 so với tháng trước' } },
  { id: 'active',     color: '#4db6ac', icon: CheckCircle2,  value: '2.087', label: 'ĐANG HOẠT ĐỘNG',           sub: '83.5% tổng số',     trend: { dir: 'up',      text: '+2.1% so với tháng trước' } },
  { id: 'maintenance',color: '#ef5350', icon: Wrench,         value: '183',   label: 'ĐANG BẢO TRÌ',             sub: '7.3% cần xử lý',   trend: { dir: 'down',    text: '-5 so với tuần trước' } },
  { id: 'requests',   color: '#ffa726', icon: ClipboardList,  value: '75',    label: 'YÊU CẦU CHỜ DUYỆT',       sub: 'Cần xem xét ngay',  trend: { dir: 'up',      text: '+12 hôm nay' } },
  { id: 'labs',       color: '#303f9f', icon: Monitor,        value: '450',   label: 'MÁY TÍNH PHÒNG LAB',       sub: '18 phòng Lab',      trend: { dir: 'neutral', text: 'Không thay đổi' }, colSpan: 2 },
  { id: 'projectors', color: '#4dd0e1', icon: Activity,       value: '120',   label: 'MÁY CHIẾU GIẢNG ĐƯỜNG',   sub: '97 đang hoạt động' },
  { id: 'overdue',    color: '#ee665f', icon: AlertTriangle,  value: '23',    label: 'QUÁ HẠN BẢO TRÌ',          sub: 'Cần ưu tiên xử lý', trend: { dir: 'up',      text: '+8 so với tháng trước' } },
  { id: 'staff-laptop',color:'#fdd835', icon: TrendingUp,     value: '60',    label: 'LAPTOP CÁN BỘ',            sub: '3 chờ cấp phát' },
  { id: 'network',    color: '#3949ab', icon: BarChart3,      value: '85',    label: 'THIẾT BỊ MẠNG',            sub: 'Switch, Router, AP' },
  { id: 'scheduled',  color: '#43a047', icon: Clock,          value: '14',    label: 'LỊCH KIỂM TRA HÔM NAY',   sub: '9 đã hoàn thành', colSpan: 2 },
  { id: 'users',      color: '#7e57c2', icon: Users,          value: '148',   label: 'NGƯỜI DÙNG HỆ THỐNG',     sub: 'GV, NV và Kỹ thuật viên' },
];

/* ─────────────────────────────────────────────────────────────
   BENTO TILE COMPONENT
───────────────────────────────────────────────────────────── */
const BentoCard: React.FC<{ tile: BentoTile }> = ({ tile }) => {
  const Icon = tile.icon;
  const isYellow = tile.color === '#fdd835';
  const textColor = isYellow ? 'rgba(0,0,0,0.75)' : '#ffffff';
  const mutedColor = isYellow ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.65)';

  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: tile.color,
        minHeight: '200px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1)',
        gridColumn: tile.colSpan === 2 ? 'span 2' : 'span 1',
      }}
    >
      {/* Big background icon */}
      <div className="absolute -right-4 -top-4 pointer-events-none select-none" style={{ transform: 'rotate(15deg)', opacity: 0.10 }}>
        <Icon size={130} color={isYellow ? '#000000' : '#ffffff'} strokeWidth={1.2} />
      </div>

      {/* Top row */}
      <div className="flex items-start justify-between z-10 relative">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
          <Icon size={20} color={textColor} />
        </div>
        {tile.trend && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: textColor }}>
            {tile.trend.dir === 'up' && <ArrowUpRight size={11} />}
            {tile.trend.dir === 'down' && <ArrowUpRight size={11} style={{ transform: 'rotate(90deg)' }} />}
            <span>{tile.trend.text}</span>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="z-10 relative">
        {tile.sub && <p className="text-[11px] font-medium mb-1" style={{ color: mutedColor, fontFamily: 'Inter, sans-serif' }}>{tile.sub}</p>}
        <p className="leading-none mb-2" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '38px', color: textColor, letterSpacing: '-0.02em' }}>
          {tile.value}
        </p>
        <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: textColor, fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em' }}>
          {tile.label}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   RECENT ACTIVITY
───────────────────────────────────────────────────────────── */
const ACTIVITY = [
  { dot: '#ef5350', text: 'MB-002 được đưa vào bảo trì', time: '10 phút trước' },
  { dot: '#ffa726', text: 'Yêu cầu cấp Laptop #YC-089 mới', time: '32 phút trước' },
  { dot: '#43a047', text: 'Kiểm tra phòng Lab A1 hoàn tất', time: '1 giờ trước' },
  { dot: '#4dd0e1', text: 'Thêm mới 5 máy chiếu Epson', time: '2 giờ trước' },
  { dot: '#303f9f', text: 'Cập nhật firmware Switch D-Link', time: '3 giờ trước' },
  { dot: '#7e57c2', text: 'Thanh lý 12 bộ bàn ghế cũ P.303', time: 'Hôm qua' },
];

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
const DashboardPage: React.FC = () => {
  return (
    <div className="flex-1 p-10 flex flex-col">
      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[22px] font-bold leading-tight" style={{ fontFamily: 'Manrope, sans-serif', color: '#1a237e' }}>
            Tổng quan hệ thống tài sản
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#546e7a', fontFamily: 'Inter, sans-serif' }}>
            Trường Đại học Giao thông Vận tải (UTC) • Năm học 2025–2026
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#546e7a' }}>
          <Clock size={13} />
          <span style={{ fontFamily: 'Inter, sans-serif' }}>
            Cập nhật: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {TILES.map((tile) => <BentoCard key={tile.id} tile={tile} />)}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="col-span-2 rounded-2xl overflow-hidden" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <div className="flex items-center gap-2">
              <Activity size={16} style={{ color: '#303f9f' }} />
              <h3 className="text-[14px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#1a237e' }}>Hoạt động gần đây</h3>
            </div>
            <a href="/audit" className="text-[12px] font-semibold flex items-center gap-1 transition-colors" style={{ color: '#303f9f', fontFamily: 'Inter, sans-serif' }}>
              Xem tất cả <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="px-5 py-2">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: i < ACTIVITY.length - 1 ? '1px solid #f0f2f5' : 'none' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: a.dot }} />
                <span className="flex-1 text-sm" style={{ color: '#37474f', fontFamily: 'Inter, sans-serif' }}>{a.text}</span>
                <span className="text-[11px] flex-shrink-0" style={{ color: '#90a4ae' }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <BarChart3 size={16} style={{ color: '#303f9f' }} />
            <h3 className="text-[14px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#1a237e' }}>Phân loại thiết bị</h3>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            {[
              { label: 'Máy tính phòng Lab', pct: 68, count: '450',   color: '#303f9f' },
              { label: 'Bàn ghế sinh viên',  pct: 52, count: '1.315', color: '#00796b' },
              { label: 'Linh kiện',          pct: 40, count: '320',   color: '#ffa726' },
              { label: 'Micro & Âm thanh',   pct: 22, count: '150',   color: '#4dd0e1' },
              { label: 'Máy chiếu',          pct: 18, count: '120',   color: '#ee665f' },
              { label: 'Laptop Cán bộ',      pct: 8,  count: '60',    color: '#7e57c2' },
            ].map((cat) => (
              <div key={cat.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: '#546e7a', fontFamily: 'Inter, sans-serif' }}>{cat.label}</span>
                  <span className="text-[12px] font-semibold tabular-nums" style={{ color: '#1a237e', fontFamily: 'Inter, sans-serif' }}>{cat.count}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f2f5' }}>
                  <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, backgroundColor: cat.color, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
