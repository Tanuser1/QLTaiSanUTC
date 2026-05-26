import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * AuthLayout – Layout đăng nhập chia đôi màn hình (Split-screen).
 * Trái: Ảnh nền + Logo UTC.
 * Phải: Form đăng nhập.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Cột trái: Nền và Logo (Ẩn trên mobile) */}
      <div 
        className="relative hidden lg:flex flex-col w-1/2 bg-cover bg-center" 
        style={{ backgroundImage: "url('/images/bg-login.jpg')" }}
      >
        {/* Lớp phủ màu xanh đen trong suốt */}
        <div className="absolute inset-0 bg-[#162a4a]/85" />
        
        {/* Nội dung Logo */}
        <div className="relative flex flex-col items-center justify-center w-full h-full text-white p-8">
          <img 
            src="/images/logo.png" 
            alt="UTC Logo" 
            className="w-56 h-56 mb-8 object-contain drop-shadow-lg" 
          />
          <h1 className="text-3xl font-bold tracking-wide text-center" style={{ fontFamily: 'sans-serif' }}>
            TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI
          </h1>
        </div>
      </div>

      {/* Cột phải: Form Đăng nhập */}
      <div className="flex flex-col justify-between w-full lg:w-1/2 p-8 md:p-16 relative bg-white overflow-y-auto">
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[#4f6073] text-sm mt-8 pb-4">
          © 2026 UTC Asset Management System
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
