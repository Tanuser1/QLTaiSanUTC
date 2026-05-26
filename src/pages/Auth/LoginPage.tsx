/**
 * pages/Auth/LoginPage.tsx
 * Đăng nhập thật — gọi API backend qua useAuth hook.
 */
import React from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import LoginForm from '../../components/forms/LoginForm';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (tenDangNhap: string, matKhau: string) => {
    await login(tenDangNhap, matKhau);
  };

  return (
    <AuthLayout>
      <div className="mb-10 flex flex-col items-center lg:items-start">
        <h2 className="font-manrope text-3xl font-bold text-[#1f305e] text-center lg:text-left tracking-tight">
          Hệ thống Quản lý Tài sản
        </h2>
      </div>

      {/* Hiển thị lỗi từ backend hoặc lỗi network */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <LoginForm onLogin={handleLogin} isLoading={isLoading} />

      <div className="mt-10 flex flex-col items-center">
        <p className="text-sm text-[#4f6073]">
          Cần hỗ trợ?{' '}
          <a href="mailto:support@utc.edu.vn" className="text-[#1f305e] hover:underline font-medium">
            Liên hệ quản trị viên
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
