import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, History } from 'lucide-react';
import { bienbanService } from '../../services/bienbanService';
import type { RepairReport } from '../../types/bienban.types';

/* ── helpers ── */
const PROPOSAL_LABEL: Record<string, string> = {
  SuaChua: 'Sửa chữa',
  ThayMoi: 'Thay mới',
  ThanhLy: 'Thanh lý',
};

const fmtCurrency = (n: number) =>
  n.toLocaleString('vi-VN') + ' đ';

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

/* ── Approval modal ── */
interface ApproveModalProps {
  report: RepairReport;
  onClose: () => void;
  onConfirm: (id: number, decision: 'DongY' | 'TuChoi', cost: number, note: string) => Promise<void>;
}
const ApproveModal: React.FC<ApproveModalProps> = ({ report, onClose, onConfirm }) => {
  const [decision, setDecision] = useState<'DongY' | 'TuChoi'>('DongY');
  const [cost, setCost] = useState(String(report.estimatedCost));
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    if (decision === 'TuChoi' && !note.trim()) { alert('Vui lòng nhập lý do từ chối.'); return; }
    setIsSaving(true);
    await onConfirm(report.id, decision, Number(cost) || 0, note);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#191c1d]">Phê duyệt biên bản #{report.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none">&times;</button>
        </div>

        {/* Info */}
        <div className="px-6 py-4 bg-[#f8f9fa] text-sm space-y-1 border-b border-gray-100">
          <p><span className="text-gray-500">KTV lập:</span> <span className="font-medium">{report.technicianName ?? '—'}</span></p>
          <p><span className="text-gray-500">Đề xuất:</span> <span className="font-medium">{PROPOSAL_LABEL[report.proposal] ?? report.proposal}</span></p>
          <p><span className="text-gray-500">Chi phí ước tính:</span> <span className="font-semibold text-amber-600">{fmtCurrency(report.estimatedCost)}</span></p>
          <p><span className="text-gray-500">Chi tiết hỏng:</span> <span>{report.damageDetail}</span></p>
        </div>

        {/* Decision */}
        <div className="px-6 py-4 space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setDecision('DongY')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                decision === 'DongY' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300'
              }`}
            >
              <CheckCircle2 size={16} /> Đồng ý duyệt
            </button>
            <button
              onClick={() => setDecision('TuChoi')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                decision === 'TuChoi' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-red-300'
              }`}
            >
              <XCircle size={16} /> Từ chối
            </button>
          </div>

          {decision === 'DongY' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kinh phí duyệt (VNĐ)</label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                value={cost}
                onChange={e => setCost(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {decision === 'TuChoi' ? 'Lý do từ chối *' : 'Ghi chú (tuỳ chọn)'}
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              placeholder={decision === 'TuChoi' ? 'Nhập lý do từ chối...' : 'Ghi chú thêm nếu cần...'}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSaving}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors ${
              decision === 'DongY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSaving ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Status badge ── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'pending')  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock size={11}/>Chờ duyệt</span>;
  if (status === 'approved') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle2 size={11}/>Đã duyệt</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle size={11}/>Từ chối</span>;
};

/* ── Row component for history ── */
const HistoryRow: React.FC<{ report: RepairReport }> = ({ report }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-gray-500">#{report.id}</td>
      <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">{report.damageDetail}</td>
      <td className="px-4 py-3 text-sm">{PROPOSAL_LABEL[report.proposal] ?? report.proposal}</td>
      <td className="px-4 py-3 text-sm">{report.technicianName ?? '—'}</td>
      <td className="px-4 py-3 text-sm font-medium">{fmtCurrency(report.estimatedCost)}</td>
      <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
      <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(report.createdAt)}</td>
    </tr>
  );
};

/* ── Main page ── */
const BGHDashboard: React.FC = () => {
  const [pending, setPending]     = useState<RepairReport[]>([]);
  const [history, setHistory]     = useState<RepairReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab]             = useState<'pending' | 'history'>('pending');
  const [modalReport, setModalReport] = useState<RepairReport | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      // BGH backend mặc định chỉ trả TrangThai=1, phải gọi riêng từng trạng thái
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        bienbanService.getAll({ TrangThai: '1', limit: 100 }),
        bienbanService.getAll({ TrangThai: '2', limit: 100 }),
        bienbanService.getAll({ TrangThai: '3', limit: 100 }),
      ]);
      setPending(pendingRes.items ?? []);
      setHistory([...(approvedRes.items ?? []), ...(rejectedRes.items ?? [])]);
    } catch {
      console.error('Lỗi khi tải biên bản');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleConfirmApprove = async (id: number, decision: 'DongY' | 'TuChoi', cost: number, note: string) => {
    try {
      await bienbanService.approve(id, { QuyetDinh: decision, KinhPhiDuyet: cost, GhiChu: note });
      setModalReport(null);
      fetchAll();
    } catch {
      alert('Lỗi khi xử lý phê duyệt. Vui lòng thử lại.');
    }
  };



  const tableHead = (cols: string[]) => (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>{cols.map(c => <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{c}</th>)}</tr>
    </thead>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#191c1d]">Biên bản sửa chữa</h1>
        <p className="text-sm text-[#74777d] mt-1">Phê duyệt kinh phí và tra cứu lịch sử xử lý biên bản</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'pending' ? 'bg-white shadow-sm text-[#191c1d]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock size={14} />
          Chờ duyệt
          {pending.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'history' ? 'bg-white shadow-sm text-[#191c1d]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={14} />
          Lịch sử đã xử lý
          <span className="text-xs text-gray-400 font-normal">({history.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e4] overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Đang tải dữ liệu...</div>
        ) : tab === 'pending' ? (
          /* ── Tab: Chờ duyệt ── */
          pending.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle2 size={40} className="text-green-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Không có biên bản nào đang chờ duyệt</p>
            </div>
          ) : (
            <table className="w-full">
              {tableHead(['Mã BB', 'Chi tiết hỏng', 'Đề xuất', 'KTV lập', 'Chi phí ước tính', 'Ngày lập', 'Hành động'])}
              <tbody className="divide-y divide-gray-100">
                {pending.map(r => (
                  <tr key={r.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">#{r.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 max-w-xs">
                      <p className="truncate">{r.damageDetail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{PROPOSAL_LABEL[r.proposal] ?? r.proposal}</td>
                    <td className="px-4 py-3 text-sm">{r.technicianName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-amber-600">{fmtCurrency(r.estimatedCost)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setModalReport(r)}
                        className="px-3 py-1.5 bg-[#1f305e] hover:bg-[#162348] text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Xem & Duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          /* ── Tab: Lịch sử ── */
          history.length === 0 ? (
            <div className="p-10 text-center">
              <History size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Chưa có biên bản nào được xử lý</p>
            </div>
          ) : (
            <table className="w-full">
              {tableHead(['Mã BB', 'Chi tiết hỏng', 'Đề xuất', 'KTV lập', 'Chi phí ước tính', 'Kết quả', 'Ngày lập'])}
              <tbody className="divide-y divide-gray-100">
                {history.map(r => (
                  <HistoryRow
                    key={r.id}
                    report={r}
                  />
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Approve modal */}
      {modalReport && (
        <ApproveModal
          report={modalReport}
          onClose={() => setModalReport(null)}
          onConfirm={handleConfirmApprove}
        />
      )}
    </div>
  );
};

export default BGHDashboard;
