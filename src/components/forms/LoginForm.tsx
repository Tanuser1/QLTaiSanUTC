import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

interface LoginFormProps {
  onLogin?: (email: string, password: string) => void;
}

/**
 * LoginForm – Standalone, imports Button từ common/ (không còn từ atoms/).
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    if (onLogin) onLogin(email, password);
    else setErrors({ general: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.' });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {errors.general && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/20">
          <AlertCircle size={16} className="text-[#ba1a1a] flex-shrink-0 mt-0.5" />
          <span className="text-sm text-[#93000a]">{errors.general}</span>
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-xs font-semibold text-[#44474c] tracking-wide">
          Email <span className="text-[#ba1a1a]">*</span>
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] pointer-events-none" />
          <input
            id="login-email" type="email" value={email} autoComplete="email"
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            placeholder="admin@utc.edu.vn"
            className={`w-full pl-10 pr-4 py-2.5 text-sm rounded border bg-white text-[#191c1d] placeholder:text-[#74777d] outline-none transition-all
              ${errors.email ? 'border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]' : 'border-[#c4c6cd] focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a]'}`}
          />
        </div>
        {errors.email && <span className="text-xs text-[#ba1a1a] flex items-center gap-1"><AlertCircle size={12}/> {errors.email}</span>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="text-xs font-semibold text-[#44474c] tracking-wide">
          Mật khẩu <span className="text-[#ba1a1a]">*</span>
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] pointer-events-none" />
          <input
            id="login-password" type={showPass ? 'text' : 'password'} value={password} autoComplete="current-password"
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
            placeholder="••••••••"
            className={`w-full pl-10 pr-10 py-2.5 text-sm rounded border bg-white text-[#191c1d] placeholder:text-[#74777d] outline-none transition-all
              ${errors.password ? 'border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]' : 'border-[#c4c6cd] focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a]'}`}
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777d] hover:text-[#191c1d] transition-colors">
            {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>
        </div>
        {errors.password && <span className="text-xs text-[#ba1a1a] flex items-center gap-1"><AlertCircle size={12}/> {errors.password}</span>}
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 rounded border-[#c4c6cd] accent-[#26a69a]"/>
          <span className="text-sm text-[#44474c]">Ghi nhớ đăng nhập</span>
        </label>
        <a href="#" className="text-sm text-[#26a69a] hover:underline font-medium">Quên mật khẩu?</a>
      </div>

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-1">
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  );
};

export default LoginForm;
