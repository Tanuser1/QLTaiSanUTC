import React, { useState } from 'react';
import {
  LayoutDashboard,
  Monitor,
  DoorOpen,
  Wrench,
  ClipboardList,
  CalendarCheck,
  Tag,
  Settings,
  Truck,
  GitBranch,
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

/* ─────────────────────────────────────────────────────────────
   NAV DATA
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

const NAV_ITEMS: NavGroup[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/',
  },
  {
    label: 'Thiết bị',
    icon: Monitor,
    children: [
      { label: 'Tất cả',                     count: 2500 },
      { label: 'Máy tính phòng Lab',          count: 450  },
      { label: 'Máy chiếu giảng đường',       count: 120  },
      { label: 'Thiết bị mạng',               count: 85   },
      { label: 'Micro & Âm thanh',            count: 150  },
      { label: 'Laptop Cán bộ',               count: 60   },
      { label: 'Linh kiện',                   count: 320  },
      { label: 'Bàn ghế sinh viên',           count: 1315 },
    ],
  },
  {
    label: 'Phòng',
    icon: DoorOpen,
    to: '/departments',
  },
  {
    label: 'Sửa chữa thiết bị',
    icon: Wrench,
    to: '/maintenance',
    badge: 3,
  },
  {
    label: 'Yêu cầu thiết bị',
    icon: ClipboardList,
    to: '/requests',
    badge: 7,
  },
  {
    label: 'Lịch kiểm tra thiết bị',
    icon: CalendarCheck,
    to: '/audit',
  },
  {
    label: 'Quản lý tác vụ',
    icon: Settings,
    children: [
      { label: 'Quản lý mã vạch',      icon: Tag       },
      { label: 'Quản lý thiết bị',     icon: Monitor   },
      { label: 'Quản lý nhà cung cấp', icon: Truck     },
      { label: 'Quản lý TB cha con',   icon: GitBranch },
    ],
  },
  {
    label: 'Báo cáo - Thống kê',
    icon: BarChart2,
    children: [
      { label: 'Thống kê theo Loại thiết bị',    icon: PieChart   },
      { label: 'Thống kê theo Khoa/Bộ môn',      icon: BarChart2  },
      { label: 'Báo cáo lịch sử Bảo trì',        icon: History    },
      { label: 'Báo cáo thiết bị Thanh lý',      icon: Trash2     },
    ],
  },
  {
    label: 'Quản lý người dùng',
    icon: UserCog,
    to: '/users',
  },
];

/* ─────────────────────────────────────────────────────────────
   ACTIVE PATH DETECTION (simple check)
───────────────────────────────────────────────────────────── */
function useActivePath(): string {
  if (typeof window !== 'undefined') return window.location.pathname;
  return '/';
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
export const Sidebar: React.FC = () => {
  const activePath = useActivePath();

  // groups that start expanded
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Thiết bị': true,
    'Quản lý tác vụ': false,
    'Báo cáo - Thống kê': false,
  });

  const [activeLeaf, setActiveLeaf] = useState<string>('');

  const toggleGroup = (label: string) =>
    setOpenGroups((p) => ({ ...p, [label]: !p[label] }));

  const isDashboardActive = activePath === '/';

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden"
      style={{
        width: '260px',
        backgroundColor: '#1a237e',
        boxShadow: '4px 0 20px rgba(0,0,0,0.25)',
      }}
    >
      {/* ── LOGO ── */}
      <div
        className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #40c4ff 0%, #00b0ff 100%)' }}
        >
          <GraduationCap size={18} className="text-white" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span
            className="text-white font-bold text-[13px] tracking-tight truncate"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Quản lý tài sản trường UTC
          </span>
          <span className="text-[10px] font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
          </span>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'thin' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!(item.children && item.children.length > 0);
          const isOpen = hasChildren && openGroups[item.label];
          const isTopActive = !hasChildren && (item.to === activePath || (item.to === '/' && isDashboardActive));

          return (
            <div key={item.label}>
              {/* TOP-LEVEL ROW */}
              <div
                onClick={() => {
                  if (hasChildren) {
                    toggleGroup(item.label);
                  } else if (item.to) {
                    window.location.href = item.to;
                  }
                }}
                className="relative flex items-center gap-2.5 mx-2 my-0.5 px-3 py-2 rounded-lg cursor-pointer select-none transition-colors duration-150"
                style={{
                  backgroundColor: isTopActive ? '#303f9f' : 'transparent',
                  color: isTopActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                }}
                onMouseEnter={(e) => {
                  if (!isTopActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.07)';
                }}
                onMouseLeave={(e) => {
                  if (!isTopActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                }}
              >
                {/* Sky-blue active bar */}
                {isTopActive && (
                  <span
                    className="absolute left-0 top-1 bottom-1 rounded-full"
                    style={{ width: '4px', backgroundColor: '#40c4ff' }}
                  />
                )}

                <Icon size={17} className="flex-shrink-0 ml-1" />
                <span
                  className="flex-1 truncate text-[13px] font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge !== undefined && (
                  <span
                    className="flex-shrink-0 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    style={{ backgroundColor: '#ef5350', color: '#fff' }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Chevron for groups */}
                {hasChildren && (
                  <span className="flex-shrink-0 opacity-60">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                )}
              </div>

              {/* SUB-MENU */}
              {hasChildren && isOpen && (
                <div
                  className="mx-2 mb-1 rounded-lg overflow-hidden"
                  style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
                >
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = activeLeaf === child.label;
                    return (
                      <div
                        key={child.label}
                        onClick={() => setActiveLeaf(child.label)}
                        className="relative flex items-center gap-2.5 px-4 py-1.5 cursor-pointer transition-colors duration-100"
                        style={{
                          backgroundColor: isChildActive ? 'rgba(64,196,255,0.12)' : 'transparent',
                          color: isChildActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isChildActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isChildActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                        }}
                      >
                        {/* Active bar for child */}
                        {isChildActive && (
                          <span
                            className="absolute left-0 top-1 bottom-1 rounded-full"
                            style={{ width: '3px', backgroundColor: '#40c4ff' }}
                          />
                        )}

                        {/* Dot or icon */}
                        {ChildIcon ? (
                          <ChildIcon size={14} className="flex-shrink-0 ml-1 opacity-70" />
                        ) : (
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1"
                            style={{ backgroundColor: isChildActive ? '#40c4ff' : 'rgba(255,255,255,0.35)' }}
                          />
                        )}

                        <span
                          className="flex-1 truncate text-[12.5px]"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: isChildActive ? 600 : 400 }}
                        >
                          {child.label}
                        </span>

                        {/* Count badge */}
                        {child.count !== undefined && (
                          <span
                            className="flex-shrink-0 text-[11px] tabular-nums font-semibold"
                            style={{ color: 'rgba(255,255,255,0.45)' }}
                          >
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
      <div
        className="flex-shrink-0 px-4 pb-3 pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Logout button */}
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer mb-3 transition-colors"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
          onClick={() => { window.location.href = '/login'; }}
        >
          <LogOut size={15} />
          <span className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif' }}>Đăng xuất</span>
        </div>

        {/* Institutional branding */}
        <div
          className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        >
          <p
            className="text-center leading-snug"
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '9.5px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            © 2026 TRƯỜNG ĐẠI HỌC
            <br />
            GIAO THÔNG VẬN TẢI (UTC)
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
