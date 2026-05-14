import { useState, useEffect, useCallback } from 'react';
import type { Device, DeviceFormData } from '../types/Device';
import { deviceService } from '../services/deviceService';

interface UseDevicesReturn {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  create: (data: DeviceFormData) => Promise<void>;
  update: (id: string, data: Partial<Device>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useDevices(): UseDevicesReturn {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deviceService.getAll();
      setDevices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách thiết bị');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const create = useCallback(async (data: DeviceFormData) => {
    const newDevice = await deviceService.create(data);
    setDevices((prev) => [...prev, newDevice]);
  }, []);

  const update = useCallback(async (id: string, data: Partial<Device>) => {
    const updated = await deviceService.update(id, data);
    setDevices((prev) => prev.map((d) => (d.id === id ? updated : d)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await deviceService.delete(id);
    setDevices((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { devices, isLoading, error, refresh: fetchDevices, create, update, remove };
}
