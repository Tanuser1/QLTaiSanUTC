/**
 * src/services/apiClient.ts
 * Axios instance dùng chung cho toàn bộ frontend.
 * Tự động đính kèm JWT token và xử lý lỗi 401.
 */
import axios from 'axios';
import { storage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: tự gắn Bearer token ──────────────────
apiClient.interceptors.request.use((config) => {
  const token = storage.get<string>('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: xử lý 401 (token hết hạn) ──────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ redirect khi server trả về 401 (token hết hạn/không hợp lệ)
    // KHÔNG redirect khi lỗi mạng (BE đang tắt) - tránh vòng lặp reload
    // Chỉ redirect khi token hết hạn trên các route đã authed,
    // KHÔNG redirect khi chính request login trả về 401 (sai mật khẩu)
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const hadToken = !!storage.get('token'); // chỉ redirect khi token đã tồn tại (hết hạn), không redirect khi chưa đăng nhập
    if (error.response?.status === 401 && !isLoginRequest && hadToken) {
      storage.remove('token');
      storage.remove('auth_user');
      window.location.href = '/login';
    }
    const message =
      error.response?.data?.message ||
      (error.code === 'ERR_NETWORK' ? 'Không kết nối được server backend (http://localhost:5000)' : error.message) ||
      'Lỗi không xác định';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
