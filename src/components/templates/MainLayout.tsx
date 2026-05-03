import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import { Bell, Search, ChevronDown } from 'lucide-react';

interface MainLayoutProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ title, breadcrumbs, children }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <Sidebar />

      {/* ── TOP BAR ── */}
      <header
        className="fixed top-0 right-0 z-20 flex items-center gap-4 px-6"
        style={{
          left: '260px',
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Page title / breadcrumbs */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 mb-0.5">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-[#90a4ae] text-[10px]">/</span>}
                  <a
                    href={crumb.href ?? '#'}
                    className="text-[11px] text-[#90a4ae] hover:text-[#1a237e] transition-colors"
                  >
                    {crumb.label}
                  </a>
                </React.Fragment>
              ))}
            </nav>
          )}
          {title && (
            <h1
              className="text-[15px] font-bold text-[#1a237e] truncate leading-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {title}
            </h1>
          )}
        </div>

        {/* Search */}
        <div className="relative hidden md:flex items-center" style={{ width: '280px' }}>
          <Search size={15} className="absolute left-3 text-[#90a4ae] pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg outline-none transition-all"
            style={{
              backgroundColor: '#f3f4f5',
              border: '1px solid #e0e0e0',
              color: '#1a237e',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#303f9f'; e.currentTarget.style.backgroundColor = '#fff'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.backgroundColor = '#f3f4f5'; }}
          />
        </div>

        {/* Notification */}
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: '#546e7a' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f3f4f5'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ backgroundColor: '#ef5350' }}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-6" style={{ backgroundColor: '#e0e0e0' }} />

        {/* User */}
        <button
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f3f4f5'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #303f9f, #1a237e)' }}
          >
            AD
          </div>
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-semibold" style={{ color: '#1a237e', fontFamily: 'Inter, sans-serif' }}>Admin UTC</span>
            <span className="text-[10px]" style={{ color: '#90a4ae' }}>Quản trị viên</span>
          </div>
          <ChevronDown size={14} style={{ color: '#90a4ae' }} />
        </button>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          marginLeft: '260px',
          marginTop: '64px',
          minHeight: 'calc(100vh - 64px)',
          padding: '24px',
          backgroundColor: '#f0f2f5',
        }}
      >
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;
