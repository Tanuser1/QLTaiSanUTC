import React, { useState } from 'react';
import { Tag, X } from 'lucide-react';
import Button from '../common/Button';

export interface CategoryFormData {
  TenLoai:   string;
  KyHieu?:   string;
  NhomLoai?: string;
  GhiChu?:   string;
  ThuTu?:    number;
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit:    (data: CategoryFormData) => void;
  onCancel:    () => void;
  isLoading?:  boolean;
  mode?:       'create' | 'edit';
}

const NHOM_LOAI_OPTIONS = [
  'MayTinh', 'DieuHoa', 'MayChieu', 'MayIn', 'ThietBiMang',
  'DienTu', 'NoiThat', 'DungCuThucHanh', 'Khac',
];

const EMPTY: CategoryFormData = { TenLoai: '', KyHieu: '', NhomLoai: '', GhiChu: '', ThuTu: 1 };

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData, onSubmit, onCancel, isLoading, mode = 'create',
}) => {
  const [form, setForm] = useState<CategoryFormData>({ ...EMPTY, ...initialData });

  const set = <K extends keyof CategoryFormData>(field: K, value: CategoryFormData[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(48,63,159,0.1)' }}>
            <Tag size={16} style={{ color: '#303f9f' }} />
          </div>
          <h2 className="font-manrope font-bold text-base text-[#191c1d]">
            {mode === 'create' ? 'Thêm loại tài sản' : 'Chỉnh sửa loại tài sản'}
          </h2>
        </div>
        <button type="button" onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col gap-4">
        {/* Tên loại — bắt buộc */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#44474c]">
            Tên loại tài sản <span className="text-[#ba1a1a]">*</span>
          </label>
          <input
            type="text"
            value={form.TenLoai}
            onChange={e => set('TenLoai', e.target.value)}
            required
            placeholder="VD: Máy tính phòng Lab"
            className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#303f9f] focus:ring-1 focus:ring-[#303f9f] outline-none"
          />
        </div>

        {/* Ký hiệu */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#44474c]">Ký hiệu (code)</label>
          <input
            type="text"
            value={form.KyHieu ?? ''}
            onChange={e => set('KyHieu', e.target.value)}
            placeholder="VD: MT, DH, MC..."
            className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#303f9f] outline-none font-mono"
          />
        </div>

        {/* Nhóm loại */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#44474c]">Nhóm loại</label>
          <select
            value={form.NhomLoai ?? ''}
            onChange={e => set('NhomLoai', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#303f9f] outline-none"
          >
            <option value="">— Chọn nhóm —</option>
            {NHOM_LOAI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Thứ tự */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#44474c]">Thứ tự hiển thị</label>
          <input
            type="number"
            min={1}
            value={form.ThuTu ?? 1}
            onChange={e => set('ThuTu', Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#303f9f] outline-none"
          />
        </div>

        {/* Ghi chú */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#44474c]">Ghi chú</label>
          <textarea
            value={form.GhiChu ?? ''}
            onChange={e => set('GhiChu', e.target.value)}
            rows={2}
            placeholder="Mô tả ngắn gọn về loại tài sản này..."
            className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#303f9f] focus:ring-1 focus:ring-[#303f9f] outline-none resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e1e3e4] bg-[#f8f9fa] rounded-b-xl">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Huỷ</Button>
        <Button type="submit" variant="primary" size="sm" loading={isLoading}>
          {mode === 'create' ? 'Tạo loại tài sản' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
