/**
 * pages/Auth/LoginPage.tsx
 * Đăng nhập thật — gọi API backend qua useAuth hook.
 *
 * FIX: Bỏ useEffect tự redirect (gây vòng lặp reload khi token mock còn trong storage).
 *      useAuth.login() tự navigate('/dashboard') sau khi login thành công.
 */
import React from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import LoginForm from '../../components/forms/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  // login() trong useAuth sẽ tự gọi navigate('/dashboard') khi thành công
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (tenDangNhap: string, matKhau: string) => {
    await login(tenDangNhap, matKhau);
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="font-manrope text-xl font-bold text-[#191c1d] mb-1">
          Đăng nhập hệ thống
        </h2>
        <p className="text-sm text-[#74777d]">
          Nhập thông tin tài khoản để tiếp tục
        </p>
      </div>

      {/* Hiển thị lỗi từ backend hoặc lỗi network */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <LoginForm onLogin={handleLogin} isLoading={isLoading} />

      <div className="mt-6 pt-5 border-t border-[#e1e3e4] flex flex-col gap-3">
        <p className="text-center text-xs text-[#74777d]">
          Cần hỗ trợ?{' '}
          <a href="mailto:support@utc.edu.vn" className="text-[#26a69a] hover:underline font-medium">
            Liên hệ quản trị viên
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
