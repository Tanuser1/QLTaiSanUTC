import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, HelpCircle, Search, Camera } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { thongbaoService } from '../../services/thongbaoService';
import type { AppNotification } from '../../types/thongbao.types';

/**
 * Header – Top navigation bar.
 */
export const Header: React.FC = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const { user } = useAuthContext();

  // ── Avatar ────────────────────────────────────────────────────
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`avatar_${user.id}`);
      setAvatar(saved ?? null);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?.id) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setAvatar(b64);
        localStorage.setItem(`avatar_${user.id}`, b64);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const ROLE_LABELS: Record<string, string> = {
    admin: 'Quản trị viên',
    bgh: 'Ban Giám Hiệu',
    technician: 'Kỹ thuật viên',
    teacher: 'Giảng viên',
  };

  // ── Thông báo API ─────────────────────────────────────────────
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  const fetchNotif = useCallback(async () => {
    if (!user) return;
    try {
      const data = await thongbaoService.getAll({ limit: 10 });
      setNotifications(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotif();
    const t = setInterval(fetchNotif, 60_000);
    return () => clearInterval(t);
  }, [fetchNotif]);

  const markAllRead = async () => {
    try {
      await thongbaoService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
    }
  };

  // Hiển thị thời gian tương đối đơn giản (không cần thư viện)
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return 'Vừa xong';
    if (mins  < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <header
      className="flex-shrink-0 z-20 flex items-center justify-between px-6 border-b border-gray-100 bg-white"
      style={{ height: '80px', boxShadow: '0px 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <h1 className="text-xl font-bold text-[#041627] font-manrope truncate leading-tight">
          Phần mềm quản lý tài sản và bảo trì thiết bị trường UTC
        </h1>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#041627] hover:bg-[#f3f4f5] transition-colors">
          <Search size={20} />
        </button>

        {/* ── Chuông thông báo ── */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#041627] hover:bg-[#f3f4f5] transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white px-0.5"
                style={{ backgroundColor: '#ef5350' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-11 w-80 bg-white rounded-xl border border-gray-100 z-50 overflow-hidden"
              style={{ boxShadow: '0px 12px 32px rgba(0,0,0,0.15)' }}
            >
              {/* Header dropdown */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-[#041627]">
                  Thông báo {unreadCount > 0 && <span className="text-xs font-normal text-[#74777d]">({unreadCount} chưa đọc)</span>}
                </span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#26a69a] hover:underline">
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>

              {/* Danh sách thông báo */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Bell size={24} className="text-[#c4c6cd]" />
                    <p className="text-xs text-[#74777d]">Không có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-[#f3f4f5] cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-[#f4fbff]' : ''}`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: n.isRead ? '#c4c6cd' : '#ef5350' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs text-[#041627] leading-relaxed ${!n.isRead ? 'font-semibold' : ''}`}>
                          {n.content ?? '(Không có nội dung)'}
                        </p>
                        <p className="text-[10px] text-[#74777d] mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#041627] hover:bg-[#f3f4f5] transition-colors">
          <HelpCircle size={20} />
        </button>
        <div className="w-px h-6 bg-gray-100 mx-1" />

        {/* ── Thông tin & Avatar ── */}
        <div className="flex items-center ml-2 border-l border-gray-100 pl-4">
          <div className="flex flex-col items-end mr-3 hidden sm:flex">
            <span className="text-[13px] font-bold text-[#041627] leading-tight">{user?.fullName || 'Người dùng'}</span>
            <span className="text-[11px] text-[#74777d] mt-0.5">{ROLE_LABELS[user?.role ?? 'admin']}</span>
          </div>

          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative flex items-center justify-center rounded-full hover:opacity-80 transition-opacity group flex-shrink-0 shadow-sm"
            title="Đổi ảnh đại diện"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#041627' }}>
                {getInitials(user?.fullName)}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={14} className="text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
