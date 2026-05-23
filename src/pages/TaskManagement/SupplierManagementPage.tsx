import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Phone, Mail, MapPin,
  Plus, Pencil, Trash2, Search, X, AlertCircle, Package,
} from 'lucide-react';
import { nhaCungCapService } from '../../services/nhaCungCapService';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import type { Supplier, SupplierFormData } from '../../types/Supplier';

/* ─── helpers ─────────────────────────────────────────────────────── */
const EMPTY_FORM: SupplierFormData = {
  TenNCC: '', Email: '', SoDienThoai: '', DiaChi: '', ThongTinHoTro: '', TrangThai: 1,
};

/* ─── SupplierModal ────────────────────────────────────────────────── */
const SupplierModal: React.FC<{
  mode:    'add' | 'edit';
  initial?: Supplier;
  onClose: () => void;
  onSaved: () => void;
}> = ({ mode, initial, onClose, onSaved }) => {
  const [form, setForm] = useState<SupplierFormData>(
    initial
      ? {
          TenNCC:        initial.name,
          Email:         initial.email        ?? '',
          SoDienThoai:   initial.phone        ?? '',
          DiaChi:        initial.address      ?? '',
          ThongTinHoTro: initial.supportInfo  ?? '',
          TrangThai:     initial.isActive ? 1 : 0,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  const set = (key: keyof SupplierFormData, val: string | number) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      if (mode === 'add')  await nhaCungCapService.create(form);
      else                 await nhaCungCapService.update(initial!.id, form);
      onSaved();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e] outline-none transition-all';
  const labelCls = 'text-xs font-semibold text-[#44474c]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        style={{ boxShadow: '0px 16px 40px rgba(0,0,0,0.22)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#e8eaf6,#c5cae9)' }}>
              <Building2 size={17} style={{ color: '#1a237e' }} />
            </div>
            <div>
              <h2 className="font-bold text-[15px] text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {mode === 'add' ? 'Thêm nhà cung cấp' : 'Chỉnh sửa nhà cung cấp'}
              </h2>
              {initial && <p className="text-[11px] text-[#74777d]">{initial.name}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form id="ncc-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">

          {/* Tên NCC */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Tên nhà cung cấp <span className="text-[#ba1a1a]">*</span></label>
            <input
              type="text" required value={form.TenNCC} placeholder="VD: Dell Technologies Việt Nam"
              onChange={e => set('TenNCC', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Email + SĐT */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ea3aa]" />
                <input
                  type="email" value={form.Email} placeholder="contact@ncc.com"
                  onChange={e => set('Email', e.target.value)}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Số điện thoại</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ea3aa]" />
                <input
                  type="tel" value={form.SoDienThoai} placeholder="1800 xxxx"
                  onChange={e => set('SoDienThoai', e.target.value)}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Địa chỉ</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-[#9ea3aa]" />
              <input
                type="text" value={form.DiaChi} placeholder="Số nhà, đường, quận, tỉnh/thành phố"
                onChange={e => set('DiaChi', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>

          {/* Thông tin hỗ trợ */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Thông tin hỗ trợ / Bảo hành</label>
            <textarea
              rows={3} value={form.ThongTinHoTro}
              placeholder="VD: Bảo hành 24 tháng, hỗ trợ kỹ thuật 24/7 qua hotline..."
              onChange={e => set('ThongTinHoTro', e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Trạng thái */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Trạng thái</label>
            <select
              value={form.TrangThai}
              onChange={e => set('TrangThai', Number(e.target.value))}
              className={`${inputCls} bg-white`}
            >
              <option value={1}>Đang hoạt động</option>
              <option value={0}>Ngừng hoạt động</option>
            </select>
          </div>

          {err && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#ffebee] text-[#ba1a1a] text-sm">
              <AlertCircle size={15} /> {err}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e1e3e4] bg-[#f8f9fa] rounded-b-xl shrink-0">
          <button
            type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-[#c4c6cd] text-[#44474c] bg-white hover:bg-[#f3f4f5] transition-colors"
          >
            Huỷ
          </button>
          <button
            type="submit" form="ncc-form" disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: saving ? '#9fa8da' : '#1a237e' }}
          >
            {saving ? 'Đang lưu...' : '💾 Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── SupplierManagementPage ───────────────────────────────────────── */
const SupplierManagementPage: React.FC = () => {
  const [all,      setAll]      = useState<Supplier[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [search,   setSearch]   = useState('');

  const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; item?: Supplier }>({
    open: false, mode: 'add',
  });
  const [deleting, setDeleting] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    nhaCungCapService.getAll()
      .then(setAll)
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* Client-side search filter */
  const suppliers = all.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.email  ?? '').toLowerCase().includes(q) ||
      (s.phone  ?? '').includes(q) ||
      (s.address ?? '').toLowerCase().includes(q)
    );
  });

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await nhaCungCapService.deleteById(deleting.id);
      setDeleting(null);
      fetchAll();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally { setIsDeleting(false); }
  };

  /* ── Table column widths ── */
  const th = 'px-4 py-3 text-left text-[11px] font-semibold text-white uppercase tracking-wider whitespace-nowrap';
  const td = 'px-4 py-3 text-sm text-[#44474c] align-top';

  return (
    <div className="flex-1 p-8 flex flex-col gap-5 min-h-0">

      {/* ── Page header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#1a237e,#3949ab)' }}
        >
          <Building2 size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Nhà cung cấp
          </h1>
          <p className="text-sm text-[#74777d] mt-0.5">Quản lý danh sách nhà cung cấp thiết bị</p>
        </div>
      </div>

      {/* ── Table card ── */}
      <div
        className="bg-white rounded-xl border border-[#e1e3e4] flex flex-col flex-1 min-h-0"
        style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e1e3e4]">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d]" />
            <input
              type="text" value={search} placeholder="Tìm kiếm tên, email, SĐT..."
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#c4c6cd] rounded-lg bg-[#f3f4f5] focus:bg-white focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e] outline-none transition-all"
            />
          </div>

          <div className="text-sm text-[#74777d]">
            {isLoading ? 'Đang tải...' : `${suppliers.length} nhà cung cấp`}
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setModal({ open: true, mode: 'add' })}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#1a237e' }}
          >
            <Plus size={15} /> Thêm NCC
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse" style={{ minWidth: '900px' }}>
            <thead>
              <tr style={{ backgroundColor: '#00796b' }}>
                <th className={`${th} w-14 text-center`}>STT</th>
                <th className={th}>Tên nhà cung cấp</th>
                <th className={th}>Email</th>
                <th className={th}>Số điện thoại</th>
                <th className={th}>Địa chỉ</th>
                <th className={th}>Hỗ trợ / BH</th>
                <th className={`${th} text-center`}>Số TB</th>
                <th className={th}>Trạng thái</th>
                <th className={`${th} text-center`}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#e1e3e4] animate-pulse">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-[#e8eaed] rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Package size={36} className="mx-auto mb-3 text-[#c4c6cd]" />
                    <p className="text-sm text-[#74777d]">
                      {search ? 'Không tìm thấy nhà cung cấp phù hợp' : 'Chưa có nhà cung cấp nào'}
                    </p>
                  </td>
                </tr>
              ) : (
                suppliers.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="border-b border-[#e1e3e4] last:border-0 hover:bg-[#fafbff] transition-colors"
                  >
                    {/* STT */}
                    <td className="px-4 py-3 text-center text-sm text-[#74777d] tabular-nums">{idx + 1}</td>

                    {/* Tên NCC */}
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: '#e8eaf6' }}
                        >
                          <Building2 size={14} style={{ color: '#3949ab' }} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#191c1d] text-[13px]">{s.name}</p>
                          {s.createdAt && (
                            <p className="text-[11px] text-[#9ea3aa]">
                              Từ {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className={td}>
                      {s.email
                        ? <a href={`mailto:${s.email}`} className="text-[#1a237e] hover:underline truncate block max-w-[180px]">{s.email}</a>
                        : <span className="text-[#c4c6cd]">—</span>
                      }
                    </td>

                    {/* SĐT */}
                    <td className={td}>
                      {s.phone
                        ? <span className="font-mono text-[#191c1d]">{s.phone}</span>
                        : <span className="text-[#c4c6cd]">—</span>
                      }
                    </td>

                    {/* Địa chỉ */}
                    <td className={td}>
                      <span className="line-clamp-2 max-w-[180px]" title={s.address ?? ''}>
                        {s.address ?? <span className="text-[#c4c6cd]">—</span>}
                      </span>
                    </td>

                    {/* Hỗ trợ / BH */}
                    <td className={td}>
                      <span className="line-clamp-2 max-w-[160px] text-xs" title={s.supportInfo ?? ''}>
                        {s.supportInfo ?? <span className="text-[#c4c6cd]">—</span>}
                      </span>
                    </td>

                    {/* Số TB */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                        style={
                          s.assetCount > 0
                            ? { backgroundColor: 'rgba(26,35,126,0.1)', color: '#1a237e' }
                            : { backgroundColor: '#f3f4f5', color: '#9ea3aa' }
                        }
                      >
                        {s.assetCount}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className={td}>
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={
                          s.isActive
                            ? { backgroundColor: 'rgba(38,166,154,0.12)', color: '#1b8a80' }
                            : { backgroundColor: 'rgba(116,119,125,0.12)', color: '#5a5f6b' }
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: s.isActive ? '#26a69a' : '#9e9e9e' }}
                        />
                        {s.isActive ? 'Đang HĐ' : 'Ngừng HĐ'}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setModal({ open: true, mode: 'edit', item: s })}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#1a237e] text-[#1a237e] hover:bg-[#e8eaf6] transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={12} /> Sửa
                        </button>
                        <button
                          onClick={() => setDeleting(s)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#ef5350] text-[#ef5350] hover:bg-[#ffebee] transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={12} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!isLoading && suppliers.length > 0 && (
          <div className="px-5 py-3 border-t border-[#e1e3e4] bg-[#f8f9fa] rounded-b-xl">
            <p className="text-xs text-[#74777d]">
              Hiển thị {suppliers.length} / {all.length} nhà cung cấp
              {search && ` (đang lọc theo "${search}")`}
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal.open && (
        <SupplierModal
          mode={modal.mode}
          initial={modal.item}
          onClose={() => setModal(m => ({ ...m, open: false }))}
          onSaved={() => { setModal(m => ({ ...m, open: false })); fetchAll(); }}
        />
      )}

      <ConfirmModal
        isOpen={!!deleting}
        title="Xóa nhà cung cấp"
        message={
          deleting?.assetCount
            ? `"${deleting.name}" đang có ${deleting.assetCount} thiết bị. Bạn có chắc muốn xóa?`
            : `Bạn có chắc muốn xóa "${deleting?.name}"? Thao tác này không thể hoàn tác.`
        }
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default SupplierManagementPage;
