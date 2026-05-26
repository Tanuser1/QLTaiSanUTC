import React, { useEffect, useState } from 'react';
import { taiSanService } from '../../services/taiSanService';
import SimpleTable from '../../components/common/SimpleTable';
import type { Column } from '../../components/common/SimpleTable';
import StatusChip from '../../components/common/StatusChip';
import type { StatusType } from '../../components/common/StatusChip';
import type { ApiAsset } from '../../types/Asset';

const toStatusType = (status: string): StatusType => {
  if (['active', 'maintenance', 'pending', 'inactive', 'ready'].includes(status)) {
    return status as StatusType;
  }
  return 'inactive';
};

const GVDashboard: React.FC = () => {
  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const res = await taiSanService.getAll({ limit: 100 });
        setAssets(res.items);
      } catch (error) {
        console.error('Lỗi khi tải tài sản:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const columns: Column<ApiAsset>[] = [
    { header: 'Mã', accessor: 'code' },
    { header: 'Tên tài sản', accessor: 'name' },
    { header: 'Loại', accessor: 'categoryName' },
    { header: 'Phòng', accessor: 'roomName' },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: (item) => <StatusChip status={toStatusType(item.status)} label={item.statusLabel ?? undefined} />
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1d]">Tài sản thuộc khoa</h1>
          <p className="text-sm text-[#74777d] mt-1">Danh sách thiết bị được giao cho khoa quản lý</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e4] overflow-hidden">
        <SimpleTable
          columns={columns}
          data={assets}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default GVDashboard;
