import React, { useEffect, useState } from 'react';
import { bienbanService } from '../../services/bienbanService';
import SimpleTable from '../../components/common/SimpleTable';
import type { Column } from '../../components/common/SimpleTable';
import type { RepairReport } from '../../types/bienban.types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

const KTVBienBan: React.FC = () => {
  const [reports, setReports] = useState<RepairReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await bienbanService.getAll({ limit: 100 });
      setReports(res.items);
    } catch (error) {
      console.error('Lỗi khi tải biên bản:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleComplete = async (id: number) => {
    const chiPhi = window.prompt('Nhập chi phí sửa chữa thực tế (VNĐ):', '0');
    if (chiPhi === null) return;
    try {
      await bienbanService.complete(id, { ChiPhi: Number(chiPhi), KetQua: 1 });
      fetchReports();
      alert('Đã cập nhật hoàn thành sửa chữa!');
    } catch {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const columns: Column<RepairReport>[] = [
    { header: 'Mã BB', accessor: 'id', render: (item) => `#${item.id}` },
    { header: 'Chi tiết hỏng', accessor: 'damageDetail' },
    { header: 'Đề xuất', accessor: 'proposal' },
    { header: 'Kinh phí ước tính', accessor: 'estimatedCost', render: (item) => `${item.estimatedCost.toLocaleString()} đ` },
    { 
      header: 'Trạng thái', 
      accessor: 'status',
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs ${item.status === 'pending' ? 'bg-orange-100 text-orange-800' : item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {STATUS_LABELS[item.status]}
        </span>
      )
    },
    {
      header: 'Hành động',
      accessor: 'actions',
      render: (item: RepairReport) => (
        <div className="flex gap-2">
          {item.status === 'approved' && (
            <button 
              onClick={() => handleComplete(item.id)}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              Báo hoàn thành
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191c1d]">Biên bản của tôi</h1>
        <p className="text-sm text-[#74777d] mt-1">Danh sách biên bản sửa chữa đã lập và trạng thái phê duyệt</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e4] overflow-hidden">
        <SimpleTable
          columns={columns}
          data={reports}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default KTVBienBan;
