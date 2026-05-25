import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { yeucauService } from '../../services/yeucauService';
import { taiSanService } from '../../services/taiSanService';
import type { ApiAsset } from '../../types/Asset';

const GVGuiYeuCau: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    MaTaiSan: '',
    MoTaLoi: '',
    MucDo: '1',
  });

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const res = await taiSanService.getAll({ limit: 500 });
        setAssets(res.items);
      } catch (error) {
        console.error('Lỗi khi tải DS tài sản:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.MaTaiSan || !formData.MoTaLoi) return;
    
    setIsSubmitting(true);
    try {
      await yeucauService.create({
        MaTaiSan: Number(formData.MaTaiSan),
        MoTaLoi: formData.MoTaLoi,
        MucDo: Number(formData.MucDo),
      });
      navigate('/giaovien/yeucau');
    } catch (error) {
      console.error('Lỗi khi gửi báo hỏng:', error);
      alert('Không thể gửi báo hỏng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191c1d]">Gửi báo hỏng thiết bị</h1>
        <p className="text-sm text-[#74777d] mt-1">Thông tin sẽ được gửi đến Admin để phân công kỹ thuật viên</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-[#e1e3e4] p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#191c1d] mb-1">Thiết bị gặp sự cố *</label>
          <select 
            className="w-full px-3 py-2 border border-[#e1e3e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
            value={formData.MaTaiSan}
            onChange={(e) => setFormData({ ...formData, MaTaiSan: e.target.value })}
            required
            disabled={isLoading}
          >
            <option value="">-- Chọn thiết bị trong khoa --</option>
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.code} - {asset.name} {asset.roomName ? `(Phòng ${asset.roomName})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#191c1d] mb-1">Mức độ ưu tiên *</label>
          <select 
            className="w-full px-3 py-2 border border-[#e1e3e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
            value={formData.MucDo}
            onChange={(e) => setFormData({ ...formData, MucDo: e.target.value })}
            required
          >
            <option value="1">Bình thường (Xử lý trong tuần)</option>
            <option value="2">Khẩn cấp (Cần xử lý ngay trong ngày)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#191c1d] mb-1">Mô tả hiện tượng lỗi *</label>
          <textarea 
            className="w-full px-3 py-2 border border-[#e1e3e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
            rows={4}
            value={formData.MoTaLoi}
            onChange={(e) => setFormData({ ...formData, MoTaLoi: e.target.value })}
            placeholder="Mô tả chi tiết tình trạng máy không hoạt động..."
            required
          />
        </div>

        <div className="pt-2 flex justify-end gap-3 border-t border-[#e1e3e4] mt-6">
          <button 
            type="button" 
            onClick={() => navigate('/giaovien/yeucau')}
            className="px-4 py-2 border border-[#e1e3e4] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting || isLoading}
            className="px-4 py-2 bg-[#26a69a] hover:bg-[#208c82] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GVGuiYeuCau;
