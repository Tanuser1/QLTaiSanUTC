import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, ChevronRight } from 'lucide-react';
import { useDeviceCategoryContext } from '../../contexts/DeviceCategoryContext';
import { categoryService } from '../../services/categoryService';
import { CategoryForm } from '../../components/forms/CategoryForm';
import type { CategoryFormData } from '../../components/forms/CategoryForm';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import type { DeviceCategory } from '../../types/DeviceCategory';

const DeviceCategoryManagementPage: React.FC = () => {
  const { categories, isLoading, refreshCategories } = useDeviceCategoryContext();

  const [showForm,         setShowForm]         = useState(false);
  const [editingCategory,  setEditingCategory]  = useState<DeviceCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<DeviceCategory | null>(null);
  const [isSaving,         setIsSaving]         = useState(false);

  const handleCreate = async (data: CategoryFormData) => {
    setIsSaving(true);
    try {
      await categoryService.create(data);
      refreshCategories();
      setShowForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (!editingCategory) return;
    setIsSaving(true);
    try {
      await categoryService.update(String(editingCategory.id), data);
      refreshCategories();
      setEditingCategory(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    await categoryService.delete(String(deletingCategory.id));
    refreshCategories();
    setDeletingCategory(null);
  };

  return (
    <div className="flex-1 p-10 flex flex-col">
      {/* ── Heading ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[22px] font-bold leading-tight" style={{ fontFamily: 'Manrope, sans-serif', color: '#1a237e' }}>
            Quản lý loại tài sản
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#546e7a', fontFamily: 'Inter, sans-serif' }}>
            Thêm, chỉnh sửa hoặc xoá loại tài sản — Sidebar cập nhật tự động.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded text-white shadow-sm transition-colors"
          style={{ backgroundColor: '#1a237e' }}
        >
          <Plus size={15} />
          Thêm loại tài sản
        </button>
      </div>

      {/* ── List ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-[#74777d]">
          <p className="text-sm">Đang tải...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e1e3e4] overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div
            className="grid gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white border-b"
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', backgroundColor: '#1a237e' }}
          >
            <span>Tên loại tài sản</span>
            <span>Ký hiệu</span>
            <span>Nhóm</span>
            <span className="text-right">Loại con</span>
            <span className="text-center">Thao tác</span>
          </div>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#74777d]">
              <Tag size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Chưa có loại tài sản nào</p>
            </div>
          ) : (
            categories.map((cat, idx) => (
              <React.Fragment key={cat.id}>
                {/* Parent row */}
                <div
                  className="grid gap-3 px-5 py-3.5 items-center hover:bg-[#f8f9fa] transition-colors"
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
                    borderBottom: idx < categories.length - 1 ? '1px solid #f0f2f5' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(26,35,126,0.08)' }}>
                      <Tag size={13} style={{ color: '#1a237e' }} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#191c1d]">{cat.name}</span>
                      {cat.note && <p className="text-[11px] text-[#74777d] truncate max-w-[160px]">{cat.note}</p>}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#74777d]">{cat.code ?? '—'}</span>
                  <span className="text-xs text-[#74777d]">{cat.group ?? '—'}</span>
                  <span className="text-sm font-semibold tabular-nums text-[#1a237e] text-right">
                    {cat.children.length}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setEditingCategory(cat)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#44474c] hover:bg-[#e8eaf6] hover:text-[#1a237e] transition-colors" title="Chỉnh sửa">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeletingCategory(cat)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#44474c] hover:bg-[#ffebee] hover:text-[#ba1a1a] transition-colors" title="Xoá">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Child rows */}
                {cat.children.map(child => (
                  <div
                    key={child.id}
                    className="grid gap-3 px-5 py-2.5 items-center bg-[#fafbff] hover:bg-[#f0f2ff] transition-colors"
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', borderBottom: '1px solid #f0f2f5' }}
                  >
                    <div className="flex items-center gap-2 pl-8">
                      <ChevronRight size={12} className="text-[#c4c6cd] flex-shrink-0" />
                      <span className="text-xs text-[#44474c]">{child.name}</span>
                    </div>
                    <span className="text-xs font-mono text-[#74777d]">{child.code ?? '—'}</span>
                    <span className="text-xs text-[#74777d]">{child.group ?? '—'}</span>
                    <span className="text-xs text-right text-[#74777d]">—</span>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setEditingCategory(child)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#44474c] hover:bg-[#e8eaf6] hover:text-[#1a237e] transition-colors" title="Chỉnh sửa">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeletingCategory(child)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#44474c] hover:bg-[#ffebee] hover:text-[#ba1a1a] transition-colors" title="Xoá">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))
          )}
        </div>
      )}

      {/* ── Create Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md" style={{ boxShadow: '0px 12px 32px rgba(0,0,0,0.20)' }}>
            <CategoryForm mode="create" onSubmit={handleCreate} onCancel={() => setShowForm(false)} isLoading={isSaving} />
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
          <div className="relative bg-white rounded-xl w-full max-w-md" style={{ boxShadow: '0px 12px 32px rgba(0,0,0,0.20)' }}>
            <CategoryForm
              mode="edit"
              initialData={{
                TenLoai:   editingCategory.name,
                KyHieu:    editingCategory.code  ?? '',
                NhomLoai:  editingCategory.group ?? '',
                GhiChu:    editingCategory.note  ?? '',
                ThuTu:     editingCategory.sortOrder,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCategory(null)}
              isLoading={isSaving}
            />
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        title="Xoá loại tài sản"
        message={`Bạn có chắc muốn xoá "${deletingCategory?.name}"? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
};

export default DeviceCategoryManagementPage;
