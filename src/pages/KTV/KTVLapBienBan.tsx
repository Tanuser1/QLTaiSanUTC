import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { yeucauService } from '../../services/yeucauService';
import { bienbanService } from '../../services/bienbanService';
import type { SupportRequest } from '../../types/yeucau.types';
import type { RepairProposal } from '../../types/bienban.types';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    if (typeof response?.data?.message === 'string') return response.data.message;
  }
  return fallback;
};

const KTVLapBienBan: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    ChiTietHong: '',
    DeXuat: 'SuaChua' as RepairProposal,
    ChiPhiUocTinh: 0,
    GhiChu: '',
  });

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;
      try {
        const data = await yeucauService.getById(id);
        setRequest(data);
      } catch (error) {
        console.error('Lỗi tải yêu cầu', error);
      }
    };
    fetchRequest();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData.ChiTietHong) return;
    
    setIsSubmitting(true);
    try {
      await bienbanService.create({
        MaYeuCau: Number(id),
        ChiTietHong: formData.ChiTietHong,
        DeXuat: formData.DeXuat,
        ChiPhiUocTinh: formData.ChiPhiUocTinh,
        GhiChu: formData.GhiChu,
      });
      navigate('/ktv/bienban');
    } catch (error: unknown) {
      alert(getApiErrorMessage(error, 'Lỗi khi lập biên bản'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191c1d]">Lập biên bản kiểm tra</h1>
        <p className="text-sm text-[#74777d] mt-1">Báo cáo tình trạng hư hỏng thiết bị và đề xuất kinh phí</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <p className="text-sm"><strong>Thiết bị:</strong> {request.assetCode} - {request.assetName}</p>
        <p className="text-sm mt-1"><strong>Lỗi do người dùng báo:</strong> {request.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-[#e1e3e4] p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Chi tiết tình trạng hư hỏng *</label>
          <textarea 
            className="w-full px-3 py-2 border rounded-lg focus:ring-[#26a69a]"
            rows={3}
            value={formData.ChiTietHong}
            onChange={(e) => setFormData({ ...formData, ChiTietHong: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phương án đề xuất *</label>
            <select 
              className="w-full px-3 py-2 border rounded-lg focus:ring-[#26a69a]"
              value={formData.DeXuat}
              onChange={(e) => setFormData({ ...formData, DeXuat: e.target.value as RepairProposal })}
            >
              <option value="SuaChua">Sửa chữa</option>
              <option value="ThayMoi">Thay linh kiện mới</option>
              <option value="ThanhLy">Thanh lý (Không thể sửa)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chi phí ước tính (VNĐ)</label>
            <input 
              type="number"
              className="w-full px-3 py-2 border rounded-lg focus:ring-[#26a69a]"
              value={formData.ChiPhiUocTinh}
              onChange={(e) => setFormData({ ...formData, ChiPhiUocTinh: Number(e.target.value) })}
              min={0}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ghi chú thêm</label>
          <input 
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:ring-[#26a69a]"
            value={formData.GhiChu}
            onChange={(e) => setFormData({ ...formData, GhiChu: e.target.value })}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t mt-4">
          <button type="button" onClick={() => navigate('/ktv/dashboard')} className="px-4 py-2 border rounded-lg">Hủy</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#26a69a] text-white rounded-lg">
            {isSubmitting ? 'Đang lưu...' : 'Lưu biên bản & Gửi duyệt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KTVLapBienBan;
