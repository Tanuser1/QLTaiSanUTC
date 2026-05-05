import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
   Mỗi item có thể là:
   - NavGroup: menu cha, có thể có children (sub-menu)
   - NavLeaf:  menu con, luôn có `to` để navigate bằng router
───────────────────────────────────────────────────────────── */
type NavLeaf = {
  label: string;
  icon?: React.ElementType;
  count?: number;
  /** Route path – bắt buộc cho các item muốn navigate */
  to?: string;
};

type NavGroup = {
  label: string;
  icon: React.ElementType;
  /** Route path cho menu cha (không có children) */
  to?: string;
  children?: NavLeaf[];
  badge?: number;
};

const NAV_ITEMS: NavGroup[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/dashboard',
  },
  {
    label: 'Thiết bị',
    icon: Monitor,
    children: [
      { label: 'Tất cả',               count: 2500, to: '/assets'                },
      { label: 'Máy tính phòng Lab',    count: 450,  to: '/assets?cat=lab'        },
      { label: 'Máy chiếu giảng đường', count: 120,  to: '/assets?cat=projector'  },
      { label: 'Thiết bị mạng',         count: 85,   to: '/assets?cat=network'    },
      { label: 'Micro & Âm thanh',      count: 150,  to: '/assets?cat=audio'      },
      { label: 'Laptop Cán bộ',         count: 60,   to: '/assets?cat=laptop'     },
      { label: 'Linh kiện',             count: 320,  to: '/assets?cat=parts'      },
      { label: 'Bàn ghế sinh viên',     count: 1315, to: '/assets?cat=furniture'  },
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
      { label: 'Quản lý mã vạch',      icon: Tag,       to: '/tasks/barcode'   },
      { label: 'Quản lý thiết bị',     icon: Monitor,   to: '/tasks/devices'   },
      { label: 'Quản lý nhà cung cấp', icon: Truck,     to: '/tasks/suppliers' },
      { label: 'Quản lý TB cha con',   icon: GitBranch, to: '/tasks/hierarchy' },
    ],
  },
  {
    label: 'Báo cáo - Thống kê',
    icon: BarChart2,
    children: [
      { label: 'Thống kê theo Loại thiết bị',  icon: PieChart,  to: '/reports/by-type'       },
      { label: 'Thống kê theo Khoa/Bộ môn',    icon: BarChart2, to: '/reports/by-department' },
      { label: 'Báo cáo lịch sử Bảo trì',      icon: History,   to: '/reports/maintenance'   },
      { label: 'Báo cáo thiết bị Thanh lý',    icon: Trash2,    to: '/reports/disposal'      },
    ],
  },
  {
    label: 'Quản lý người dùng',
    icon: UserCog,
    to: '/users',
  },
];

