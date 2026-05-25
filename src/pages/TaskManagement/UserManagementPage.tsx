import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, RefreshCw, Plus, Lock, Unlock,
  ChevronLeft, ChevronRight, X, Eye, EyeOff,
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { userService } from '../../services/userService';
import type { ApiUser } from '../../types/User';

/* ── Helpers ── */
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return 'Vừa xong';
  if (mins < 60)  return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days  = Math.floor(hours / 24);
  if (days  < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  admin:      { label: 'Admin',      color: '#dc2626', bg: '#fee2e2' },
  bgh:        { label: 'BGH',        color: '#ea580c', bg: '#ffedd5' },
  technician: { label: 'Kỹ thuật',  color: '#2563eb', bg: '#dbeafe' },
  teacher:    { label: 'Giáo viên', color: '#16a34a', bg: '#dcfce7' },
};

const ROLE_OPTIONS = [
  { value: 'Admin',    label: 'Admin' },
  { value: 'BGH',      label: 'BGH' },
  { value: 'KyThuat',  label: 'Kỹ thuật' },
  { value: 'GiaoVien', label: 'Giáo viên' },
];

/* ── Add User Modal ── */
interface AddForm {
  HoTen: string; TenDangNhap: string; MatKhau: string;
  VaiTro: string; MaKhoa: string; Email: string; SoDienThoai: string;
}
const EMPTY_FORM: AddForm = {
  HoTen: '', TenDangNhap: '', MatKhau: '',
  VaiTro: 'GiaoVien', MaKhoa: '', Email: '', SoDienThoai: '',
};

interface Dept { id: number; name: string }

