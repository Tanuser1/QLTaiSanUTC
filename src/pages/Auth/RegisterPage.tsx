/**
 * pages/Auth/RegisterPage.tsx
 * Trang đăng ký tài khoản – sử dụng cùng AuthLayout với LoginPage.
 * Logic gọi API được xử lý tại đây, RegisterForm chỉ lo phần UI.
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import RegisterForm, { type RegisterFormData } from '../../components/forms/RegisterForm';
import apiClient from '../../services/apiClient';

const RegisterPage: React.FC = () => {
  const navigate  = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Gọi API đăng ký (endpoint sẽ được thêm vào backend sau)
      await apiClient.post('/auth/register', {
        HoTen:        data.hoTen,
        Email:        data.email,
        SoDienThoai:  data.soDienThoai || undefined,
        MatKhau:      data.matKhau,
      });

      // Đăng ký thành công → hiện thông báo, sau 2 giây chuyển về Login
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Tiêu đề */}
      <div className="mb-6">
        <h2 className="font-manrope text-xl font-bold text-[#191c1d] mb-1">
          Đăng ký tài khoản
        </h2>
        <p className="text-sm text-[#74777d]">
          Điền thông tin bên dưới để tạo tài khoản mới
        </p>
      </div>

      {/* Thông báo thành công */}
      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 flex items-start gap-2">
          <span className="mt-0.5">✅</span>
          <span>
            Đăng ký thành công! Đang chuyển đến trang đăng nhập...
          </span>
        </div>
      )}

      {/* Thông báo lỗi từ backend */}
      {error && !success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form đăng ký */}
      {!success && (
        <RegisterForm onRegister={handleRegister} isLoading={isLoading} />
      )}

      {/* Link quay lại đăng nhập */}
      <div className="mt-5 pt-5 border-t border-[#e1e3e4] text-center">
        <p className="text-sm text-[#74777d]">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="text-[#26a69a] hover:underline font-semibold transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
