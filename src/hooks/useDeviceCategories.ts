import { useState, useEffect, useCallback } from 'react';
import type { DeviceCategory } from '../types/DeviceCategory';
import { categoryService } from '../services/categoryService';

interface UseDeviceCategoriesReturn {
  categories: DeviceCategory[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDeviceCategories(): UseDeviceCategoriesReturn {
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
      setError(err instanceof Error ? err.message : 'Không thể tải danh mục');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return { categories, isLoading, error, refresh: fetchCategories };
}
