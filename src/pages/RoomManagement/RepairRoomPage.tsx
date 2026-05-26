import React, { useEffect, useState } from 'react';
import { bienbanService } from '../../services/bienbanService';
import SimpleTable from '../../components/common/SimpleTable';
import type { Column } from '../../components/common/SimpleTable';
import type { RepairReport } from '../../types/bienban.types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  completed: 'Hoàn thành',
  rejected: 'Từ chối',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-800',
  approved: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const RepairRoomPage: React.FC = () => {
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

  const handleApprove = async (id: number, decision: 'DongY' | 'TuChoi') => {
    let kinhPhi = 0;
    let ghiChu = '';
    
    if (decision === 'DongY') {
      const input = window.prompt('Nhập kinh phí duyệt (VNĐ):', '0');
      if (input === null) return;
      kinhPhi = Number(input);
    } else {
      const input = window.prompt('Nhập lý do từ chối:');
      if (input === null) return;
      ghiChu = input;
    }

    try {
      await bienbanService.approve(id, { 
        QuyetDinh: decision, 
        KinhPhiDuyet: kinhPhi,
        GhiChu: ghiChu 
      });
      fetchReports();
    } catch {
      alert('Lỗi xử lý duyệt');
    }
  };

  const columns: Column<RepairReport>[] = [
    { header: 'Mã BB', accessor: 'id', render: (item) => `#${item.id}` },
    { header: 'Thiết bị', accessor: 'assetName' },
    { header: 'Chi tiết hỏng', accessor: 'damageDetail' },
    { header: 'Đề xuất', accessor: 'proposal' },
    { header: 'KTV Lập', accessor: 'technicianName' },
    { header: 'Kinh phí ước tính', accessor: 'estimatedCost', render: (item) => `${item.estimatedCost.toLocaleString()} đ` },
    { 
      header: 'Trạng thái', 
      accessor: 'status',
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-800'}`}>
          {STATUS_LABELS[item.status] || item.status}
        </span>
      )
    },
    {
      header: 'Hành động',
      accessor: 'actions',
      render: (item: RepairReport) => (
        <div className="flex gap-2">
          {item.status === 'pending' && (
            <>
              <button 
                onClick={() => handleApprove(item.id, 'DongY')}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Duyệt
              </button>
              <button 
                onClick={() => handleApprove(item.id, 'TuChoi')}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Từ chối
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191c1d]">Quản lý Biên bản sửa chữa</h1>
        <p className="text-sm text-[#74777d] mt-1">Theo dõi toàn bộ các báo cáo tình trạng thiết bị từ KTV và cấp kinh phí</p>
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

export default RepairRoomPage;
