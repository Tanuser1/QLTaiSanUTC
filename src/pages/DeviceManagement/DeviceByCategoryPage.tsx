/**
 * pages/DeviceManagement/DeviceByCategoryPage.tsx
 * Trang quản lý thiết bị theo danh mục — dùng AssetTable + filter theo URL param.
 * Giữ nguyên logic hiện tại từ AssetListPage, thêm hỗ trợ ?cat= param.
 */
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataTable as AssetTable } from '../../components/common/DataTable';
import { DeviceForm } from '../../components/forms/DeviceForm';
import type { DeviceFormData } from '../../components/forms/DeviceForm';

const DeviceByCategoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('cat');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSubmit = (_data: DeviceFormData) => {
    // TODO: Kết nối deviceService.create() khi tích hợp API
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 p-10 flex flex-col">
      {/* Page heading */}
      {category && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#74777d]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Danh mục: <span className="text-[#1a237e]">{category}</span>
          </p>
        </div>
      )}

      <AssetTable onAddAsset={() => setShowAddModal(true)} />

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-lg" style={{ boxShadow: '0px 12px 32px rgba(0,0,0,0.20)' }}>
            <DeviceForm
              mode="create"
              onSubmit={handleSubmit}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceByCategoryPage;
