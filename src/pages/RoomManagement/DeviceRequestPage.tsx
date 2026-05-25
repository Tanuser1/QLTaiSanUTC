import React, { useEffect, useState } from 'react';
import { yeucauService } from '../../services/yeucauService';
import { userService } from '../../services/userService';
import SimpleTable from '../../components/common/SimpleTable';
import type { SupportRequest } from '../../types/yeucau.types';
import type { ApiUser } from '../../types/User';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ tiếp nhận',
  assigned: 'Đã phân công',
  inspecting: 'Đang kiểm tra',
  awaitingApproval: 'Chờ duyệt BB',
  approved: 'Đang sửa chữa',
  completed: 'Hoàn thành',
  rejected: 'Đã từ chối',
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

const DeviceRequestPage: React.FC = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // States for Assign Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [technicians, setTechnicians] = useState<ApiUser[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

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

  const openAssignModal = async (requestId: number) => {
    setSelectedRequestId(requestId);
    setIsModalOpen(true);
    if (technicians.length === 0) {
      try {
        const res = await userService.getAll({ VaiTro: 'KyThuat', limit: 100 });
        setTechnicians(res.items);
      } catch (error) {
        console.error('Lỗi tải danh sách KTV:', error);
      }
    }
  };

  const closeAssignModal = () => {
    setIsModalOpen(false);
    setSelectedRequestId(null);
    setSelectedTechId('');
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !selectedTechId) return;

    setIsAssigning(true);
    try {
      await yeucauService.assign(selectedRequestId, Number(selectedTechId));
      fetchRequests();
      closeAssignModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi phân công KTV');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      await yeucauService.reject(id, reason);
      fetchRequests();
    } catch (error) {
      alert('Lỗi khi từ chối yêu cầu');
    }
  };

  const columns = [
    { header: 'Mã TB', accessor: 'assetCode' },
    { header: 'Tên thiết bị', accessor: 'assetName' },
    { header: 'Mô tả lỗi', accessor: 'description' },
    { header: 'Người báo', accessor: 'reporterName' },
    { header: 'Người xử lý', accessor: 'assignedName' },
    { 
      header: 'Trạng thái', 
      accessor: 'status',
      render: (item: any) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-800'}`}>
          {STATUS_LABELS[item.status] || item.status}
        </span>
      )
    },
    {
      header: 'Hành động',
      accessor: 'actions',
      render: (item: SupportRequest) => (
        <div className="flex gap-2">
          {item.status === 'pending' && (
            <>
              <button 
                onClick={() => openAssignModal(item.id)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Phân công
              </button>
              <button 
                onClick={() => handleReject(item.id)}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
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
        <h1 className="text-2xl font-bold text-[#191c1d]">Quản lý Yêu cầu hỗ trợ</h1>
        <p className="text-sm text-[#74777d] mt-1">Quản lý và phân công các báo hỏng từ giáo viên cho Kỹ thuật viên</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e4] overflow-hidden">
        <SimpleTable
          columns={columns}
          data={requests}
          isLoading={isLoading}
        />
      </div>

      {/* Modal Phân công */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e1e3e4] flex justify-between items-center bg-[#f8f9fa]">
              <h3 className="font-bold text-[#191c1d] text-lg">Phân công Kỹ thuật viên</h3>
              <button onClick={closeAssignModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-5">
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#191c1d] mb-2">Chọn Kỹ thuật viên xử lý *</label>
                <select 
                  className="w-full px-3 py-2.5 border border-[#c4c6cd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn kỹ thuật viên --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.username})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeAssignModal}
                  className="px-4 py-2 border border-[#c4c6cd] text-[#44474c] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isAssigning || !selectedTechId}
                  className="px-4 py-2 bg-[#26a69a] hover:bg-[#208c82] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isAssigning ? 'Đang phân công...' : 'Xác nhận giao việc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceRequestPage;
