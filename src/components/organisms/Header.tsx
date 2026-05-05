import React, { useState } from 'react';
import { Bell, HelpCircle, Search } from 'lucide-react';

export const Header: React.FC = () => {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header
      className="flex-shrink-0 z-20 flex items-center justify-between px-6 border-b border-gray-100 bg-white"
      style={{
        height: '64px',
        boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Left side: Page title */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <h1 className="text-xl font-bold text-[#041627] font-manrope truncate leading-tight">
          Phần mềm quản lý tài sản và bảo trì thiết bị trường UTC
        </h1>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Search */}
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#041627] hover:bg-[#f3f4f5] transition-colors">
          <Search size={20} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#041627] hover:bg-[#f3f4f5] transition-colors relative"
          >
            <Bell size={20} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
              style={{ backgroundColor: '#ef5350' }}
            />
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-11 w-72 bg-white rounded-lg border border-gray-100 z-50 overflow-hidden"
              style={{ boxShadow: '0px 12px 32px rgba(0,0,0,0.15)' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-[#041627]">Thông báo</span>
                <span className="text-xs text-[#26a69a] cursor-pointer hover:underline">Đánh dấu đã đọc</span>
              </div>
              {[
                { text: 'Thiết bị MB-001 cần bảo trì định kỳ', time: '5 phút trước', dot: '#ef5350' },
                { text: '3 yêu cầu cấp tài sản đang chờ duyệt', time: '1 giờ trước', dot: '#ffca28' },
                { text: 'Kiểm kê Q2/2025 sắp đến hạn', time: '2 ngày trước', dot: '#26a69a' },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#f3f4f5] cursor-pointer transition-colors border-b border-gray-100 last:border-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: n.dot }} />
                  <div>
                    <p className="text-xs text-[#041627] leading-relaxed">{n.text}</p>
                    <p className="text-[10px] text-[#74777d] mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help */}
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#041627] hover:bg-[#f3f4f5] transition-colors">
          <HelpCircle size={20} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-100 mx-1" />

        {/* User avatar */}
        <button className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity ml-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: '#041627' }}
          >
            AD
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
