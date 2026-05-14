import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

/**
 * AdminLayout – layout chính của ứng dụng.
 * Tương đương MainLayout (templates/MainLayout.tsx) nhưng dùng
 * Sidebar và Header từ components/layout/.
 *
 * Sidebar đọc DeviceCategoryContext (đã được wrap ở main.tsx).
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── TOP BAR ── */}
        <Header />

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
