import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, MapPin, Package, Wrench,
  ShoppingCart, Cpu, Tag, Building2, User, Phone,
  Calendar, ShieldCheck, DollarSign, History, Box,
  AlertCircle, CheckCircle, XCircle, Plus, X,
} from 'lucide-react';
import { taiSanService } from '../../services/taiSanService';
import type { ApiAsset, RepairHistory, ComponentLink } from '../../types/Asset';
import type { DeviceCategory } from '../../types/DeviceCategory';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useDeviceCategoryContext } from '../../contexts/DeviceCategoryContext';

/* ── helpers ── */
const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:             { bg: 'rgba(38,166,154,0.12)', text: '#1b8a80', dot: '#26a69a', label: 'Đang sử dụng'  },
  borrowed:           { bg: 'rgba(38,166,154,0.12)', text: '#1b8a80', dot: '#26a69a', label: 'Đang mượn'      },
  broken:             { bg: 'rgba(239,83,80,0.12)',   text: '#c62828', dot: '#ef5350', label: 'Hỏng'            },
  underRepair:        { bg: 'rgba(239,83,80,0.12)',   text: '#c62828', dot: '#ef5350', label: 'Đang sửa'       },
  pendingLiquidation: { bg: 'rgba(255,202,40,0.18)', text: '#b8860b', dot: '#ffca28', label: 'Chờ thanh lý'   },
  liquidated:         { bg: 'rgba(116,119,125,0.12)',text: '#5a5f6b', dot: '#9e9e9e', label: 'Đã thanh lý'    },
};

const REPAIR_RESULT_ICON: Record<number, React.ReactNode> = {
  1: <CheckCircle size={14} className="text-[#26a69a]" />,
  2: <XCircle     size={14} className="text-[#ef5350]" />,
  3: <AlertCircle size={14} className="text-amber-500" />,
};

const SPEC_KEY_MAP: Record<string, string> = {
  CPU: 'Bộ xử lý', RAM: 'Bộ nhớ RAM', SSD: 'Ổ cứng',
  HeDieuHanh: 'Hệ điều hành', GPU: 'Card đồ họa',
  KichThuoc: 'Kích thước', DoPhanGiai: 'Độ phân giải',
  TanSo: 'Tần số', DoSang: 'Độ sáng', KetNoi: 'Kết nối',
  CongSuat: 'Công suất', BangTan: 'Băng tần', TocDo: 'Tốc độ',
  DungLuong: 'Dung lượng', Loai: 'Loại', SoKenh: 'Số kênh', GhiChu: 'Ghi chú',
};

/* ── Edit modal constants ── */
const STATUS_OPTIONS_EDIT = [
  { value: 1, label: 'Đang sử dụng' },
  { value: 2, label: 'Đang mượn'    },
  { value: 3, label: 'Hỏng'         },
  { value: 4, label: 'Đang sửa'     },
  { value: 5, label: 'Chờ thanh lý' },
];

const STATUS_TO_NUM: Record<string, number> = {
  active: 1, borrowed: 2, broken: 3, underRepair: 4, pendingLiquidation: 5, liquidated: 0,
};

function flattenCats(cats: DeviceCategory[]): DeviceCategory[] {
  return cats.flatMap(c => [c, ...flattenCats(c.children ?? [])]);
}

interface EditForm {
  TenTaiSan:       string;
  MaLoai:          number | '';
  Gia:             number | '';
  NgayNhap:        string;
  NamSanXuat:      number | '';
  ThoiGianBaoHanh: number | '';
  TrangThai:       number;
  specs:           [string, string][];
}

