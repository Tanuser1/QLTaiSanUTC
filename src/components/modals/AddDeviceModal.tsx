import React, { useState, useEffect } from 'react';
import { X, Package, MapPin, ShoppingCart, Cpu } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { taiSanService } from '../../services/taiSanService';
import { nhaCungCapService } from '../../services/nhaCungCapService';
import { useDeviceCategoryContext } from '../../contexts/DeviceCategoryContext';
import type { DeviceCategory } from '../../types/DeviceCategory';
import type { Supplier } from '../../types/Supplier';

/* ── Spec templates keyed by category NhomLoai (group) ── */
type SpecField = { key: string; label: string; placeholder: string };
const SPEC_TEMPLATES: Record<string, SpecField[]> = {
  ManHinh: [
    { key: 'KichThuoc',  label: 'Kích thước',    placeholder: 'VD: 24 inch' },
    { key: 'DoPhanGiai', label: 'Độ phân giải',  placeholder: 'VD: 1920×1080' },
    { key: 'TanSo',      label: 'Tần số quét',   placeholder: 'VD: 60 Hz' },
    { key: 'KetNoi',     label: 'Kết nối',        placeholder: 'VD: HDMI, VGA' },
  ],
  MayTinh: [
    { key: 'CPU',         label: 'CPU',           placeholder: 'VD: Intel Core i5-12400' },
    { key: 'RAM',         label: 'RAM',           placeholder: 'VD: 8GB DDR4' },
    { key: 'SSD',         label: 'Ổ cứng',        placeholder: 'VD: 256GB SSD' },
    { key: 'HeDieuHanh',  label: 'Hệ điều hành', placeholder: 'VD: Windows 11' },
  ],
  MayIn: [
    { key: 'LoaiIn',  label: 'Loại in',    placeholder: 'VD: Laser / Phun mực' },
    { key: 'TocDo',   label: 'Tốc độ in',  placeholder: 'VD: 30 trang/phút' },
    { key: 'KetNoi',  label: 'Kết nối',    placeholder: 'VD: USB, WiFi' },
  ],
  ThietBiMang: [
    { key: 'BandWidth', label: 'Băng thông', placeholder: 'VD: 1000 Mbps' },
    { key: 'Port',      label: 'Số cổng',    placeholder: 'VD: 8 cổng RJ45' },
    { key: 'KetNoi',   label: 'Kết nối',    placeholder: 'VD: WPA3, LAN' },
  ],
  NoiThat: [
    { key: 'KichThuoc', label: 'Kích thước', placeholder: 'VD: 60×40cm' },
    { key: 'ChatLieu',  label: 'Chất liệu',  placeholder: 'VD: Gỗ công nghiệp' },
  ],
};

const STATUS_OPTIONS = [
  { value: '1', label: 'Đang dùng' },
  { value: '2', label: 'Đang mượn' },
  { value: '3', label: 'Hỏng' },
];

/* ── Flatten category tree ── */
function flattenCats(cats: DeviceCategory[]): DeviceCategory[] {
  const result: DeviceCategory[] = [];
  const visit = (nodes: DeviceCategory[]) => {
    for (const n of nodes) {
      result.push(n);
      if (n.children?.length) visit(n.children);
    }
  };
  visit(cats);
  return result;
}

/* ── Local dropdown types ── */
interface Dept { id: number; name: string; }
interface Room { id: number; name: string; building: string; }

interface AddForm {
  TenTaiSan:       string;
  MaLoai:          string;
  TrangThai:       string;
  MaKhoa:          string;
  MaPhong:         string;
  MaNCC:           string;
  Gia:             string;
  ThoiGianBaoHanh: string;
  NgayNhap:        string;
  NamSanXuat:      string;
}

const EMPTY: AddForm = {
  TenTaiSan: '', MaLoai: '', TrangThai: '1',
  MaKhoa: '', MaPhong: '', MaNCC: '',
  Gia: '', ThoiGianBaoHanh: '', NgayNhap: '', NamSanXuat: '',
};

