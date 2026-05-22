import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

export interface RegisterFormData {
  hoTen: string;
  email: string;
  soDienThoai: string;
  matKhau: string;
  xacNhanMatKhau: string;
}

interface RegisterFormProps {
  onRegister?: (data: RegisterFormData) => void | Promise<void>;
  isLoading?: boolean;
}

interface FormErrors {
  hoTen?: string;
  email?: string;
  soDienThoai?: string;
  matKhau?: string;
  xacNhanMatKhau?: string;
}

// Kiểm tra mật khẩu đủ mạnh (ít nhất 8 ký tự, có chữ hoa, chữ thường, số)
function checkPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak';
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (score <= 2) return 'weak';
  if (score === 3) return 'medium';
  return 'strong';
}

const strengthConfig = {
  weak:   { label: 'Yếu',  color: '#ba1a1a', width: '33%'  },
  medium: { label: 'Trung bình', color: '#f59e0b', width: '66%'  },
  strong: { label: 'Mạnh', color: '#16a34a', width: '100%' },
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, isLoading = false }) => {
  const [form, setForm] = useState<RegisterFormData>({
    hoTen: '',
    email: '',
    soDienThoai: '',
    matKhau: '',
    xacNhanMatKhau: '',
  });
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]         = useState<FormErrors>({});

  const setField = (field: keyof RegisterFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.hoTen.trim())
      newErrors.hoTen = 'Vui lòng nhập họ và tên';
    else if (form.hoTen.trim().length < 2)
      newErrors.hoTen = 'Họ tên phải có ít nhất 2 ký tự';

    if (!form.email.trim())
      newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Email không hợp lệ';

    if (form.soDienThoai && !/^(0|\+84)\d{9}$/.test(form.soDienThoai.replace(/\s/g, '')))
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ (VD: 0912345678)';

    if (!form.matKhau)
      newErrors.matKhau = 'Vui lòng nhập mật khẩu';
    else if (form.matKhau.length < 8)
      newErrors.matKhau = 'Mật khẩu phải có ít nhất 8 ký tự';

    if (!form.xacNhanMatKhau)
      newErrors.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu';
    else if (form.xacNhanMatKhau !== form.matKhau)
      newErrors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onRegister?.(form);
  };

  const strength = form.matKhau ? checkPasswordStrength(form.matKhau) : null;

  // Class input tái sử dụng (giống LoginForm)
  const inputClass = (hasError?: string) =>
    `w-full py-2.5 text-sm rounded border bg-white text-[#191c1d] placeholder:text-[#74777d] outline-none transition-all
     ${hasError
       ? 'border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]'
       : 'border-[#c4c6cd] focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a]'}`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

      {/* ── Họ và tên ── */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-name" className="text-xs font-semibold text-[#44474c] tracking-wide">
          Họ và tên <span className="text-[#ba1a1a]">*</span>
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] pointer-events-none" />
          <input
            id="reg-name"
            type="text"
            value={form.hoTen}
            autoComplete="name"
            onChange={(e) => setField('hoTen', e.target.value)}
            placeholder="Nguyễn Văn A"
            className={`${inputClass(errors.hoTen)} pl-10 pr-4`}
          />
        </div>
        {errors.hoTen && (
          <span className="text-xs text-[#ba1a1a] flex items-center gap-1">
            <AlertCircle size={12} /> {errors.hoTen}
          </span>
        )}
      </div>

      {/* ── Email ── */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-xs font-semibold text-[#44474c] tracking-wide">
          Email <span className="text-[#ba1a1a]">*</span>
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] pointer-events-none" />
          <input
            id="reg-email"
            type="email"
            value={form.email}
            autoComplete="email"
            onChange={(e) => setField('email', e.target.value)}
            placeholder="example@utc.edu.vn"
            className={`${inputClass(errors.email)} pl-10 pr-4`}
          />
        </div>
        {errors.email && (
          <span className="text-xs text-[#ba1a1a] flex items-center gap-1">
            <AlertCircle size={12} /> {errors.email}
          </span>
        )}
      </div>

      {/* ── Số điện thoại (tùy chọn) ── */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-phone" className="text-xs font-semibold text-[#44474c] tracking-wide">
          Số điện thoại
          <span className="ml-1 font-normal text-[#74777d]">(tùy chọn)</span>
        </label>
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] pointer-events-none" />
          <input
            id="reg-phone"
            type="tel"
            value={form.soDienThoai}
            autoComplete="tel"
            onChange={(e) => setField('soDienThoai', e.target.value)}
            placeholder="0912 345 678"
            className={`${inputClass(errors.soDienThoai)} pl-10 pr-4`}
          />
        </div>
        {errors.soDienThoai && (
          <span className="text-xs text-[#ba1a1a] flex items-center gap-1">
            <AlertCircle size={12} /> {errors.soDienThoai}
          </span>
        )}
      </div>

      {/* ── Mật khẩu ── */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-xs font-semibold text-[#44474c] tracking-wide">
          Mật khẩu <span className="text-[#ba1a1a]">*</span>
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] pointer-events-none" />
          <input
            id="reg-password"
            type={showPass ? 'text' : 'password'}
            value={form.matKhau}
            autoComplete="new-password"
            onChange={(e) => setField('matKhau', e.target.value)}
            placeholder="••••••••"
            className={`${inputClass(errors.matKhau)} pl-10 pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777d] hover:text-[#191c1d] transition-colors"
            aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Thanh độ mạnh mật khẩu */}
        {form.matKhau && strength && (
          <div className="flex flex-col gap-1 mt-0.5">
            <div className="h-1 w-full rounded-full overflow-hidden bg-[#e1e3e4]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: strengthConfig[strength].width,
                  backgroundColor: strengthConfig[strength].color,
                }}
              />
            </div>
            <span className="text-[11px] font-medium" style={{ color: strengthConfig[strength].color }}>
              Độ mạnh: {strengthConfig[strength].label}
            </span>
          </div>
        )}

        {errors.matKhau && (
          <span className="text-xs text-[#ba1a1a] flex items-center gap-1">
            <AlertCircle size={12} /> {errors.matKhau}
          </span>
        )}
      </div>

      {/* ── Xác nhận mật khẩu ── */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-confirm" className="text-xs font-semibold text-[#44474c] tracking-wide">
          Xác nhận mật khẩu <span className="text-[#ba1a1a]">*</span>
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] pointer-events-none" />
          <input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            value={form.xacNhanMatKhau}
            autoComplete="new-password"
            onChange={(e) => setField('xacNhanMatKhau', e.target.value)}
            placeholder="••••••••"
            className={`${inputClass(errors.xacNhanMatKhau)} pl-10 pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777d] hover:text-[#191c1d] transition-colors"
            aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          {/* Tick xanh khi khớp */}
          {form.xacNhanMatKhau && form.xacNhanMatKhau === form.matKhau && (
            <CheckCircle2
              size={16}
              className="absolute right-9 top-1/2 -translate-y-1/2 text-[#16a34a]"
            />
          )}
        </div>
        {errors.xacNhanMatKhau && (
          <span className="text-xs text-[#ba1a1a] flex items-center gap-1">
            <AlertCircle size={12} /> {errors.xacNhanMatKhau}
          </span>
        )}
      </div>

      {/* ── Submit ── */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        className="w-full mt-1"
      >
        {isLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
      </Button>
    </form>
  );
};

export default RegisterForm;
