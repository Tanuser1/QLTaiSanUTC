import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DeviceCategory } from '../types/DeviceCategory';
import { categoryService } from '../services/categoryService';
import { authService } from '../services/authService';

interface DeviceCategoryContextValue {
  categories:        DeviceCategory[];
  isLoading:         boolean;
  error:             string | null;
  refreshCategories: () => void;
}

const DeviceCategoryContext = createContext<DeviceCategoryContextValue | null>(null);

export function useDeviceCategoryContext(): DeviceCategoryContextValue {
  const ctx = useContext(DeviceCategoryContext);
  if (!ctx) throw new Error('useDeviceCategoryContext must be inside <DeviceCategoryProvider>');
  return ctx;
}

export const DeviceCategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    // Không gọi API khi chưa đăng nhập — tránh vòng lặp reload do 401
    if (!authService.isAuthenticated()) return;

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

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return (
    <DeviceCategoryContext.Provider
      value={{ categories, isLoading, error, refreshCategories: fetchCategories }}
    >
      {children}
    </DeviceCategoryContext.Provider>
  );
};

export default DeviceCategoryProvider;
