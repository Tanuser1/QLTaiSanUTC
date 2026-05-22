/**
 * pages/Dashboard/DashboardPage.tsx
 * Hiển thị số liệu THẬT từ API /api/admin/dashboard
 */
import React, { useEffect, useState } from 'react';
import {
  Monitor, Wrench, ClipboardList, CheckCircle2,
  Package, TrendingUp, AlertTriangle, Users,
  ArrowUpRight, Activity, Clock, BarChart3,
} from 'lucide-react';
import apiClient from '../../services/apiClient';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
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
}

/* ─────────────────────────────────────────────────────────────
   BENTO TILE
───────────────────────────────────────────────────────────── */
interface BentoTile {
  id: string;
  color: string;
  icon: React.ElementType;
  value: string | number;
  label: string;
  sub?: string;
  trend?: { dir: 'up' | 'down' | 'neutral'; text: string };
  colSpan?: number;
}

const BentoCard: React.FC<{ tile: BentoTile; loading: boolean }> = ({ tile, loading }) => {
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
      <div className="absolute -right-4 -top-4 pointer-events-none select-none" style={{ transform: 'rotate(15deg)', opacity: 0.10 }}>
        <Icon size={130} color={isYellow ? '#000000' : '#ffffff'} strokeWidth={1.2} />
      </div>

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

      <div className="z-10 relative">
        {tile.sub && <p className="text-[11px] font-medium mb-1" style={{ color: mutedColor, fontFamily: 'Inter, sans-serif' }}>{tile.sub}</p>}
        <p className="leading-none mb-2" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '38px', color: textColor, letterSpacing: '-0.02em' }}>
          {loading ? '...' : tile.value.toLocaleString('vi-VN')}
        </p>
        <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: textColor, fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em' }}>
          {tile.label}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/admin/dashboard')
      .then(({ data }) => {
        if (data.success) setStats(data.data);
        else setError(data.message);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Build tiles từ số liệu thật
  const TILES: BentoTile[] = [
    {
      id: 'total', color: '#00796b', icon: Package,
      value: stats?.assets.total ?? 0,
      label: 'TỔNG THIẾT BỊ', sub: 'Toàn trường',
    },
    {
      id: 'active', color: '#4db6ac', icon: CheckCircle2,
      value: stats?.assets.active ?? 0,
      label: 'ĐANG HOẠT ĐỘNG',
      sub: stats ? `${((stats.assets.active / (stats.assets.total || 1)) * 100).toFixed(1)}% tổng số` : '—',
    },
    {
      id: 'maintenance', color: '#ef5350', icon: Wrench,
      value: (stats?.assets.broken ?? 0) + (stats?.assets.underRepair ?? 0),
      label: 'HƯ HỎNG / SỬA CHỮA', sub: 'Cần xử lý',
    },
    {
      id: 'requests', color: '#ffa726', icon: ClipboardList,
      value: stats?.supportRequests.new ?? 0,
      label: 'YÊU CẦU CHỜ DUYỆT', sub: 'Cần xem xét ngay',
    },
    {
      id: 'phong', color: '#303f9f', icon: Monitor,
      value: stats?.rooms.total ?? 0,
      label: 'TỔNG SỐ PHÒNG', sub: 'Phòng học, phòng máy, kho…', colSpan: 2,
    },
    {
      id: 'choThanhLy', color: '#ee665f', icon: AlertTriangle,
      value: stats?.assets.pendingLiquidation ?? 0,
      label: 'CHỜ THANH LÝ', sub: 'Cần ưu tiên xử lý',
    },
    {
      id: 'staff-laptop', color: '#fdd835', icon: TrendingUp,
      value: 0,
      label: 'LAPTOP CÁN BỘ', sub: '—',
    },
    {
      id: 'network', color: '#3949ab', icon: BarChart3,
      value: 0,
      label: 'THIẾT BỊ MẠNG', sub: 'Switch, Router, AP',
    },
    {
      id: 'scheduled', color: '#43a047', icon: Clock,
      value: 0,
      label: 'KIỂM TRA HÔM NAY', sub: '—', colSpan: 2,
    },
    {
      id: 'users', color: '#7e57c2', icon: Users,
      value: 0,
      label: 'NGƯỜI DÙNG HỆ THỐNG', sub: 'GV, NV và Kỹ thuật viên',
    },
  ];

  return (
    <div className="flex-1 p-10 flex flex-col">
      {/* Heading */}
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

      {/* Lỗi kết nối */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          ⚠️ Không tải được dữ liệu: {error}
        </div>
      )}

      {/* Bento grid */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {TILES.map((tile) => (
          <BentoCard key={tile.id} tile={tile} loading={loading} />
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent activity (tĩnh tạm thời, sau có thể làm API log) */}
        <div className="col-span-2 rounded-2xl overflow-hidden" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <div className="flex items-center gap-2">
              <Activity size={16} style={{ color: '#303f9f' }} />
              <h3 className="text-[14px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#1a237e' }}>Hoạt động gần đây</h3>
            </div>
          </div>
          <div className="px-5 py-8 text-center text-sm" style={{ color: '#90a4ae' }}>
            Chức năng lịch sử hoạt động sẽ được bổ sung sau.
          </div>
        </div>

        {/* Thống kê phân loại (từ DB) */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <BarChart3 size={16} style={{ color: '#303f9f' }} />
            <h3 className="text-[14px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#1a237e' }}>Theo trạng thái</h3>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            {stats && [
              { label: 'Đang sử dụng',  count: stats.assets.active,             color: '#4db6ac', total: stats.assets.total },
              { label: 'Hư hỏng',        count: stats.assets.broken,             color: '#ef5350', total: stats.assets.total },
              { label: 'Đang sửa chữa', count: stats.assets.underRepair,         color: '#ffa726', total: stats.assets.total },
              { label: 'Chờ thanh lý',  count: stats.assets.pendingLiquidation,  color: '#ee665f', total: stats.assets.total },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: '#546e7a', fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
                  <span className="text-[12px] font-semibold tabular-nums" style={{ color: '#1a237e', fontFamily: 'Inter, sans-serif' }}>{item.count}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f2f5' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.total > 0 ? ((item.count / item.total) * 100).toFixed(1) : 0}%`,
                      backgroundColor: item.color,
                      transition: 'width 0.6s ease'
                    }}
                  />
                </div>
              </div>
            ))}
            {loading && <p className="text-sm text-center" style={{ color: '#90a4ae' }}>Đang tải...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