function fmt(d: string | null) {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('vi-VN');
}
function fmtMoney(n: number | null) {
  if (n == null) return '—';
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

/* ── sub-components ── */
const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title, icon, children, className = '',
}) => (
  <div className={`bg-white rounded-xl border border-[#e1e3e4] overflow-hidden ${className}`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
    <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f0f2f5]" style={{ backgroundColor: '#fafbff' }}>
      <span style={{ color: '#1a237e' }}>{icon}</span>
      <h3 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#1a237e', fontFamily: 'Manrope, sans-serif' }}>
        {title}
      </h3>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

const Row: React.FC<{ label: string; value?: string | number | null; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-start justify-between py-1.5 border-b border-[#f5f5f5] last:border-0 gap-3">
    <span className="text-[12px] text-[#74777d] shrink-0 w-32">{label}</span>
    <span className={`text-[13px] text-right text-[#191c1d] font-medium flex-1 ${mono ? 'font-mono' : ''}`}>
      {value ?? '—'}
    </span>
  </div>
);

/* ════════════════════════════════════════════════════
   AssetEditModal
════════════════════════════════════════════════════ */
const AssetEditModal: React.FC<{
  asset:   ApiAsset;
  onClose: () => void;
  onSaved: () => void;
}> = ({ asset, onClose, onSaved }) => {
  const { categories } = useDeviceCategoryContext();
  const flatCats = flattenCats(categories);

  const [form, setForm] = useState<EditForm>({
    TenTaiSan:       asset.name,
    MaLoai:          asset.categoryId ?? '',
    Gia:             asset.price ?? '',
    NgayNhap:        asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
    NamSanXuat:      asset.manufactureYear ?? '',
    ThoiGianBaoHanh: asset.warrantyMonths ?? '',
    TrangThai:       STATUS_TO_NUM[asset.status] ?? 1,
    specs:           asset.specs
      ? Object.entries(asset.specs).map(([k, v]) => [k, String(v ?? '')] as [string, string])
      : [],
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  const set = <K extends keyof EditForm>(key: K, val: EditForm[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const addSpec    = () => set('specs', [...form.specs, ['', '']]);
  const removeSpec = (i: number) => set('specs', form.specs.filter((_, idx) => idx !== i));
  const setSpecKey = (i: number, k: string) => {
    const next = [...form.specs]; next[i] = [k, next[i][1]]; set('specs', next);
  };
  const setSpecVal = (i: number, v: string) => {
    const next = [...form.specs]; next[i] = [next[i][0], v]; set('specs', next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const payload: Record<string, unknown> = {
        TenTaiSan: form.TenTaiSan,
        TrangThai: form.TrangThai,
      };
      if (form.MaLoai          !== '') payload.MaLoai          = form.MaLoai;
      if (form.Gia              !== '') payload.Gia             = form.Gia;
      if (form.NgayNhap)               payload.NgayNhap        = form.NgayNhap;
      if (form.NamSanXuat       !== '') payload.NamSanXuat      = form.NamSanXuat;
      if (form.ThoiGianBaoHanh  !== '') payload.ThoiGianBaoHanh = form.ThoiGianBaoHanh;
      const validSpecs = form.specs.filter(([k]) => k.trim());
      payload.ThongSoKyThuat = validSpecs.length > 0 ? Object.fromEntries(validSpecs) : null;

      await taiSanService.updateById(asset.id, payload);
      onSaved();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col"
        style={{ boxShadow: '0px 12px 32px rgba(0,0,0,0.20)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(26,35,126,0.1)' }}>
              <Edit2 size={15} style={{ color: '#1a237e' }} />
            </div>
            <div>
              <h2 className="font-bold text-[15px] text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Chỉnh sửa thông tin
              </h2>
              <p className="text-[11px] text-[#74777d] font-mono">{asset.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form id="asset-edit-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

          {/* Thông tin cơ bản */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#1a237e' }}>Thông tin cơ bản</p>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#44474c]">Tên tài sản <span className="text-[#ba1a1a]">*</span></label>
              <input
                type="text" required value={form.TenTaiSan}
                onChange={e => set('TenTaiSan', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#44474c]">Loại tài sản</label>
                <select
                  value={form.MaLoai}
                  onChange={e => set('MaLoai', e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg focus:border-[#1a237e] outline-none bg-white"
                >
                  <option value="">— Chọn loại —</option>
                  {flatCats.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parentId ? `  └ ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#44474c]">Trạng thái</label>
                <select
                  value={form.TrangThai}
                  onChange={e => set('TrangThai', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg focus:border-[#1a237e] outline-none bg-white"
                >
                  {STATUS_OPTIONS_EDIT.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tài chính & thời gian */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#1a237e' }}>Tài chính & thời gian</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'Gia',             label: 'Nguyên giá (VNĐ)',  type: 'number', min: 0,    placeholder: '0'    },
                { key: 'NgayNhap',        label: 'Ngày nhập',         type: 'date',   min: '',   placeholder: ''     },
                { key: 'NamSanXuat',      label: 'Năm sản xuất',      type: 'number', min: 1990, placeholder: '2023' },
                { key: 'ThoiGianBaoHanh', label: 'Bảo hành (tháng)', type: 'number', min: 0,    placeholder: '24'   },
              ] as const).map(({ key, label, type, min, placeholder }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#44474c]">{label}</label>
                  <input
                    type={type}
                    min={min || undefined}
                    value={form[key as keyof EditForm] as string | number}
                    placeholder={placeholder}
                    onChange={e => {
                      const v = e.target.value;
                      set(key as keyof EditForm, (type === 'number' ? (v ? Number(v) : '') : v) as EditForm[keyof EditForm]);
                    }}
                    className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e] outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Thông số kỹ thuật */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#1a237e' }}>Thông số kỹ thuật</p>
              <button
                type="button" onClick={addSpec}
                className="flex items-center gap-1 text-xs font-semibold text-[#1a237e] hover:text-[#303f9f] transition-colors"
              >
                <Plus size={13} /> Thêm thông số
              </button>
            </div>

            {form.specs.length === 0
              ? <p className="text-xs text-[#9ea3aa] italic">Chưa có thông số — nhấn "Thêm thông số" để bắt đầu</p>
              : (
                <div className="flex flex-col gap-2">
                  {form.specs.map(([key, val], i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text" value={key} placeholder="Tên (VD: CPU)"
                        onChange={e => setSpecKey(i, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-[#c4c6cd] rounded-lg focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e] outline-none"
                      />
                      <input
                        type="text" value={val} placeholder="Giá trị"
                        onChange={e => setSpecVal(i, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-[#c4c6cd] rounded-lg focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e] outline-none"
                      />
                      <button
                        type="button" onClick={() => removeSpec(i)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#ef5350] hover:bg-[#ffebee] transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            }
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
            type="submit" form="asset-edit-form" disabled={saving}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: saving ? '#9fa8da' : '#1a237e' }}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════
   AssetDetailView — reusable, nhận id + onBack props
════════════════════════════════════════════════════ */
interface AssetDetailViewProps {
  assetId: string;
  onBack:  () => void;
}

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({ assetId, onBack }) => {
  const [asset,    setAsset]    = useState<ApiAsset | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [showDel,  setShowDel]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const loadAsset = useCallback(() => {
    setLoading(true);
    setError(null);
    taiSanService.getById(assetId)
      .then(setAsset)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [assetId]);

  useEffect(() => { loadAsset(); }, [loadAsset]);

  const handleDelete = async () => {
    if (!asset) return;
    setDeleting(true);
    try {
      await taiSanService.deleteById(asset.id);
      onBack();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  /* loading skeleton */
  if (loading) return (
    <div className="p-8 flex flex-col gap-4 animate-pulse">
      <div className="h-8 bg-[#e1e3e4] rounded w-40" />
      <div className="h-36 bg-[#e1e3e4] rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-44 bg-[#e1e3e4] rounded-xl" />
        <div className="h-44 bg-[#e1e3e4] rounded-xl" />
      </div>
    </div>
  );

  /* error */
  if (error || !asset) return (
    <div className="flex items-center justify-center p-16">
      <div className="text-center">
        <AlertCircle size={36} className="mx-auto mb-3 text-[#ef5350]" />
        <p className="text-[#44474c] text-sm mb-4">{error ?? 'Không tìm thấy thiết bị'}</p>
        <button onClick={onBack} className="text-[#1a237e] text-sm font-semibold underline">← Quay lại</button>
      </div>
    </div>
  );

  const ss         = STATUS_STYLE[asset.status] ?? STATUS_STYLE['active'];
  const components = asset.components   ?? [];
  const repairs    = asset.repairHistory ?? [];

  return (
    <div className="p-8 flex flex-col gap-4" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-[#1a237e] hover:text-[#303f9f] transition-colors"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg border border-[#1a237e] text-[#1a237e] hover:bg-[#e8eaf6] transition-colors"
          >
            <Edit2 size={14} /> Chỉnh sửa
          </button>
          <button
            onClick={() => setShowDel(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffebee] transition-colors"
          >
            <Trash2 size={14} /> Xóa
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="bg-white rounded-xl border border-[#e1e3e4] overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(26,35,126,0.08)' }}>
        <div className="flex">
          <div className="w-1.5 shrink-0" style={{ background: 'linear-gradient(180deg,#1a237e 0%,#3949ab 100%)' }} />
          <div className="flex-1 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* Identity */}
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#e8eaf6,#c5cae9)' }}>
                  <Cpu size={26} style={{ color: '#1a237e' }} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {asset.categoryGroup && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e8eaf6', color: '#3949ab' }}>
                        {asset.categoryGroup}
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: ss.bg, color: ss.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ss.dot }} />
                      {asset.statusLabel ?? ss.label}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-[#191c1d] leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {asset.name}
                  </h1>
                  <p className="text-sm text-[#74777d] mt-0.5 font-mono">Mã: {asset.code}</p>
                </div>
              </div>

              {/* Key chips */}
              <div className="flex flex-wrap gap-2 shrink-0">
                {asset.categoryName && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: '#f0f2ff' }}>
                    <Tag size={13} style={{ color: '#1a237e' }} />
                    <span className="font-medium text-[#1a237e]">{asset.categoryName}</span>
                  </div>
                )}
                {asset.roomName && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: '#f0f2ff' }}>
                    <MapPin size={13} style={{ color: '#1a237e' }} />
                    <span className="font-medium text-[#1a237e]">{asset.roomName}</span>
                  </div>
                )}
                {asset.price != null && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: '#f0f2ff' }}>
                    <DollarSign size={13} style={{ color: '#1a237e' }} />
                    <span className="font-medium text-[#1a237e]">{fmtMoney(asset.price)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-col: Thông tin chung + Vị trí ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Thông tin chung" icon={<Package size={14} />}>
          <Row label="Loại tài sản"  value={asset.categoryName} />
          <Row label="Nhóm"          value={asset.categoryGroup} />
          <Row label="Năm sản xuất"  value={asset.manufactureYear} />
          <Row label="Ngày nhập"     value={fmt(asset.purchaseDate)} />
          <Row label="Bảo hành"      value={asset.warrantyMonths ? `${asset.warrantyMonths} tháng` : null} />
          <Row label="Nguyên giá"    value={fmtMoney(asset.price)} />
        </Card>

        <Card title="Vị trí & Sử dụng" icon={<MapPin size={14} />}>
          <Row label="Khoa / Đơn vị"  value={asset.departmentName} />
          <Row label="Phòng"          value={asset.roomName} />
          <Row label="Tòa nhà"        value={asset.building} />
          <Row label="Tầng"           value={asset.floor != null ? `Tầng ${asset.floor}` : null} />
          <Row label="Người sử dụng"  value={asset.assignedTo} />
          <Row label="Email"          value={asset.assignedEmail} />
        </Card>
      </div>

      {/* ── Thông số kỹ thuật ── */}
      {asset.specs && Object.keys(asset.specs).length > 0 && (
        <Card title="Thông số kỹ thuật" icon={<Cpu size={14} />}>
          {Object.entries(asset.specs).map(([key, val]) => (
            <Row key={key} label={SPEC_KEY_MAP[key] ?? key} value={String(val ?? '—')} />
          ))}
        </Card>
      )}

      {/* ── 2-col: Nhà cung cấp + Linh kiện ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Nhà cung cấp" icon={<ShoppingCart size={14} />}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#e8eaf6' }}>
              <Building2 size={16} style={{ color: '#1a237e' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#191c1d]">{asset.supplierName ?? '—'}</p>
              {asset.supplierPhone && (
                <p className="text-xs text-[#74777d] flex items-center gap-1 mt-0.5">
                  <Phone size={11} /> {asset.supplierPhone}
                </p>
              )}
            </div>
          </div>
          <Row label="Bảo hành" value={asset.warrantyMonths ? `${asset.warrantyMonths} tháng` : null} />
          <Row label="QR Code"  value={asset.qrCode ? 'Đã tạo' : 'Chưa có'} />
        </Card>

        <Card title={`Linh kiện đang gắn (${components.length})`} icon={<Wrench size={14} />}>
          {components.length === 0 ? (
            <p className="text-sm text-[#9ea3aa] italic">Không có linh kiện nào đang gắn</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {components.map((c: ComponentLink) => (
                <li key={c.linkId} className="flex items-center gap-2.5 p-2 rounded-lg" style={{ backgroundColor: '#fafbff' }}>
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: '#e8eaf6' }}>
                    <Box size={13} style={{ color: '#1a237e' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#191c1d] truncate">{c.name}</p>
                    <p className="text-[11px] text-[#74777d]">{c.categoryName} · {c.code}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ── Lịch sử sửa chữa ── */}
      <Card title={`Lịch sử sửa chữa (${repairs.length})`} icon={<History size={14} />}>
        {repairs.length === 0 ? (
          <p className="text-sm text-[#9ea3aa] italic">Chưa có lịch sử sửa chữa</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '560px' }}>
              <thead>
                <tr className="border-b border-[#e1e3e4]">
                  {['Ngày sửa', 'Mô tả', 'Kỹ thuật viên', 'Chi phí', 'Kết quả'].map((h) => (
                    <th key={h} className="pb-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[#74777d]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repairs.map((r: RepairHistory) => (
                  <tr key={r.id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafbff] transition-colors">
                    <td className="py-2.5 pr-4 text-[#44474c] whitespace-nowrap">
                      <div className="flex items-center gap-1.5"><Calendar size={12} className="text-[#9ea3aa]" />{fmt(r.date)}</div>
                    </td>
                    <td className="py-2.5 pr-4 text-[#191c1d] max-w-[200px]">
                      <span className="line-clamp-2">{r.description ?? '—'}</span>
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[#44474c]"><User size={12} className="text-[#9ea3aa]" />{r.technicianName ?? '—'}</div>
                    </td>
                    <td className="py-2.5 pr-4 font-medium tabular-nums whitespace-nowrap text-[#191c1d]">{fmtMoney(r.cost)}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        {REPAIR_RESULT_ICON[r.result]}
                        <span className="text-[12px] text-[#44474c]">{r.resultLabel ?? '—'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Footer actions ── */}
      <div className="flex items-center gap-3 pb-4">
        {asset.qrCode && (
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-[#c4c6cd] text-[#44474c] bg-white hover:bg-[#f3f4f5] transition-colors">
            <ShieldCheck size={15} /> Xem QR Code
          </button>
        )}
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors" style={{ backgroundColor: '#ef5350' }}>
          <AlertCircle size={15} /> Báo hỏng
        </button>
      </div>

      {/* ── Confirm delete ── */}
      <ConfirmModal
        isOpen={showDel}
        title="Xóa thiết bị"
        message={`Bạn có chắc muốn xóa "${asset.name}" (${asset.code})? Thao tác này không thể hoàn tác.`}
        confirmLabel={deleting ? 'Đang xóa...' : 'Xóa'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDel(false)}
      />

      {/* ── Edit modal ── */}
      {showEdit && (
        <AssetEditModal
          asset={asset}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); loadAsset(); }}
        />
      )}
    </div>
  );
};

/* ════════════════════════════════════════
   AssetDetailPage — route wrapper (giữ lại để /assets/:id vẫn hoạt động)
════════════════════════════════════════ */
const AssetDetailPage: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return null;
  return <AssetDetailView assetId={id} onBack={() => navigate(-1)} />;
};

export default AssetDetailPage;
