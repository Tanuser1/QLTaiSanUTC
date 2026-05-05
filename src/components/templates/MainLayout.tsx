import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import { Header } from '../organisms/Header';

interface MainLayoutProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ title, breadcrumbs, children }) => {
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

export default MainLayout;
