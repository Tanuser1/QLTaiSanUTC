import React, { useState } from 'react';
import MainLayout from '../components/templates/MainLayout';
import AssetTable from '../components/organisms/AssetTable';
import { X, Package, MapPin, User, Tag, DollarSign, CalendarDays } from 'lucide-react';
import Button from '../components/atoms/Button';

const AssetListPage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '', name: '', category: '', location: '', assignedTo: '', value: '', purchaseDate: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout
      title="Danh sách Tài sản"
      breadcrumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Quản lý Tài sản' }, { label: 'Danh sách' }]}
    >
      <AssetTable onAddAsset={() => setShowAddModal(true)} />

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />

          {/* Modal card */}
          <div
            className="relative bg-white rounded-xl w-full max-w-lg"
            style={{ boxShadow: '0px 12px 32px rgba(0,0,0,0.20)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(38,166,154,0.1)' }}
                >
                  <Package size={16} className="text-[#26a69a]" />
                </div>
                <h2 className="font-manrope font-bold text-base text-[#191c1d]">
                  Thêm tài sản mới
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#44474c] tracking-wide">
                    Mã tài sản <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d]" />
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleChange('code', e.target.value)}
                      placeholder="VD: MB-010"
                      className="w-full pl-8 pr-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#44474c] tracking-wide">
                    Danh mục <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none"
                  >
                    <option value="">Chọn danh mục</option>
                    <option>Máy tính</option>
                    <option>Màn hình</option>
                    <option>Thiết bị</option>
                    <option>Phương tiện</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#44474c] tracking-wide">
                  Tên tài sản <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d]" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="VD: Máy tính Dell Latitude 5540"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#44474c] tracking-wide">
                    Vị trí / Phòng
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d]" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="VD: Phòng IT-01"
                      className="w-full pl-8 pr-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#44474c] tracking-wide">
                    Người phụ trách
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d]" />
                    <input
                      type="text"
                      value={formData.assignedTo}
                      onChange={(e) => handleChange('assignedTo', e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full pl-8 pr-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#44474c] tracking-wide">
                    Giá trị (VNĐ)
                  </label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d]" />
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => handleChange('value', e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#44474c] tracking-wide">
                    Ngày mua
                  </label>
                  <div className="relative">
                    <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d]" />
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleChange('purchaseDate', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-[#c4c6cd] rounded bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e1e3e4] bg-[#f8f9fa] rounded-b-xl">
              <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                Huỷ
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowAddModal(false)}>
                Lưu tài sản
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AssetListPage;
