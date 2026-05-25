import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Search, Plus, Eye, Pencil, Trash2, X,
  MapPin, ChevronLeft, Package, ArrowLeft,
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { phongService } from '../../services/phongService';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import type { Room, RoomFormPayload } from '../../types/Room';
import type { ApiAsset } from '../../types/Asset';

/* ── Constants ────────────────────────────────────────────────── */
const LOAI_OPTIONS = [
  { value: 'PhongMay', label: 'Phòng máy' },
  { value: 'PhongHoc', label: 'Phòng học' },
  { value: 'VanPhong', label: 'Văn phòng' },
  { value: 'Kho',      label: 'Kho'        },
  { value: 'Xuong',    label: 'Xưởng'      },
];

const LOAI_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  PhongMay: { label: 'Phòng máy', bg: 'rgba(34,197,94,0.1)',   color: '#15803d'  },
  PhongHoc: { label: 'Phòng học', bg: 'rgba(59,130,246,0.1)',  color: '#1d4ed8'  },
  VanPhong: { label: 'Văn phòng', bg: 'rgba(234,179,8,0.12)',  color: '#92400e'  },
  Kho:      { label: 'Kho',       bg: 'rgba(249,115,22,0.12)', color: '#c2410c'  },
  Xuong:    { label: 'Xưởng',     bg: 'rgba(239,68,68,0.12)',  color: '#b91c1c'  },
};

const ASSET_STATUS_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  active:             { bg: 'rgba(34,197,94,0.1)',    color: '#15803d',  label: 'Đang dùng'     },
  borrowed:           { bg: 'rgba(34,197,94,0.1)',    color: '#15803d',  label: 'Đang mượn'     },
  broken:             { bg: 'rgba(239,68,68,0.12)',   color: '#b91c1c',  label: 'Hỏng'          },
  underRepair:        { bg: 'rgba(249,115,22,0.12)',  color: '#c2410c',  label: 'Đang sửa'      },
  pendingLiquidation: { bg: 'rgba(234,179,8,0.12)',   color: '#92400e',  label: 'Chờ thanh lý'  },
  liquidated:         { bg: 'rgba(148,163,184,0.15)', color: '#64748b',  label: 'Đã thanh lý'   },
};

/* ── Shared helpers ───────────────────────────────────────────── */
interface Dept { id: number; name: string; }