export interface AddDeviceModalProps {
  defaultCategoryId?: number;
  onClose: () => void;
  onSaved: () => void;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ defaultCategoryId, onClose, onSaved }) => {
  const { categories } = useDeviceCategoryContext();
  const flatCats = flattenCats(categories);

  const [form, setForm]       = useState<AddForm>({ ...EMPTY, MaLoai: defaultCategoryId ? String(defaultCategoryId) : '' });
  const [specs, setSpecs]     = useState<Record<string, string>>({});
  const [soLuong, setSoLuong] = useState(1);
  const [depts, setDepts]     = useState<Dept[]>([]);
  const [rooms, setRooms]     = useState<Room[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  /* Fetch departments + suppliers on mount */
  useEffect(() => {
    apiClient.get('/khoa')
      .then(r => setDepts((r.data.data as Dept[]) ?? []))
      .catch(() => {});
    nhaCungCapService.getAll()
      .then(setSuppliers)
      .catch(() => {});
  }, []);

  /* Fetch rooms when Khoa changes */
  useEffect(() => {
    if (!form.MaKhoa) { setRooms([]); return; }
    apiClient.get('/phong', { params: { MaKhoa: form.MaKhoa, limit: 100 } })
      .then(r => setRooms((r.data.data?.items as Room[]) ?? []))
      .catch(() => setRooms([]));
  }, [form.MaKhoa]);

  /* Reset spec values and soLuong when category changes */
  useEffect(() => {
    const cat = flatCats.find(c => String(c.id) === form.MaLoai);
    const fields = cat ? (SPEC_TEMPLATES[cat.group] ?? []) : [];
    setSpecs(Object.fromEntries(fields.map(f => [f.key, ''])));
    if (cat?.group !== 'NoiThat') setSoLuong(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.MaLoai]);

  const handleChange = (field: keyof AddForm, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'MaKhoa') next.MaPhong = '';
      return next;
    });
  };

  const selectedCat    = flatCats.find(c => String(c.id) === form.MaLoai);
  const specFields     = selectedCat ? (SPEC_TEMPLATES[selectedCat.group] ?? []) : [];
  const isNoiThat      = selectedCat?.group === 'NoiThat';

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.TenTaiSan.trim() || !form.MaLoai) return;

    setSaving(true);
    setError(null);
    try {
      const hasSpecs  = Object.values(specs).some(v => v.trim());
      const thongSo   = hasSpecs
        ? Object.fromEntries(Object.entries(specs).filter(([, v]) => v.trim()))
        : undefined;

      await taiSanService.create({
        TenTaiSan:       form.TenTaiSan.trim(),
        MaLoai:          Number(form.MaLoai),
        TrangThai:       Number(form.TrangThai),
        SoLuong:         selectedCat?.group === 'NoiThat' ? soLuong : 1,
        MaPhong:         form.MaPhong         ? Number(form.MaPhong)         : undefined,
        MaNCC:           form.MaNCC           ? Number(form.MaNCC)           : undefined,
        Gia:             form.Gia             ? Number(form.Gia)             : 0,
        ThoiGianBaoHanh: form.ThoiGianBaoHanh ? Number(form.ThoiGianBaoHanh) : undefined,
        NgayNhap:        form.NgayNhap        || undefined,
        NamSanXuat:      form.NamSanXuat      ? Number(form.NamSanXuat)      : undefined,
        ThongSoKyThuat:  thongSo,
      });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none transition-colors';
  const labelCls = 'block text-xs font-semibold text-[#44474c] mb-1.5 tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: '90vh', boxShadow: '0px 12px 40px rgba(0,0,0,0.22)' }}
      >
        {/* ── Fixed header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(38,166,154,0.1)' }}
            >
              <Package size={18} className="text-[#26a69a]" />
            </div>
            <div>
              <h2 className="font-manrope font-bold text-base text-[#191c1d] leading-tight">Thêm thiết bị mới</h2>
              <p className="text-xs text-[#74777d]">Điền đầy đủ thông tin bên dưới</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          {/* Section 1 — Thông tin cơ bản */}
          <section>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#f3f4f5]">
              <Package size={14} className="text-[#26a69a]" />
              <span className="text-sm font-bold text-[#191c1d]">Thông tin cơ bản</span>
            </div>

            <div className="mb-3">
              <label className={labelCls}>Tên thiết bị <span className="text-[#ba1a1a]">*</span></label>
              <input
                type="text"
                value={form.TenTaiSan}
                onChange={e => handleChange('TenTaiSan', e.target.value)}
                placeholder="VD: Laptop Dell Latitude 5540"
                required
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelCls}>Danh mục <span className="text-[#ba1a1a]">*</span></label>
                <select
                  value={form.MaLoai}
                  onChange={e => handleChange('MaLoai', e.target.value)}
                  required
                  className={inputCls}
                >
                  <option value="">Chọn danh mục</option>
                  {flatCats.map(c => (
                    <option key={c.id} value={String(c.id)}>
                      {c.parentId ? '  ↳ ' : ''}{c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Trạng thái</label>
                <select
                  value={form.TrangThai}
                  onChange={e => handleChange('TrangThai', e.target.value)}
                  className={inputCls}
                >
                  {STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Số lượng — chỉ hiện khi là nội thất */}
            {isNoiThat && (
              <div className="mb-3">
                <label className={labelCls}>
                  Số lượng <span className="text-[#ba1a1a]">*</span>
                  <span className="font-normal text-[#74777d] ml-1">(bộ / cái)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={soLuong}
                  onChange={e => setSoLuong(Math.max(1, parseInt(e.target.value) || 1))}
                  className={inputCls + ' w-40'}
                />
              </div>
            )}


          </section>

          {/* Section 2 — Vị trí */}
          <section>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#f3f4f5]">
              <MapPin size={14} className="text-[#26a69a]" />
              <span className="text-sm font-bold text-[#191c1d]">Vị trí</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Khoa / Đơn vị</label>
                <select
                  value={form.MaKhoa}
                  onChange={e => handleChange('MaKhoa', e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Chưa phân công —</option>
                  {depts.map(d => (
                    <option key={d.id} value={String(d.id)}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Phòng</label>
                <select
                  value={form.MaPhong}
                  onChange={e => handleChange('MaPhong', e.target.value)}
                  disabled={!form.MaKhoa || rooms.length === 0}
                  className={inputCls + (!form.MaKhoa ? ' opacity-50 cursor-not-allowed' : '')}
                >
                  <option value="">
                    {form.MaKhoa
                      ? rooms.length === 0 ? '— Không có phòng —' : '— Chọn phòng —'
                      : '— Chọn khoa trước —'}
                  </option>
                  {rooms.map(r => (
                    <option key={r.id} value={String(r.id)}>
                      {r.name}{r.building ? ` (${r.building})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Section 3 — Mua sắm */}
          <section>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#f3f4f5]">
              <ShoppingCart size={14} className="text-[#26a69a]" />
              <span className="text-sm font-bold text-[#191c1d]">Thông tin mua sắm</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Nhà cung cấp</label>
                <select
                  value={form.MaNCC}
                  onChange={e => handleChange('MaNCC', e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Không rõ —</option>
                  {suppliers.filter(s => s.isActive).map(s => (
                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Giá nhập (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={form.Gia}
                  onChange={e => handleChange('Gia', e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Bảo hành (tháng)</label>
                <input
                  type="number"
                  min="0"
                  value={form.ThoiGianBaoHanh}
                  onChange={e => handleChange('ThoiGianBaoHanh', e.target.value)}
                  placeholder="VD: 12"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Ngày nhập</label>
                <input
                  type="date"
                  value={form.NgayNhap}
                  onChange={e => handleChange('NgayNhap', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Năm sản xuất</label>
                <input
                  type="number"
                  min="1990"
                  max="2030"
                  value={form.NamSanXuat}
                  onChange={e => handleChange('NamSanXuat', e.target.value)}
                  placeholder="VD: 2023"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          {/* Section 4 — Thông số kỹ thuật (only if template exists) */}
          {specFields.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#f3f4f5]">
                <Cpu size={14} className="text-[#26a69a]" />
                <span className="text-sm font-bold text-[#191c1d]">Thông số kỹ thuật</span>
                {selectedCat && (
                  <span className="text-xs text-[#74777d] font-normal">— {selectedCat.name}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {specFields.map(f => (
                  <div key={f.key}>
                    <label className={labelCls}>{f.label}</label>
                    <input
                      type="text"
                      value={specs[f.key] ?? ''}
                      onChange={e => setSpecs(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Fixed footer ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e1e3e4] bg-[#f8f9fa] rounded-b-xl flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#44474c] border border-[#c4c6cd] rounded-lg hover:bg-[#f3f4f5] transition-colors"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-opacity flex items-center gap-2"
            style={{ backgroundColor: '#26a69a', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Đang lưu...' : '💾 Lưu thiết bị'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDeviceModal;
