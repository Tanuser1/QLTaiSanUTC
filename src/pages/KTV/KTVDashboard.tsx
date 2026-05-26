import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { yeucauService } from '../../services/yeucauService';
import SimpleTable from '../../components/common/SimpleTable';
import type { Column } from '../../components/common/SimpleTable';
import type { SupportRequest } from '../../types/yeucau.types';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    if (typeof response?.data?.message === 'string') return response.data.message;
  }
  return fallback;
};

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
  const [closeModalState, setCloseModalState] = useState<{ isOpen: boolean; requestId: number | null }>({ isOpen: false, requestId: null });
  const [closeReason, setCloseReason] = useState('');
  const [isClosing, setIsClosing] = useState(false);

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
    } catch {
      alert('Lỗi khi nhận yêu cầu');
    }
  };

  const handleCloseRequest = async () => {
    if (!closeModalState.requestId || !closeReason.trim()) return;
    setIsClosing(true);
    try {
      await yeucauService.close(closeModalState.requestId, closeReason);
      setCloseModalState({ isOpen: false, requestId: null });
      setCloseReason('');
      fetchRequests();
    } catch (error: unknown) {
      alert(getApiErrorMessage(error, 'Lỗi khi đóng yêu cầu'));
    } finally {
      setIsClosing(false);
    }
  };

  const columns: Column<SupportRequest>[] = [
    { header: 'Mã TB', accessor: 'assetCode' },
    { header: 'Tên TB', accessor: 'assetName' },
    { header: 'Mô tả lỗi', accessor: 'description' },
    { header: 'Người báo', accessor: 'reporterName' },
    { 
      header: 'Trạng thái', 
      accessor: 'status',
      render: (item) => (
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
          {item.status === 'inspecting' && (
            <button 
              onClick={() => setCloseModalState({ isOpen: true, requestId: item.id })}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Đóng yêu cầu
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

      {closeModalState.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-[#191c1d] mb-4">Đóng yêu cầu (Không có lỗi)</h3>
            <p className="text-sm text-[#44474c] mb-4">
              Bạn đang đóng yêu cầu báo hỏng mà không lập biên bản sửa chữa. Vui lòng ghi rõ lý do (ví dụ: máy tính bị lỏng dây nguồn, thiết bị hoạt động bình thường,...).
            </p>
            <textarea
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px] resize-none mb-4"
              placeholder="Nhập lý do đóng yêu cầu..."
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setCloseModalState({ isOpen: false, requestId: null });
                  setCloseReason('');
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleCloseRequest}
                disabled={!closeReason.trim() || isClosing}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50"
              >
                {isClosing ? 'Đang xử lý...' : 'Xác nhận đóng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KTVDashboard;
