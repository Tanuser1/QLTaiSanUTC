import React, { useState } from 'react';
import { Tag, X } from 'lucide-react';
import Button from '../common/Button';

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

const EMPTY: CategoryFormData = { name: '', slug: '', description: '' };

function toSlug(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData, onSubmit, onCancel, isLoading, mode = 'create',
}) => {
  const [form, setForm] = useState<CategoryFormData>({ ...EMPTY, ...initialData });

  const set = (field: keyof CategoryFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleNameChange = (value: string) => {
    setForm((prev) => ({ ...prev, name: value, slug: toSlug(value) }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(48,63,159,0.1)' }}>
            <Tag size={16} style={{ color: '#303f9f' }} />
          </div>
          <h2 className="font-manrope font-bold text-base text-[#191c1d]">
            {mode === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
          </h2>
        </div>
        <button type="button" onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#44474c]">Tên danh mục <span className="text-[#ba1a1a]">*</span></label>
          <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="VD: Máy tính phòng Lab"
            className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#303f9f] focus:ring-1 focus:ring-[#303f9f] outline-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#44474c]">Slug (URL)</label>
          <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="may-tinh-phong-lab"
            className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-[#f8f9fa] focus:border-[#303f9f] outline-none font-mono text-xs" />
          <p className="text-[11px] text-[#74777d]">Tự động tạo từ tên. Có thể chỉnh sửa thủ công.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#44474c]">Mô tả</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
            placeholder="Mô tả ngắn gọn về danh mục này..."
            className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#303f9f] focus:ring-1 focus:ring-[#303f9f] outline-none resize-none" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e1e3e4] bg-[#f8f9fa] rounded-b-xl">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Huỷ</Button>
        <Button type="submit" variant="primary" size="sm" loading={isLoading}>
          {mode === 'create' ? 'Tạo danh mục' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