function LoaiBadge({ type }: { type: string }) {
  const cfg = LOAI_BADGE[type] ?? { label: type, bg: '#f1f5f9', color: '#64748b' };
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

const inputCls = 'w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none transition-colors';
const labelCls = 'block text-xs font-semibold text-[#44474c] mb-1.5 tracking-wide';

/* ═══════════════════════════════════════════════════════════════
   RoomModal — Add / Edit
═══════════════════════════════════════════════════════════════ */
interface RoomModalProps {
  room?: Room;
  depts: Dept[];
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_FORM = {
  TenPhong: '', MaKhoa: '', TenToaNha: '',
  Tang: '1', LoaiPhong: 'PhongMay', DiaChi: '', GhiChu: '',
};

function RoomModal({ room, depts, onClose, onSaved }: RoomModalProps) {
  const isEdit = !!room;
  const [form, setForm]     = useState({
    TenPhong:  room?.name      ?? '',
    MaKhoa:    room?.departmentId ? String(room.departmentId) : '',
    TenToaNha: room?.building  ?? '',
    Tang:      room?.floor     != null ? String(room.floor) : '1',
    LoaiPhong: room?.type      ?? 'PhongMay',
    DiaChi:    room?.address   ?? '',
    GhiChu:    room?.note      ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handle = (k: keyof typeof EMPTY_FORM, v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.TenPhong.trim() || !form.TenToaNha.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload: RoomFormPayload = {
        TenPhong:  form.TenPhong.trim(),
        TenToaNha: form.TenToaNha.trim(),
        Tang:      Number(form.Tang) || 1,
        LoaiPhong: form.LoaiPhong,
        MaKhoa:    form.MaKhoa ? Number(form.MaKhoa) : null,
        DiaChi:    form.DiaChi.trim() || null,
        GhiChu:    form.GhiChu.trim() || null,
      };
      if (isEdit && room) {
        await phongService.update(room.id, payload);
      } else {
        await phongService.create(payload);
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: '90vh', boxShadow: '0 12px 40px rgba(0,0,0,0.22)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(38,166,154,0.1)' }}>
              <Building2 size={18} className="text-[#26a69a]" />
            </div>
            <div>
              <h2 className="font-manrope font-bold text-base text-[#191c1d]">
                {isEdit ? 'Sửa thông tin phòng' : 'Thêm phòng mới'}
              </h2>
              <p className="text-xs text-[#74777d]">{isEdit ? room?.name : 'Điền đầy đủ thông tin bên dưới'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {error && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

          {/* Tên phòng */}
          <div>
            <label className={labelCls}>Tên phòng <span className="text-[#ba1a1a]">*</span></label>
            <input
              type="text"
              value={form.TenPhong}
              onChange={e => handle('TenPhong', e.target.value)}
              placeholder="VD: Phòng máy 401"
              required
              className={inputCls}
            />
          </div>

          {/* Khoa */}
          <div>
            <label className={labelCls}>Khoa / Đơn vị</label>
            <select value={form.MaKhoa} onChange={e => handle('MaKhoa', e.target.value)} className={inputCls}>
              <option value="">— Không thuộc khoa —</option>
              {depts.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
            </select>
          </div>

          {/* Tòa nhà + Tầng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tòa nhà <span className="text-[#ba1a1a]">*</span></label>
              <input
                type="text"
                value={form.TenToaNha}
                onChange={e => handle('TenToaNha', e.target.value)}
                placeholder="VD: Nhà A4"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Tầng</label>
              <input
                type="number"
                min="1" max="30"
                value={form.Tang}
                onChange={e => handle('Tang', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Loại phòng */}
          <div>
            <label className={labelCls}>Loại phòng <span className="text-[#ba1a1a]">*</span></label>
            <select value={form.LoaiPhong} onChange={e => handle('LoaiPhong', e.target.value)} required className={inputCls}>
              {LOAI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className={labelCls}>Địa chỉ</label>
            <input
              type="text"
              value={form.DiaChi}
              onChange={e => handle('DiaChi', e.target.value)}
              placeholder="VD: Số 3 Cầu Giấy, Hà Nội"
              className={inputCls}
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className={labelCls}>Ghi chú</label>
            <textarea
              value={form.GhiChu}
              onChange={e => handle('GhiChu', e.target.value)}
              placeholder="VD: Thực hành lập trình - 30 máy"
              rows={3}
              className={inputCls + ' resize-none'}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e1e3e4] bg-[#f8f9fa] rounded-b-xl flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#44474c] border border-[#c4c6cd] rounded-lg hover:bg-[#f3f4f5] transition-colors">
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-2 transition-opacity"
            style={{ backgroundColor: '#26a69a', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Đang lưu...' : '💾 Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RoomDetailView — chi tiết phòng (inline thay thế list)
═══════════════════════════════════════════════════════════════ */
interface RoomDetailProps {
  roomId: number;
  onBack: () => void;
  onEdit: (room: Room) => void;
}

function RoomDetailView({ roomId, onBack, onEdit }: RoomDetailProps) {
  const [room, setRoom]       = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    phongService.getById(roomId)
      .then(setRoom)
      .catch(() => setRoom(null))
      .finally(() => setLoading(false));
  }, [roomId]);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-sm text-[#74777d]">Đang tải...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center gap-3">
        <p className="text-[#74777d]">Không tìm thấy phòng.</p>
        <button onClick={onBack} className="text-sm text-[#26a69a] underline">Quay lại</button>
      </div>
    );
  }

  const assets = room.assets ?? [];

  /* Quick stats */
  const stats = {
    active:      assets.filter(a => a.status === 'active' || a.status === 'borrowed').length,
    broken:      assets.filter(a => a.status === 'broken').length,
    underRepair: assets.filter(a => a.status === 'underRepair').length,
    pending:     assets.filter(a => a.status === 'pendingLiquidation').length,
  };

  const loaiBadge = LOAI_BADGE[room.type] ?? { label: room.type, bg: '#f1f5f9', color: '#64748b' };

  return (
    <div className="flex-1 p-8 flex flex-col gap-5">
      {/* Back + Edit toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#44474c] hover:text-[#26a69a] transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </button>
        <button
          onClick={() => onEdit(room)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity"
          style={{ backgroundColor: '#26a69a' }}
        >
          <Pencil size={14} />
          Sửa thông tin
        </button>
      </div>

      {/* Room info card */}
      <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(38,166,154,0.1)' }}>
              <Building2 size={22} className="text-[#26a69a]" />
            </div>
            <div>
              <h1 className="font-manrope font-bold text-xl text-[#191c1d]">
                {room.name} — {room.building}
              </h1>
              <div className="flex items-center flex-wrap gap-3 mt-1.5 text-sm text-[#44474c]">
                {room.departmentName && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-[#26a69a]" />
                    {room.departmentName}
                  </span>
                )}
                <span>Tầng {room.floor}</span>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: loaiBadge.bg, color: loaiBadge.color }}
                >
                  {loaiBadge.label}
                </span>
                <span className="font-semibold text-[#26a69a]">{assets.length} thiết bị</span>
              </div>
              {room.address && (
                <p className="mt-1 text-xs text-[#74777d]">{room.address}</p>
              )}
              {room.note && (
                <p className="mt-1 text-xs text-[#74777d] italic">{room.note}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        {assets.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#f3f4f5] flex flex-wrap gap-4">
            <StatChip color="#15803d" bg="rgba(34,197,94,0.1)"   label="Đang dùng"    count={stats.active} />
            <StatChip color="#b91c1c" bg="rgba(239,68,68,0.12)"  label="Hỏng"         count={stats.broken} />
            <StatChip color="#c2410c" bg="rgba(249,115,22,0.12)" label="Đang sửa"     count={stats.underRepair} />
            {stats.pending > 0 && <StatChip color="#92400e" bg="rgba(234,179,8,0.12)" label="Chờ thanh lý" count={stats.pending} />}
          </div>
        )}
      </div>

      {/* Asset table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-4 border-b border-[#f3f4f5] flex items-center gap-2">
          <Package size={15} className="text-[#26a69a]" />
          <span className="font-semibold text-sm text-[#191c1d]">Danh sách thiết bị trong phòng</span>
          <span className="ml-auto text-xs text-[#74777d]">{assets.length} thiết bị</span>
        </div>
        {assets.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#74777d]">Phòng chưa có thiết bị nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#00695c] text-xs font-semibold text-white uppercase tracking-wide" style={{ backgroundColor: '#00796b' }}>
                  <th className="px-4 py-3 text-left">Mã QL</th>
                  <th className="px-4 py-3 text-left">Tên thiết bị</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Người dùng</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a, i) => {
                  const sc = ASSET_STATUS_COLOR[a.status] ?? { bg: '#f1f5f9', color: '#64748b', label: a.statusLabel ?? a.status };
                  return (
                    <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-xs font-semibold text-[#26a69a] bg-[rgba(38,166,154,0.08)] px-2 py-0.5 rounded">
                          {a.code}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-[#191c1d]">{a.name}</td>
                      <td className="px-4 py-2.5 text-[#44474c]">{a.categoryName ?? '—'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: sc.bg, color: sc.color }}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#74777d]">{a.assignedTo ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatChip({ color, bg, label, count }: { color: string; bg: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: bg }}>
      <span className="font-bold" style={{ color }}>{count}</span>
      <span className="text-[#44474c]">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RoomManagementPage — main page
═══════════════════════════════════════════════════════════════ */
const RoomManagementPage: React.FC = () => {
  const [rooms,        setRooms]        = useState<Room[]>([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [limit]                         = useState(20);
  const [keyword,      setKeyword]      = useState('');
  const [filterKhoa,   setFilterKhoa]   = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [depts,        setDepts]        = useState<Dept[]>([]);

  const [viewingId,    setViewingId]    = useState<number | null>(null);
  const [showModal,    setShowModal]    = useState(false);
  const [editingRoom,  setEditingRoom]  = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [isDeleting,   setIsDeleting]   = useState(false);

  /* Fetch departments once */
  useEffect(() => {
    apiClient.get('/khoa')
      .then(r => setDepts((r.data.data as Dept[]) ?? []))
      .catch(() => {});
  }, []);

  const fetchRooms = useCallback(() => {
    setIsLoading(true);
    phongService.getAll({
      MaKhoa:  filterKhoa || undefined,
      keyword: keyword    || undefined,
      page,
      limit,
    })
      .then(res => { setRooms(res.items); setTotal(res.pagination.total); })
      .catch(() => { setRooms([]); setTotal(0); })
      .finally(() => setIsLoading(false));
  }, [filterKhoa, keyword, page, limit]);

  useEffect(() => { setPage(1); }, [filterKhoa, keyword]);
  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleDelete = useCallback(async () => {
    if (!deletingRoom) return;
    setIsDeleting(true);
    try {
      await phongService.deleteById(deletingRoom.id);
      setDeletingRoom(null);
      fetchRooms();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setIsDeleting(false);
    }
  }, [deletingRoom, fetchRooms]);

  const openAdd  = ()           => { setEditingRoom(null); setShowModal(true); };
  const openEdit = (room: Room) => { setEditingRoom(room);  setShowModal(true); };
  const onSaved  = ()           => { setShowModal(false);   fetchRooms(); };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  /* ── Detail view ── */
  if (viewingId !== null) {
    return (
      <RoomDetailView
        roomId={viewingId}
        onBack={() => setViewingId(null)}
        onEdit={(room) => { setViewingId(null); openEdit(room); }}
      />
    );
  }

  /* ── List view ── */
  return (
    <div className="flex-1 p-8 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(38,166,154,0.1)' }}>
            <Building2 size={20} className="text-[#26a69a]" />
          </div>
          <div>
            <h1 className="font-manrope font-bold text-xl text-[#191c1d]">Quản lý Phòng</h1>
            <p className="text-xs text-[#74777d]">Danh sách phòng học và phòng máy toàn trường</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#26a69a' }}
        >
          <Plus size={16} />
          Thêm phòng
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl px-5 py-3.5 flex items-center gap-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d]" />
          <input
            type="text"
            placeholder="Tìm tên phòng, tòa nhà..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a] outline-none"
          />
        </div>

        {/* Filter by Khoa */}
        <select
          value={filterKhoa}
          onChange={e => setFilterKhoa(e.target.value)}
          className="px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg bg-white focus:border-[#26a69a] outline-none"
        >
          <option value="">Tất cả Khoa</option>
          {depts.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
        </select>

        <span className="ml-auto text-xs text-[#74777d]">
          {isLoading ? 'Đang tải...' : `${total} phòng`}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#00695c] text-xs font-semibold text-white uppercase tracking-wide" style={{ backgroundColor: '#00796b' }}>
                <th className="px-4 py-3 text-center w-12">STT</th>
                <th className="px-4 py-3 text-left">Tên phòng</th>
                <th className="px-4 py-3 text-left">Tòa nhà</th>
                <th className="px-4 py-3 text-left">Khoa</th>
                <th className="px-4 py-3 text-center w-16">Tầng</th>
                <th className="px-4 py-3 text-left">Loại phòng</th>
                <th className="px-4 py-3 text-center">Số TB</th>
                <th className="px-4 py-3 text-center w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[#f3f4f5]">
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-[#f3f4f5] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#74777d]">
                    Không có phòng nào
                  </td>
                </tr>
              ) : rooms.map((room, i) => (
                <tr
                  key={room.id}
                  className="border-b border-[#f3f4f5] hover:bg-[#fafafa] transition-colors"
                >
                  <td className="px-4 py-3 text-center text-[#74777d]">
                    {(page - 1) * limit + i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#191c1d]">{room.name}</span>
                  </td>
                  <td className="px-4 py-3 text-[#44474c]">{room.building}</td>
                  <td className="px-4 py-3 text-[#44474c]">
                    {room.departmentName ?? <span className="text-[#9aa0a6]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-[#44474c]">{room.floor}</td>
                  <td className="px-4 py-3">
                    <LoaiBadge type={room.type} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {(room.assetCount ?? 0) > 0 ? (
                      <span className="font-bold text-[#191c1d]">{room.assetCount}</span>
                    ) : (
                      <span className="text-[#9aa0a6]">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setViewingId(room.id)}
                        title="Xem chi tiết"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(38,166,154,0.1)] text-[#26a69a]"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(room)}
                        title="Sửa"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#f3f4f5] text-[#44474c]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingRoom(room)}
                        title="Xóa"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 text-[#ba1a1a]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#f3f4f5]">
            <span className="text-xs text-[#74777d]">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total} phòng
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#c4c6cd] bg-white disabled:opacity-40 hover:bg-[#f3f4f5] transition-colors"
              >
                <ChevronLeft size={13} /> Trước
              </button>
              <span className="text-xs font-semibold text-[#191c1d] px-1">{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#c4c6cd] bg-white disabled:opacity-40 hover:bg-[#f3f4f5] transition-colors"
              >
                Tiếp <ChevronLeft size={13} className="rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {showModal && (
        <RoomModal
          room={editingRoom ?? undefined}
          depts={depts}
          onClose={() => setShowModal(false)}
          onSaved={onSaved}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deletingRoom}
        title="Xóa phòng"
        message={
          (deletingRoom?.assetCount ?? 0) > 0
            ? `Phòng "${deletingRoom?.name}" còn ${deletingRoom?.assetCount} thiết bị. Hãy chuyển thiết bị trước khi xóa.`
            : `Bạn có chắc muốn xóa phòng "${deletingRoom?.name}"? Thao tác không thể hoàn tác.`
        }
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingRoom(null)}
      />
    </div>
  );
};

export default RoomManagementPage;
