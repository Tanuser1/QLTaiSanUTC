import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { yeucauService } from '../../services/yeucauService';
import SimpleTable from '../../components/common/SimpleTable';
import type { SupportRequest } from '../../types/yeucau.types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ tiếp nhận',
  assigned: 'Mới phân công',
  inspecting: 'Đang kiểm tra',
  awaitingApproval: 'Chờ duyệt',
  approved: 'Đang xử lý',
  completed: 'Hoàn thành',
  rejected: 'Từ chối',
};

const KTVDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await yeucauService.getAll({ limit: 100 });
      setRequests(res.items);
    } catch (error) {
      console.error('Lỗi khi tải yêu cầu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id: number) => {
    if (!window.confirm('Bạn xác nhận bắt đầu kiểm tra yêu cầu này?')) return;
    try {
      await yeucauService.accept(id);
      fetchRequests();
    } catch (error) {
      alert('Lỗi khi nhận yêu cầu');
    }
  };

  const columns = [
    { header: 'Mã TB', accessor: 'assetCode' },
    { header: 'Tên TB', accessor: 'assetName' },
    { header: 'Mô tả lỗi', accessor: 'description' },
    { header: 'Người báo', accessor: 'reporterName' },
    { 
      header: 'Trạng thái', 
      accessor: 'status',
      render: (item: any) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {STATUS_LABELS[item.status] || item.status}
        </span>
      )
    },
    {
      header: 'Hành động',
      accessor: 'actions',
      render: (item: SupportRequest) => (
        <div className="flex gap-2">
          {item.status === 'assigned' && (
            <button 
              onClick={() => handleAccept(item.id)}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Nhận xử lý
            </button>
          )}
          {['inspecting', 'assigned'].includes(item.status) && (
            <button 
              onClick={() => navigate(`/ktv/yeucau/${item.id}/lap-bien-ban`)}
              className="px-3 py-1 bg-[#26a69a] text-white text-xs rounded hover:bg-[#208c82]"
            >
              Lập biên bản
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191c1d]">Yêu cầu chờ xử lý</h1>
        <p className="text-sm text-[#74777d] mt-1">Các báo hỏng được Admin phân công cho bạn</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e4] overflow-hidden">
        <SimpleTable
          columns={columns}
          data={requests}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default KTVDashboard;