const AddUserModal: React.FC<{ onClose: () => void; onSaved: () => void }> = ({ onClose, onSaved }) => {
  const [form, setForm]     = useState<AddForm>(EMPTY_FORM);
  const [depts, setDepts]   = useState<Dept[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    apiClient.get('/khoa')
      .then(r => setDepts((r.data.data as Dept[]) ?? []))
      .catch(() => {});
  }, []);

  const set = (k: keyof AddForm, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.HoTen.trim() || !form.TenDangNhap.trim() || !form.MatKhau.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await userService.create({
        HoTen:       form.HoTen.trim(),
        TenDangNhap: form.TenDangNhap.trim(),
        MatKhau:     form.MatKhau,
        VaiTro:      form.VaiTro,
        MaKhoa:      form.MaKhoa ? Number(form.MaKhoa) : undefined,
        Email:       form.Email.trim()       || undefined,
        SoDienThoai: form.SoDienThoai.trim() || undefined,
      });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none transition-colors';
  const labelCls = 'block text-xs font-semibold text-[#44474c] mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: '90vh', boxShadow: '0px 12px 40px rgba(0,0,0,0.22)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(38,166,154,0.1)' }}>
              <Users size={18} className="text-[#26a69a]" />
            </div>
            <div>
              <h2 className="font-manrope font-bold text-base text-[#191c1d] leading-tight">Thêm người dùng</h2>
              <p className="text-xs text-[#74777d]">Tạo tài khoản mới trong hệ thống</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className={labelCls}>Họ tên <span className="text-[#ba1a1a]">*</span></label>
            <input type="text" value={form.HoTen} onChange={e => set('HoTen', e.target.value)} placeholder="Nguyễn Văn A" required className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tên đăng nhập <span className="text-[#ba1a1a]">*</span></label>
              <input type="text" value={form.TenDangNhap} onChange={e => set('TenDangNhap', e.target.value)} placeholder="nguyenvana" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mật khẩu <span className="text-[#ba1a1a]">*</span></label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.MatKhau}
                  onChange={e => set('MatKhau', e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  minLength={6}
                  className={inputCls + ' pr-9'}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#74777d] hover:text-[#44474c]">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Vai trò</label>
              <select value={form.VaiTro} onChange={e => set('VaiTro', e.target.value)} className={inputCls}>
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Khoa / Đơn vị</label>
              <select value={form.MaKhoa} onChange={e => set('MaKhoa', e.target.value)} className={inputCls}>
                <option value="">— Chưa phân công —</option>
                {depts.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={form.Email} onChange={e => set('Email', e.target.value)} placeholder="vd@utc.edu.vn" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Số điện thoại</label>
              <input type="tel" value={form.SoDienThoai} onChange={e => set('SoDienThoai', e.target.value)} placeholder="0912345678" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e1e3e4] bg-[#f8f9fa] rounded-b-xl flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#44474c] border border-[#c4c6cd] rounded-lg hover:bg-[#f3f4f5] transition-colors">
            Huỷ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-opacity"
            style={{ backgroundColor: '#26a69a', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Đang lưu...' : 'Tạo tài khoản'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════ */
const UserManagementPage: React.FC = () => {
  const [users,       setUsers]       = useState<ApiUser[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [limit]                       = useState(20);
  const [keyword,     setKeyword]     = useState('');
  const [filterRole,  setFilterRole]  = useState('');
  const [filterStatus,setFilterStatus]= useState('');
  const [showAdd,     setShowAdd]     = useState(false);
  const [togglingId,  setTogglingId]  = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchData = useCallback(() => {
    setLoading(true);
    userService.getAll({
      keyword:   keyword || undefined,
      VaiTro:    filterRole   || undefined,
      TrangThai: filterStatus !== '' ? filterStatus : undefined,
      page,
      limit,
    })
      .then(res => { setUsers(res.items); setTotal(res.pagination.total); })
      .catch(() => { setUsers([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [keyword, filterRole, filterStatus, page, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (q: string) => { setKeyword(q); setPage(1); };
  const handleRoleFilter = (v: string) => { setFilterRole(v); setPage(1); };
  const handleStatusFilter = (v: string) => { setFilterStatus(v); setPage(1); };

  const handleToggle = async (user: ApiUser) => {
    setTogglingId(user.id);
    try {
      await userService.toggleStatus(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setTogglingId(null);
    }
  };

  /* ── Page button list ── */
  const pageButtons: (number | '…')[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const around = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages));
    const sorted = Array.from(around).sort((a, b) => a - b);
    const result: (number | '…')[] = [];
    sorted.forEach((p, i) => { if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push('…'); result.push(p); });
    return result;
  })();

  return (
    <div className="flex-1 p-8 flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(38,166,154,0.1)' }}>
            <Users size={20} className="text-[#26a69a]" />
          </div>
          <div>
            <h1 className="font-manrope font-bold text-xl text-[#191c1d]">Quản lý người dùng</h1>
            <p className="text-xs text-[#74777d]">Tổng cộng {total.toLocaleString('vi-VN')} tài khoản</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#44474c] border border-[#c4c6cd] hover:bg-[#f3f4f5] transition-colors"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#26a69a' }}
          >
            <Plus size={14} />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>

        {/* Toolbar */}
        <div className="px-5 py-3.5 border-b border-[#f3f4f5] flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex items-center min-w-[220px] flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 text-[#74777d] pointer-events-none" />
            <input
              type="text"
              value={keyword}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Tìm tên, username, email..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-[#c4c6cd] rounded-lg bg-[#f8f9fa] focus:bg-white focus:border-[#26a69a] outline-none transition-colors"
            />
          </div>

          {/* Role filter */}
          <select
            value={filterRole}
            onChange={e => handleRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#26a69a] outline-none"
          >
            <option value="">Tất cả vai trò</option>
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => handleStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#26a69a] outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Hoạt động</option>
            <option value="0">Bị khóa</option>
          </select>

          <span className="ml-auto text-xs text-[#74777d]">{total} người dùng</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm" style={{ minWidth: '900px' }}>
            <thead>
              <tr className="border-b border-[#00695c] text-xs font-semibold text-white uppercase tracking-wide" style={{ backgroundColor: '#00796b' }}>
                <th className="px-4 py-3 text-center w-10">STT</th>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">Tên đăng nhập</th>
                <th className="px-4 py-3 text-center">Vai trò</th>
                <th className="px-4 py-3 text-left">Khoa</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">SĐT</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-left">Đăng nhập cuối</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#f3f4f5] animate-pulse">
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-[#e1e3e4] rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-sm text-[#74777d]">Không có dữ liệu</td>
                </tr>
              ) : users.map((user, i) => {
                const badge = ROLE_BADGE[user.role] ?? { label: user.roleRaw, color: '#44474c', bg: '#f3f4f5' };
                const toggling = togglingId === user.id;

                return (
                  <tr key={user.id} className="border-b border-[#f3f4f5] hover:bg-[#fafafa] transition-colors">
                    {/* STT */}
                    <td className="px-4 py-3 text-center text-xs text-[#74777d]">
                      {(page - 1) * limit + i + 1}
                    </td>

                    {/* Họ tên */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: badge.bg, color: badge.color }}
                        >
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#191c1d] whitespace-nowrap">{user.fullName}</span>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-4 py-3 font-mono text-xs text-[#44474c]">{user.username}</td>

                    {/* Vai trò */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Khoa */}
                    <td className="px-4 py-3 text-sm text-[#44474c] whitespace-nowrap">
                      {user.departmentName ?? <span className="text-[#c4c6cd]">—</span>}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-sm text-[#44474c] max-w-[180px] truncate">
                      {user.email ?? <span className="text-[#c4c6cd]">—</span>}
                    </td>

                    {/* SĐT */}
                    <td className="px-4 py-3 text-sm text-[#44474c] whitespace-nowrap">
                      {user.phone ?? <span className="text-[#c4c6cd]">—</span>}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3 text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#15803d]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#dc2626]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                          Bị khóa
                        </span>
                      )}
                    </td>

                    {/* Đăng nhập cuối */}
                    <td className="px-4 py-3 text-xs text-[#74777d] whitespace-nowrap">
                      {timeAgo(user.lastLogin)}
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(user)}
                        disabled={toggling}
                        title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50"
                        style={user.isActive
                          ? { color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fff5f5' }
                          : { color: '#16a34a', borderColor: '#86efac', backgroundColor: '#f0fdf4' }}
                      >
                        {toggling
                          ? <RefreshCw size={12} className="animate-spin" />
                          : user.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                        {user.isActive ? 'Khóa' : 'Mở'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#f3f4f5] bg-[#f8f9fa]">
          <span className="text-xs text-[#74777d]">
            {total === 0
              ? 'Không có dữ liệu'
              : `Hiển thị ${Math.min((page - 1) * limit + 1, total)}–${Math.min(page * limit, total)} / ${total}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded flex items-center justify-center text-[#44474c] hover:bg-[#e1e3e4] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {pageButtons.map((p, i) =>
              p === '…' ? (
                <span key={`e-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-[#74777d]">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-7 h-7 rounded text-xs flex items-center justify-center transition-colors ${p === page ? 'text-white font-semibold' : 'text-[#44474c] hover:bg-[#e1e3e4]'}`}
                  style={p === page ? { backgroundColor: '#26a69a' } : {}}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 rounded flex items-center justify-center text-[#44474c] hover:bg-[#e1e3e4] disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchData(); }}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
