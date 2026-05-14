import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Category {
  id: string;
  label: string;
  slug: string;
  count: number;
}

// Dữ liệu mặc định giả lập từ API
const defaultCategories: Category[] = [
  { id: 'all', label: 'Tất cả', slug: 'all', count: 2500 },
  { id: 'lab', label: 'Máy tính phòng Lab', slug: 'lab', count: 450 },
  { id: 'projector', label: 'Máy chiếu giảng đường', slug: 'projector', count: 120 },
  { id: 'network', label: 'Thiết bị mạng', slug: 'network', count: 85 },
  { id: 'audio', label: 'Micro & Âm thanh', slug: 'audio', count: 150 },
  { id: 'laptop', label: 'Laptop Cán bộ', slug: 'laptop', count: 60 },
  { id: 'parts', label: 'Linh kiện', slug: 'parts', count: 320 },
  { id: 'furniture', label: 'Bàn ghế sinh viên', slug: 'furniture', count: 1315 },
];

interface CategoryContextType {
  categories: Category[];
  // Hàm này gọi khi ở trang "Quản lý tác vụ" thêm danh mục mới
  addCategory: (label: string, slug: string) => void;
  // Hàm này gọi khi ở trang "Tất cả thiết bị" thêm 1 thiết bị cụ thể
  incrementCategoryCount: (slug: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  const addCategory = (label: string, slug: string) => {
    setCategories((prev) => [...prev, { id: slug, label, slug, count: 0 }]);
  };

  const incrementCategoryCount = (slug: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.slug === slug || cat.slug === 'all' ? { ...cat, count: cat.count + 1 } : cat))
    );
  };

  return <CategoryContext.Provider value={{ categories, addCategory, incrementCategoryCount }}>{children}</CategoryContext.Provider>;
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) throw new Error('useCategories must be used within CategoryProvider');
  return context;
};