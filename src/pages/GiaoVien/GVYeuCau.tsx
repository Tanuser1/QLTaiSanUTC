import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { yeucauService } from '../../services/yeucauService';
import SimpleTable from '../../components/common/SimpleTable';
import type { SupportRequest } from '../../types/yeucau.types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ tiếp nhận',
  assigned: 'Đã phân công',
  inspecting: 'Đang kiểm tra',
  awaitingApproval: 'Chờ duyệt biên bản',
  approved: 'Đang sửa chữa',
  completed: 'Hoàn thành',
  rejected: 'Từ chối',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  inspecting: 'bg-purple-100 text-purple-800',
  awaitingApproval: 'bg-orange-100 text-orange-800',
  approved: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const GVYeuCau: React.FC = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const res = await yeucauService.getAll({ limit: 50 });
        setRequests(res.items);
      } catch (error) {
        console.error('Lỗi khi tải yêu cầu:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const columns = [
    { header: 'Mã tài sản', accessor: 'assetCode' },
    { header: 'Tên thiết bị', accessor: 'assetName' },
    { header: 'Mô tả lỗi', accessor: 'description' },
    { header: 'Ngày gửi', accessor: 'createdAt', render: (item: any) => new Date(item.createdAt).toLocaleDateString('vi-VN') },
    { 
      header: 'Trạng thái', 
      accessor: 'status',
      render: (item: any) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-800'}`}>
          {STATUS_LABELS[item.status] || item.status}
        </span>
      )
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1d]">Yêu cầu hỗ trợ của tôi</h1>
          <p className="text-sm text-[#74777d] mt-1">Theo dõi trạng thái các báo hỏng đã gửi</p>
        </div>
        <Link 
          to="/giaovien/yeucau/tao-moi"
          className="bg-[#26a69a] hover:bg-[#208c82] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Gửi báo hỏng mới
        </Link>
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

export default GVYeuCau;
