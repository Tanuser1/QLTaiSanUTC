import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';
import { yeucauService } from '../../services/yeucauService';
import { taiSanService } from '../../services/taiSanService';
import type { ApiAsset } from '../../types/Asset';

const GVGuiYeuCau: React.FC = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Combobox state ── */
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ApiAsset | null>(null);

  const [formData, setFormData] = useState({
    MoTaLoi: '',
    MucDo: '1',
  });

  /* ── Load all assets ── */
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const res = await taiSanService.getAll({ limit: 500 });
        setAssets(res.items);
      } catch {
        console.error('Lỗi khi tải DS tài sản');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, []);

  /* ── Close dropdown when clicking outside ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Filtered list ── */
  const filtered = searchText.trim()
    ? assets.filter(a => {
        const q = searchText.toLowerCase();
        return (
          a.code?.toLowerCase().includes(q) ||
          a.name?.toLowerCase().includes(q) ||
          a.roomName?.toLowerCase().includes(q)
        );
      }).slice(0, 12)
    : assets.slice(0, 12);

  const handleSelectAsset = (asset: ApiAsset) => {
    setSelectedAsset(asset);
    setSearchText(`${asset.code} – ${asset.name}`);
    setShowDropdown(false);
  };

  const handleClearAsset = () => {
    setSelectedAsset(null);
    setSearchText('');
    setShowDropdown(false);
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !formData.MoTaLoi) return;

    setIsSubmitting(true);
    try {
      await yeucauService.create({
        MaTaiSan: selectedAsset.id,
        MoTaLoi: formData.MoTaLoi,
        MucDo: Number(formData.MucDo),
      });
      navigate('/giaovien/yeucau');
    } catch {
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

        {/* ── Tìm thiết bị ── */}
        <div>
          <label className="block text-sm font-medium text-[#191c1d] mb-1">
            Thiết bị gặp sự cố <span className="text-red-500">*</span>
          </label>
          <div ref={dropdownRef} className="relative">
            {/* Input tìm kiếm */}
            <div className={`flex items-center gap-2 w-full px-3 py-2 border rounded-lg transition-colors ${
              showDropdown
                ? 'border-[#26a69a] ring-2 ring-[#26a69a]/20'
                : selectedAsset
                  ? 'border-[#26a69a] bg-[#f0faf9]'
                  : 'border-[#e1e3e4]'
            }`}>
              <Search size={15} className="text-[#74777d] shrink-0" />
              <input
                type="text"
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-[#aab]"
                placeholder={isLoading ? 'Đang tải danh sách...' : 'Nhập mã thiết bị, tên hoặc phòng để tìm...'}
                value={searchText}
                disabled={isLoading}
                onChange={e => {
                  setSearchText(e.target.value);
                  setSelectedAsset(null);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              {selectedAsset
                ? <button type="button" onClick={handleClearAsset} className="text-[#74777d] hover:text-red-500 transition-colors">
                    <X size={15} />
                  </button>
                : <ChevronDown size={15} className="text-[#74777d] shrink-0" />
              }
            </div>

            {/* Dropdown gợi ý */}
            {showDropdown && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-[#e1e3e4] rounded-xl shadow-lg overflow-hidden">
                {filtered.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-[#74777d]">Không tìm thấy thiết bị nào</p>
                ) : (
                  <ul className="max-h-64 overflow-y-auto divide-y divide-[#f3f4f5]">
                    {filtered.map(asset => (
                      <li
                        key={asset.id}
                        onMouseDown={() => handleSelectAsset(asset)}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#f0faf9] transition-colors"
                      >
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#e8eaf6] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#3949ab]">
                            {asset.code?.split('-')[0] ?? 'TB'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#191c1d] truncate">{asset.name}</p>
                          <p className="text-xs text-[#74777d]">
                            <span className="font-mono">{asset.code}</span>
                            {asset.roomName && <> · {asset.roomName}</>}
                          </p>
                        </div>
                        {selectedAsset?.id === asset.id && (
                          <CheckCircle2 size={15} className="text-[#26a69a] shrink-0" />
                        )}
                      </li>
                    ))}
                    {!searchText.trim() && assets.length > 12 && (
                      <li className="px-4 py-2 text-xs text-[#74777d] text-center bg-[#fafbff]">
                        Gõ mã hoặc tên để tìm trong {assets.length} thiết bị...
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Thông tin thiết bị được chọn */}
          {selectedAsset && (
            <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-[#f0faf9] border border-[#26a69a]/30">
              <CheckCircle2 size={15} className="text-[#26a69a] mt-0.5 shrink-0" />
              <div className="text-xs text-[#44474c]">
                <span className="font-semibold text-[#191c1d]">{selectedAsset.name}</span>
                {' '}·{' '}
                <span className="font-mono">{selectedAsset.code}</span>
                {selectedAsset.roomName && <> · Phòng {selectedAsset.roomName}</>}
                {selectedAsset.status && selectedAsset.status !== 'active' && (
                  <span className="ml-2 inline-flex items-center gap-1 text-amber-600">
                    <AlertTriangle size={11} /> {selectedAsset.statusLabel}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Mức độ ưu tiên ── */}
        <div>
          <label className="block text-sm font-medium text-[#191c1d] mb-1">Mức độ ưu tiên <span className="text-red-500">*</span></label>
          <select
            className="w-full px-3 py-2 border border-[#e1e3e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26a69a] text-sm"
            value={formData.MucDo}
            onChange={e => setFormData({ ...formData, MucDo: e.target.value })}
            required
          >
            <option value="1">Bình thường (Xử lý trong tuần)</option>
            <option value="2">Khẩn cấp (Cần xử lý ngay trong ngày)</option>
          </select>
        </div>

        {/* ── Mô tả lỗi ── */}
        <div>
          <label className="block text-sm font-medium text-[#191c1d] mb-1">Mô tả hiện tượng lỗi <span className="text-red-500">*</span></label>
          <textarea
            className="w-full px-3 py-2 border border-[#e1e3e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26a69a] text-sm"
            rows={4}
            value={formData.MoTaLoi}
            onChange={e => setFormData({ ...formData, MoTaLoi: e.target.value })}
            placeholder="Mô tả chi tiết tình trạng: máy không lên nguồn, màn hình bị sọc, không kết nối mạng..."
            required
          />
        </div>

        {/* ── Actions ── */}
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
            disabled={isSubmitting || isLoading || !selectedAsset || !formData.MoTaLoi.trim()}
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

