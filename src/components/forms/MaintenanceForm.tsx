import React, { useState } from 'react';
import { Wrench, X } from 'lucide-react';
import Button from '../common/Button';

export interface MaintenanceFormData {
  deviceCode: string;
  issue: string;
  assignedTechnician: string;
  scheduledDate: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
}

interface MaintenanceFormProps {
  onSubmit: (data: MaintenanceFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EMPTY: MaintenanceFormData = {
  deviceCode: '', issue: '', assignedTechnician: '', scheduledDate: '', priority: 'medium', notes: '',
};

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState<MaintenanceFormData>(EMPTY);

  const set = (field: keyof MaintenanceFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(239,83,80,0.1)' }}>
            <Wrench size={16} className="text-[#ef5350]" />
          </div>
          <h2 className="font-manrope font-bold text-base text-[#191c1d]">Tạo phiếu sửa chữa</h2>
        </div>
        <button type="button" onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#44474c]">Mã thiết bị <span className="text-[#ba1a1a]">*</span></label>
            <input type="text" value={form.deviceCode} onChange={(e) => set('deviceCode', e.target.value)} required placeholder="VD: MB-001"
              className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#ef5350] focus:ring-1 focus:ring-[#ef5350] outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#44474c]">Mức ưu tiên</label>
            <select value={form.priority} onChange={(e) => set('priority', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#ef5350] outline-none">
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#44474c]">Mô tả sự cố <span className="text-[#ba1a1a]">*</span></label>
          <textarea value={form.issue} onChange={(e) => set('issue', e.target.value)} required rows={3}
            placeholder="Mô tả chi tiết sự cố cần sửa chữa..."
            className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#ef5350] focus:ring-1 focus:ring-[#ef5350] outline-none resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#44474c]">Kỹ thuật viên</label>
            <input type="text" value={form.assignedTechnician} onChange={(e) => set('assignedTechnician', e.target.value)} placeholder="Họ tên KTV"
              className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#ef5350] outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#44474c]">Ngày xử lý</label>
            <input type="date" value={form.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#ef5350] outline-none" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e1e3e4] bg-[#f8f9fa] rounded-b-xl">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Huỷ</Button>
        <Button type="submit" variant="primary" size="sm" loading={isLoading}>Lưu phiếu</Button>
      </div>
    </form>
  );
};

export default MaintenanceForm;
