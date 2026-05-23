import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from '../../components/common/DataTable';
import { AssetDetailView } from './AssetDetailPage';
import AddDeviceModal from '../../components/modals/AddDeviceModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { taiSanService } from '../../services/taiSanService';
import type { ApiAsset } from '../../types/Asset';
import type { TableRowData } from '../../components/common/DataTable';
import type { StatusType } from '../../components/common/StatusChip';

/* ── Status mapping BE → StatusChip ── */
const STATUS_MAP: Record<string, StatusType> = {
  active:             'active',
  borrowed:           'active',
  broken:             'maintenance',
  underRepair:        'maintenance',
  pendingLiquidation: 'pending',
  liquidated:         'inactive',
};

function mapToTableRow(a: ApiAsset): TableRowData {
  return {
    id:         String(a.id),
    assetCode:  a.code,
    assetName:  a.name,
    category:   a.categoryName  ?? '—',
    value:      a.price != null
                  ? a.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                  : '—',
    assignedTo: a.assignedTo ?? '—',
    specs: a.specs
      ? Object.entries(a.specs).map(([k, v]) => `${k}: ${v}`).join(' · ')
      : '—',
    location:   [a.roomName, a.building].filter(Boolean).join(' - ') || '—',
    status:     STATUS_MAP[a.status] ?? 'inactive',
    assetType:  a.categoryGroup ?? '—',
  };
}

const DeviceByCategoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const loaiId  = searchParams.get('loai');
  const catName = searchParams.get('catName') ?? undefined;

  /* ── view state: null = danh sách, string = chi tiết asset ── */
  const [viewingId, setViewingId] = useState<string | null>(null);

  const [rows,         setRows]         = useState<TableRowData[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [limit,        setLimit]        = useState(20);
  const [keyword,      setKeyword]      = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingRow,  setDeletingRow]  = useState<TableRowData | null>(null);
  const [isDeleting,   setIsDeleting]   = useState(false);

  const handleLimitChange = useCallback((n: number) => { setLimit(n); setPage(1); }, []);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    taiSanService
      .getAll({ loai: loaiId ?? undefined, page, limit, keyword: keyword || undefined })
      .then((res) => { setRows(res.items.map(mapToTableRow)); setTotal(res.pagination.total); })
      .catch(() => { setRows([]); setTotal(0); })
      .finally(() => setIsLoading(false));
  }, [loaiId, page, limit, keyword]);

  useEffect(() => { setPage(1); setViewingId(null); }, [loaiId]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = useCallback((q: string) => { setKeyword(q); setPage(1); }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingRow) return;
    setIsDeleting(true);
    try {
      await taiSanService.deleteById(deletingRow.id);
      setDeletingRow(null);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setIsDeleting(false);
    }
  }, [deletingRow, fetchData]);

  /* ── Chi tiết asset (inline, thay thế table) ── */
  if (viewingId) {
    return (
      <AssetDetailView
        assetId={viewingId}
        onBack={() => setViewingId(null)}
      />
    );
  }

  /* ── Danh sách ── */
  return (
    <div className="flex-1 p-8 flex flex-col">
      <DataTable
        rows={rows}
        isLoading={isLoading}
        serverTotal={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        onSearch={handleSearch}
        categoryName={catName}
        onAddAsset={() => setShowAddModal(true)}
        onViewRow={(row) => setViewingId(row.id)}
        onDeleteRow={setDeletingRow}
      />

      <ConfirmModal
        isOpen={!!deletingRow}
        title="Xóa thiết bị"
        message={`Bạn có chắc muốn xóa "${deletingRow?.assetName}" (${deletingRow?.assetCode})? Thao tác này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingRow(null)}
      />

      {showAddModal && (
        <AddDeviceModal
          defaultCategoryId={loaiId ? Number(loaiId) : undefined}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); fetchData(); }}
        />
      )}
    </div>
  );
};

export default DeviceByCategoryPage;
