const PREFIX = 'utc_asset_';

export const storage = {
  /**
   * Lưu giá trị vào localStorage với prefix.
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      console.warn('[storage] Failed to set:', key);
    }
  },

  /**
   * Lấy giá trị từ localStorage, trả về defaultValue nếu không tồn tại.
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Xóa key khỏi localStorage.
   */
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },

  /**
   * Xóa toàn bộ dữ liệu ứng dụng.
   */
  clear(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};
