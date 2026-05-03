import React from 'react';
import { Package } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #041627 0%, #1a2b3c 40%, #002957 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #26a69a 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #5291ef 0%, transparent 70%)' }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #26a69a 0%, #006a62 100%)',
              boxShadow: '0px 8px 24px rgba(38, 166, 154, 0.4)',
            }}
          >
            <Package size={28} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold font-manrope tracking-tight">
            Quản lý Tài sản
          </h1>
          <p className="text-[#8192a7] text-sm mt-1">
            Trường Đại học Giao thông vận tải
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-2xl p-8"
          style={{ boxShadow: '0px 24px 48px rgba(0,0,0,0.3)' }}
        >
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[#4f6073] text-xs mt-6">
          © 2026 UTC Asset Management System 
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
