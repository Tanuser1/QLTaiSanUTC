import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DeviceCategory } from '../types/DeviceCategory';
import { categoryService } from '../services/categoryService';

/* ─────────────────────────────────────────────────────────────────────────────
   CONTEXT SHAPE
───────────────────────────────────────────────────────────────────────────── */
interface DeviceCategoryContextValue {
  /** Danh sách tất cả categories */
  categories: DeviceCategory[];
  /** Đang fetch lần đầu */
  isLoading: boolean;
  /** Lỗi nếu có */
  error: string | null;
  /** Gọi lại để refresh danh sách (sau CRUD) */
  refreshCategories: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONTEXT + HOOK
───────────────────────────────────────────────────────────────────────────── */
const DeviceCategoryContext = createContext<DeviceCategoryContextValue | null>(null);

export function useDeviceCategoryContext(): DeviceCategoryContextValue {
  const ctx = useContext(DeviceCategoryContext);
  if (!ctx) {
    throw new Error('useDeviceCategoryContext must be used inside <DeviceCategoryProvider>');
  }
  return ctx;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROVIDER
───────────────────────────────────────────────────────────────────────────── */
interface DeviceCategoryProviderProps {
  children: React.ReactNode;
}

export const DeviceCategoryProvider: React.FC<DeviceCategoryProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh mục thiết bị');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch lần đầu khi mount
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return (
    <DeviceCategoryContext.Provider
      value={{
        categories,
        isLoading,
        error,
        refreshCategories: fetchCategories,
      }}
    >
      {children}
    </DeviceCategoryContext.Provider>
  );
};

export default DeviceCategoryProvider;
