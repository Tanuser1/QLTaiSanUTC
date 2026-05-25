import React, { useEffect, useState } from 'react';
import { bienbanService } from '../../services/bienbanService';
import SimpleTable from '../../components/common/SimpleTable';
import type { RepairReport } from '../../types/bienban.types';

const BGHDashboard: React.FC = () => {
  const [reports, setReports] = useState<RepairReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      // BGH role backend automatically filters to pending reports if TrangThai is not provided, 
      // but let's be explicit and get all to show them if we want, or just let backend handle it
      const res = await bienbanService.getAll();
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
    } catch (error) {
      alert('Lỗi xử lý duyệt');
    }
  };

  const columns = [
    { header: 'Mã BB', accessor: 'id', render: (item: any) => `#${item.id}` },
    { header: 'Chi tiết hỏng', accessor: 'damageDetail' },
    { header: 'Đề xuất sửa chữa', accessor: 'proposal' },
    { header: 'KTV Lập', accessor: 'technicianName' },
    { header: 'Kinh phí ước tính', accessor: 'estimatedCost', render: (item: any) => `${item.estimatedCost.toLocaleString()} đ` },
    {
      header: 'Hành động',
      accessor: 'actions',
      render: (item: RepairReport) => (
        <div className="flex gap-2">
          {item.status === 'pending' ? (
            <>
              <button 
                onClick={() => handleApprove(item.id, 'DongY')}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Đồng ý
              </button>
              <button 
                onClick={() => handleApprove(item.id, 'TuChoi')}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Từ chối
              </button>
            </>
          ) : (
            <span className="text-gray-500 text-sm">Đã xử lý</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191c1d]">Phê duyệt kinh phí sửa chữa</h1>
        <p className="text-sm text-[#74777d] mt-1">Danh sách biên bản đang chờ Ban Giám Hiệu duyệt</p>
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

export default BGHDashboard;
