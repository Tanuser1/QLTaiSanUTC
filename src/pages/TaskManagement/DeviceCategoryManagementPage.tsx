import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { useDeviceCategoryContext } from '../../contexts/DeviceCategoryContext';
import { categoryService } from '../../services/categoryService';
import { CategoryForm } from '../../components/forms/CategoryForm';
import type { CategoryFormData } from '../../components/forms/CategoryForm';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import type { DeviceCategory } from '../../types/DeviceCategory';

/* ─────────────────────────────────────────────────────────────
   DeviceCategoryManagementPage
   - Đọc danh sách categories từ DeviceCategoryContext
   - Sau mỗi thao tác CRUD → gọi refreshCategories() để cập nhật
     Sidebar và toàn bộ app ngay lập tức
───────────────────────────────────────────────────────────── */
const DeviceCategoryManagementPage: React.FC = () => {
  const { categories, isLoading, refreshCategories } = useDeviceCategoryContext();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DeviceCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<DeviceCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── HANDLERS ──────────────────────────────────────────────

  const handleCreate = async (data: CategoryFormData) => {
    setIsSaving(true);
    try {
      await categoryService.create({ ...data, count: 0 });
      refreshCategories(); // ← cập nhật Sidebar + toàn app
      setShowForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (!editingCategory) return;
    setIsSaving(true);
    try {
      await categoryService.update(editingCategory.id, data);
      refreshCategories(); // ← cập nhật Sidebar + toàn app
      setEditingCategory(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    await categoryService.delete(deletingCategory.id);
    refreshCategories(); // ← cập nhật Sidebar + toàn app
    setDeletingCategory(null);
  };

  const openEdit = (cat: DeviceCategory) => {
    setEditingCategory(cat);
  };

  return (
    <div className="flex-1 p-10 flex flex-col">
      {/* ── Page heading ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-[22px] font-bold leading-tight"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#1a237e' }}
          >
            Quản lý danh mục thiết bị
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#546e7a', fontFamily: 'Inter, sans-serif' }}>
            Thêm, chỉnh sửa hoặc xoá danh mục — Sidebar sẽ cập nhật tự động.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded text-white transition-colors shadow-sm"
          style={{ backgroundColor: '#1a237e', fontFamily: 'Inter, sans-serif' }}
        >
          <Plus size={15} />
          Thêm danh mục
        </button>
      </div>

      {/* ── Category list ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-[#74777d]">
          <p className="text-sm">Đang tải danh mục...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e1e3e4] overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {/* Table header */}
          <div
            className="grid gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white border-b"
            style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 120px', backgroundColor: '#1a237e' }}
          >
            <span>Tên danh mục</span>
            <span>Slug</span>
            <span>Mô tả</span>
            <span className="text-right">Số thiết bị</span>
            <span className="text-center">Thao tác</span>
          </div>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#74777d]">
              <Tag size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Chưa có danh mục nào</p>
            </div>
          ) : (
            categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="grid gap-3 px-5 py-3.5 items-center transition-colors hover:bg-[#f8f9fa]"
                style={{
                  gridTemplateColumns: '2fr 2fr 1fr 1fr 120px',
                  borderBottom: idx < categories.length - 1 ? '1px solid #f0f2f5' : 'none',
                }}
              >
                {/* Tên */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(26,35,126,0.08)' }}
                  >
                    <Tag size={13} style={{ color: '#1a237e' }} />
                  </div>
                  <span className="text-sm font-semibold text-[#191c1d]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {cat.name}
                  </span>
                </div>

                {/* Slug */}
                <span className="text-xs font-mono text-[#74777d] truncate">{cat.slug}</span>

                {/* Mô tả */}
                <span className="text-xs text-[#74777d] truncate">{cat.description ?? '—'}</span>

                {/* Count */}
                <span className="text-sm font-semibold tabular-nums text-[#1a237e] text-right" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {cat.count.toLocaleString('vi-VN')}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#44474c] hover:bg-[#e8eaf6] hover:text-[#1a237e] transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingCategory(cat)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#44474c] hover:bg-[#ffebee] hover:text-[#ba1a1a] transition-colors"
                    title="Xoá"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Create Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md" style={{ boxShadow: '0px 12px 32px rgba(0,0,0,0.20)' }}>
            <CategoryForm
              mode="create"
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              isLoading={isSaving}
            />
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
              initialData={{ name: editingCategory.name, slug: editingCategory.slug, description: editingCategory.description }}
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
        title="Xoá danh mục"
        message={`Bạn có chắc muốn xoá danh mục "${deletingCategory?.name}"? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xoá danh mục"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
};

export default DeviceCategoryManagementPage;
