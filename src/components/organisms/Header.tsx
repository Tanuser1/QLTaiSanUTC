import React, { useState } from 'react';
import { Bell, ChevronDown, HelpCircle, Settings } from 'lucide-react';
import SearchBar from '../molecules/SearchBar';

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumbs }) => {
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center gap-4 px-6 border-b border-[#e1e3e4] bg-white"
      style={{
        left: '260px',
        height: '64px',
        boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Page title / breadcrumb */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-[11px] text-[#74777d] mb-0.5">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-[#26a69a] transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        {title && (
          <h1 className="text-[15px] font-bold text-[#191c1d] font-manrope truncate leading-tight">
            {title}
          </h1>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center" style={{ width: '320px' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm tài sản, phòng ban..."
          className="w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-2">
        {/* Help */}
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] hover:text-[#191c1d] transition-colors">
          <HelpCircle size={18} />
        </button>

        {/* Settings */}
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] hover:text-[#191c1d] transition-colors">
          <Settings size={18} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] hover:text-[#191c1d] transition-colors relative"
          >
            <Bell size={18} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
              style={{ backgroundColor: '#ef5350' }}
            />
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-11 w-72 bg-white rounded-lg border border-[#e1e3e4] z-50 overflow-hidden"
              style={{ boxShadow: '0px 12px 32px rgba(0,0,0,0.15)' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e1e3e4]">
                <span className="text-sm font-semibold text-[#191c1d]">Thông báo</span>
                <span className="text-xs text-[#26a69a] cursor-pointer hover:underline">Đánh dấu đã đọc</span>
              </div>
              {[
                { text: 'Thiết bị MB-001 cần bảo trì định kỳ', time: '5 phút trước', dot: '#ef5350' },
                { text: '3 yêu cầu cấp tài sản đang chờ duyệt', time: '1 giờ trước', dot: '#ffca28' },
                { text: 'Kiểm kê Q2/2025 sắp đến hạn', time: '2 ngày trước', dot: '#26a69a' },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#f3f4f5] cursor-pointer transition-colors border-b border-[#e1e3e4] last:border-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: n.dot }} />
                  <div>
                    <p className="text-xs text-[#191c1d] leading-relaxed">{n.text}</p>
                    <p className="text-[10px] text-[#74777d] mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#e1e3e4] mx-1" />

        {/* User avatar */}
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f3f4f5] transition-colors group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #26a69a, #006a62)' }}
          >
            AD
          </div>
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-semibold text-[#191c1d]">Admin UTC</span>
            <span className="text-[10px] text-[#74777d]">Quản trị viên</span>
          </div>
          <ChevronDown size={14} className="text-[#74777d] group-hover:text-[#191c1d] transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default Header;
