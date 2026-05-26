import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

interface LoginFormProps {
  onLogin?: (tenDangNhap: string, matKhau: string) => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading = false }) => {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{ tenDangNhap?: string; matKhau?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!tenDangNhap.trim()) next.tenDangNhap = 'Vui lòng nhập tên đăng nhập';
    if (!matKhau)            next.matKhau     = 'Vui lòng nhập mật khẩu';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    onLogin?.(tenDangNhap.trim(), matKhau);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

      {/* Tên đăng nhập */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-username" className="text-xs font-semibold text-[#44474c] tracking-wide">
          Tên đăng nhập <span className="text-[#ba1a1a]">*</span>
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] pointer-events-none" />
          <input
            id="login-username"
            type="text"
            value={tenDangNhap}
            autoComplete="username"
            onChange={(e) => { setTenDangNhap(e.target.value); setErrors((p) => ({ ...p, tenDangNhap: undefined })); }}
            placeholder="adminutc"
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-lg border bg-white text-[#191c1d] placeholder:text-[#a0a3aa] outline-none transition-all
              ${errors.tenDangNhap
                ? 'border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]'
                : 'border-[#c4c6cd] focus:border-[#1f305e] focus:ring-1 focus:ring-[#1f305e]'}`}
          />
        </div>
        {errors.tenDangNhap && (
          <span className="text-xs text-[#ba1a1a] flex items-center gap-1">
            <AlertCircle size={12} /> {errors.tenDangNhap}
          </span>
        )}
      </div>

      {/* Mật khẩu */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="text-xs font-semibold text-[#44474c] tracking-wide">
          Mật khẩu <span className="text-[#ba1a1a]">*</span>
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] pointer-events-none" />
          <input
            id="login-password"
            type={showPass ? 'text' : 'password'}
            value={matKhau}
            autoComplete="current-password"
            onChange={(e) => { setMatKhau(e.target.value); setErrors((p) => ({ ...p, matKhau: undefined })); }}
            placeholder="••••••••"
            className={`w-full pl-10 pr-10 py-3 text-sm rounded-lg border bg-white text-[#191c1d] placeholder:text-[#a0a3aa] outline-none transition-all
              ${errors.matKhau
                ? 'border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]'
                : 'border-[#c4c6cd] focus:border-[#1f305e] focus:ring-1 focus:ring-[#1f305e]'}`}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777d] hover:text-[#191c1d] transition-colors"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.matKhau && (
          <span className="text-xs text-[#ba1a1a] flex items-center gap-1">
            <AlertCircle size={12} /> {errors.matKhau}
          </span>
        )}
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 rounded border-[#c4c6cd] accent-[#1f305e]" />
          <span className="text-sm font-medium text-[#44474c]">Ghi nhớ đăng nhập</span>
        </label>
        <a href="#" className="text-sm text-[#1f305e] hover:underline font-medium">Quên mật khẩu?</a>
      </div>

      <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full mt-4 bg-[#1f305e] hover:bg-[#162447] text-white py-3.5 rounded-lg font-semibold text-base transition-colors border-none shadow-sm">
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  );
};

export default LoginForm;
