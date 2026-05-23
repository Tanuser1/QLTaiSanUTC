import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Monitor,
  DoorOpen,
  Wrench,
  ClipboardList,
  Tag,
  Settings,
  Truck,
  BarChart2,
  PieChart,
  History,
  Trash2,
  UserCog,
  ChevronDown,
  ChevronRight,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { useDeviceCategoryContext } from '../../contexts/DeviceCategoryContext';

/* ─────────────────────────────────────────────────────────────
   NAV TYPES
───────────────────────────────────────────────────────────── */
type NavLeaf = {
  label: string;
  icon?: React.ElementType;
  count?: number;
  to?: string;
};

type NavGroup = {
  label: string;
  icon: React.ElementType;
  to?: string;
  children?: NavLeaf[];
  badge?: number;
};

/* ─────────────────────────────────────────────────────────────
   STATIC NAV (cấu trúc cố định, không phụ thuộc context)
───────────────────────────────────────────────────────────── */
const STATIC_NAV: NavGroup[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },

  // [slot 1] 'Thiết bị' sẽ được ghép động từ DeviceCategoryContext

  { label: 'Phòng & Khoa',           icon: DoorOpen,      to: '/departments' },
  { label: 'Yêu cầu hỗ trợ',        icon: ClipboardList, to: '/requests',   badge: 0 },
  { label: 'Biên bản sửa chữa',     icon: Wrench,        to: '/maintenance', badge: 0 },

  {
    label: 'Quản lý',
    icon: Settings,
    children: [
      { label: 'Nhà cung cấp',  icon: Truck, to: '/tasks/suppliers'  },
      { label: 'Danh mục TB',   icon: Tag,   to: '/tasks/categories' },
    ],
  },

  {
    label: 'Báo cáo - Thống kê',
    icon: BarChart2,
    children: [
      { label: 'Thống kê theo Loại',  icon: PieChart,  to: '/reports/by-type'       },
      { label: 'Thống kê theo Khoa',  icon: BarChart2, to: '/reports/by-department' },
      { label: 'Lịch sử sửa chữa',   icon: History,   to: '/reports/maintenance'   },
      { label: 'Thiết bị thanh lý',   icon: Trash2,    to: '/reports/disposal'      },
    ],
  },

  { label: 'Quản lý người dùng', icon: UserCog, to: '/users' },
];

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
export const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { categories } = useDeviceCategoryContext();

  // Build nav item "Thiết bị" động từ context
  const deviceNavGroup: NavGroup = {
    label: 'Thiết bị',
    icon: Monitor,
    children: [
      { label: 'Tất cả', to: '/assets' },
      ...categories.map(cat => ({
        label: cat.name,
        to:    `/assets?loai=${cat.id}&catName=${encodeURIComponent(cat.name)}`,
      })),
    ],
  };

  // Dashboard + Thiết bị (động) + phần còn lại
  const NAV_ITEMS: NavGroup[] = [STATIC_NAV[0], deviceNavGroup, ...STATIC_NAV.slice(1)];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Thiết bị':           true,
    'Quản lý':            false,
    'Báo cáo - Thống kê': false,
  });

  const toggleGroup = (label: string) =>
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));

  const isTopActive = (item: NavGroup): boolean => {
    if (item.to) return pathname === item.to;
    return item.children?.some(c => c.to && pathname === c.to.split('?')[0]) ?? false;
  };

  const isChildActive = (child: NavLeaf): boolean => {
    if (!child.to) return false;
    const [childPath, childQuery] = child.to.split('?');
    if (childQuery) {
      const childParams   = new URLSearchParams(childQuery);
      const currentParams = new URLSearchParams(window.location.search);
      return pathname === childPath && childParams.get('loai') === currentParams.get('loai');
    }
    return pathname === childPath || pathname.startsWith(childPath + '/');
  };

  return (
    <aside
      className="flex-shrink-0 z-30 flex flex-col overflow-hidden relative h-full"
      style={{ width: '280px', backgroundColor: '#1a237e', boxShadow: '4px 0 20px rgba(0,0,0,0.25)' }}
    >
      {/* ── LOGO ── */}
      <div
        className="flex items-center gap-3 px-5 shrink-0"
        style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #40c4ff 0%, #00b0ff 100%)' }}
        >
          <GraduationCap size={18} className="text-white" />
        </div>
        <span
          className="text-white font-bold text-[13px] tracking-tight truncate"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Quản lý tài sản UTC
        </span>
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'thin' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const hasChildren = !!(item.children?.length);
          const isOpen      = hasChildren && openGroups[item.label];
          const topActive   = isTopActive(item);

          return (
            <div key={item.label}>
              {/* Top-level row */}
              <div
                onClick={() => { if (hasChildren) toggleGroup(item.label); else if (item.to) navigate(item.to); }}
                className="relative flex items-center gap-2.5 mx-2 my-0.5 px-3 py-2 rounded-lg cursor-pointer select-none transition-colors duration-150"
                style={{
                  backgroundColor: topActive ? '#303f9f' : 'transparent',
                  color: topActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                }}
                onMouseEnter={e => { if (!topActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { if (!topActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
              >
                {topActive && (
                  <span className="absolute left-0 top-1 bottom-1 rounded-full" style={{ width: '4px', backgroundColor: '#40c4ff' }} />
                )}

                <Icon size={17} className="shrink-0 ml-1" />
                <span className="flex-1 truncate text-[13px] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {item.label}
                </span>

                {/* Badge (số > 0 mới hiện) */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="shrink-0 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    style={{ backgroundColor: '#ef5350', color: '#fff' }}
                  >
                    {item.badge}
                  </span>
                )}

                {hasChildren && (
                  <span className="shrink-0 opacity-60">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                )}
              </div>

              {/* Sub-menu */}
              {hasChildren && isOpen && (
                <div className="mx-2 mb-1 rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                  {item.children!.map(child => {
                    const ChildIcon  = child.icon;
                    const childActive = isChildActive(child);

                    return (
                      <div
                        key={child.label}
                        onClick={() => { if (child.to) navigate(child.to); }}
                        className="relative flex items-center gap-2.5 px-4 py-1.5 cursor-pointer transition-colors duration-100"
                        style={{
                          backgroundColor: childActive ? 'rgba(64,196,255,0.12)' : 'transparent',
                          color: childActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                        }}
                        onMouseEnter={e => { if (!childActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={e => { if (!childActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
                      >
                        {childActive && (
                          <span className="absolute left-0 top-1 bottom-1 rounded-full" style={{ width: '3px', backgroundColor: '#40c4ff' }} />
                        )}

                        {ChildIcon
                          ? <ChildIcon size={14} className="shrink-0 ml-1 opacity-70" />
                          : <span className="w-1.5 h-1.5 rounded-full shrink-0 ml-1" style={{ backgroundColor: childActive ? '#40c4ff' : 'rgba(255,255,255,0.35)' }} />
                        }

                        <span
                          className="flex-1 truncate text-[12.5px]"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: childActive ? 600 : 400 }}
                        >
                          {child.label}
                        </span>

                        {child.count !== undefined && (
                          <span className="shrink-0 text-[11px] tabular-nums font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            {child.count.toLocaleString('vi-VN')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── FOOTER ── */}
      <div className="shrink-0 px-4 pb-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer mb-3 transition-colors"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
          onClick={() => navigate('/login')}
        >
          <LogOut size={15} />
          <span className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif' }}>Đăng xuất</span>
        </div>
        <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <p className="text-center leading-snug" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9.5px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            © 2026 TRƯỜNG ĐẠI HỌC<br />GIAO THÔNG VẬN TẢI (UTC)
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
