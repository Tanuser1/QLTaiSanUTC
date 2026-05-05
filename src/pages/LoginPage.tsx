import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/templates/AuthLayout';
import LoginForm from '../components/organisms/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (_email: string, _password: string) => {
    // Bỏ qua mọi logic xác thực (auth) trong môi trường dev
    // Chuyển thẳng sang trang Dashboard ngay khi click
    navigate('/dashboard');
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

      <LoginForm onLogin={handleLogin} />

      <div className="mt-6 pt-5 border-t border-[#e1e3e4]">
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