/* ─────────────────────────────────────────────────────────────
   SIDEBAR COMPONENT
   - Dùng useLocation() để lấy pathname hiện tại → không dùng
     window.location.pathname, đồng bộ hoàn toàn với React Router.
   - Dùng useNavigate() để chuyển trang → không reload page.
   - Active state được tính từ location.pathname, không dùng
     state local nữa → chính xác khi navigate từ LoginPage hoặc
     bất kỳ trang nào khác.
───────────────────────────────────────────────────────────── */
export const Sidebar: React.FC = () => {
  // useLocation: cung cấp pathname đồng bộ với React Router
  const { pathname } = useLocation();

  // useNavigate: thay thế hoàn toàn window.location.href
  const navigate = useNavigate();

  // Trạng thái mở/đóng của từng nhóm menu cha có children
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Thiết bị': true,
    'Quản lý tác vụ': false,
    'Báo cáo - Thống kê': false,
  });

  /** Toggle mở/đóng một nhóm menu */
  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  /**
   * Kiểm tra menu cha có đang active không.
   * - Nếu có `to`: so sánh trực tiếp với pathname.
   * - Nếu có children: active khi bất kỳ child nào có to trùng pathname.
   */
  const isTopActive = (item: NavGroup): boolean => {
    if (item.to) return pathname === item.to;
    if (item.children) {
      // Chỉ so sánh phần pathname, bỏ qua query string của children
      return item.children.some(
        (child) => child.to && pathname === child.to.split('?')[0]
      );
    }
    return false;
  };

  /**
   * Kiểm tra menu con có đang active không.
   * So sánh cả pathname lẫn query string để phân biệt các filter.
   * Ví dụ: /assets?cat=lab khác /assets?cat=network.
   */
  const isChildActive = (child: NavLeaf): boolean => {
    if (!child.to) return false;
    const [childPath, childQuery] = child.to.split('?');
    const currentQuery = window.location.search.replace('?', '');
    if (childQuery) {
      // Có query string → so sánh cả path lẫn query
      return pathname === childPath && currentQuery === childQuery;
    }
    // Không có query string → chỉ so sánh pathname
    return pathname === childPath;
  };

  return (
    <aside
      className="flex-shrink-0 z-30 flex flex-col overflow-hidden relative h-full"
      style={{
        width: '280px',
        backgroundColor: '#1a237e',
        boxShadow: '4px 0 20px rgba(0,0,0,0.25)',
      }}
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
          // Active state tính từ useLocation(), đồng bộ với React Router
          const topActive = isTopActive(item);

          return (
            <div key={item.label}>
              {/* ── TOP-LEVEL ROW ──
                  - Nếu có children: toggle mở/đóng sub-menu
                  - Nếu có `to`: navigate bằng React Router (không reload) */}
              <div
                onClick={() => {
                  if (hasChildren) {
                    toggleGroup(item.label);
                  } else if (item.to) {
                    // SPA navigation – không reload trang
                    navigate(item.to);
                  }
                }}
                className="relative flex items-center gap-2.5 mx-2 my-0.5 px-3 py-2 rounded-lg cursor-pointer select-none transition-colors duration-150"
                style={{
                  backgroundColor: topActive ? '#303f9f' : 'transparent',
                  color: topActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                }}
                onMouseEnter={(e) => {
                  if (!topActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.07)';
                }}
                onMouseLeave={(e) => {
                  if (!topActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                }}
              >
                {/* Sky-blue active bar bên trái */}
                {topActive && (
                  <span
                    className="absolute left-0 top-1 bottom-1 rounded-full"
                    style={{ width: '4px', backgroundColor: '#40c4ff' }}
                  />
                )}

                <Icon size={17} className="shrink-0 ml-1" />
                <span
                  className="flex-1 truncate text-[13px] font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {item.label}
                </span>

                {/* Badge số lượng (ví dụ: 3 yêu cầu chờ) */}
                {item.badge !== undefined && (
                  <span
                    className="shrink-0 text-[10px] font-bold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1"
                    style={{ backgroundColor: '#ef5350', color: '#fff' }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Chevron cho nhóm có sub-menu */}
                {hasChildren && (
                  <span className="shrink-0 opacity-60">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                )}
              </div>

              {/* ── SUB-MENU ──
                  Active state của child cũng tính từ useLocation(),
                  đảm bảo đồng bộ khi navigate từ bất kỳ trang nào. */}
              {hasChildren && isOpen && (
                <div
                  className="mx-2 mb-1 rounded-lg overflow-hidden"
                  style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
                >
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon;
                    // Active tính từ router, không dùng state local
                    const childActive = isChildActive(child);

                    return (
                      <div
                        key={child.label}
                        onClick={() => {
                          // SPA navigation – navigate bằng router, không reload
                          if (child.to) navigate(child.to);
                        }}
                        className="relative flex items-center gap-2.5 px-4 py-1.5 cursor-pointer transition-colors duration-100"
                        style={{
                          backgroundColor: childActive ? 'rgba(64,196,255,0.12)' : 'transparent',
                          color: childActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                        }}
                        onMouseEnter={(e) => {
                          if (!childActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseLeave={(e) => {
                          if (!childActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                        }}
                      >
                        {/* Active bar bên trái */}
                        {childActive && (
                          <span
                            className="absolute left-0 top-1 bottom-1 rounded-full"
                            style={{ width: '3px', backgroundColor: '#40c4ff' }}
                          />
                        )}

                        {/* Icon hoặc dot tùy loại child */}
                        {ChildIcon ? (
                          <ChildIcon size={14} className="shrink-0 ml-1 opacity-70" />
                        ) : (
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0 ml-1"
                            style={{ backgroundColor: childActive ? '#40c4ff' : 'rgba(255,255,255,0.35)' }}
                          />
                        )}

                        <span
                          className="flex-1 truncate text-[12.5px]"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: childActive ? 600 : 400 }}
                        >
                          {child.label}
                        </span>

                        {/* Count badge */}
                        {child.count !== undefined && (
                          <span
                            className="shrink-0 text-[11px] tabular-nums font-semibold"
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
        className="shrink-0 px-4 pb-3 pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Nút Đăng xuất – navigate về /login bằng router, không reload */}
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer mb-3 transition-colors"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
          onClick={() => { navigate('/login'); }}
        >
          <LogOut size={15} />
          <span className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif' }}>Đăng xuất</span>
        </div>

        {/* Branding nhà trường */}
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
