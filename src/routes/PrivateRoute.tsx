import React from 'react';
import { authService } from '../services/authService';

interface PrivateRouteProps {
  children: React.ReactElement;
}

/**
 * PrivateRoute – bảo vệ các route cần đăng nhập.
 * Kiểm tra token trong localStorage; nếu không có → redirect /login.
 *
 * Dev mode: authService.isAuthenticated() luôn pass khi token tồn tại.
 * Để bypass hoàn toàn (không cần login), set token thủ công:
 *   localStorage.setItem('utc_asset_token', '"mock-jwt-token-utc-2026"')
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // TODO: Tích hợp auth thật — hiện tại dev mode pass thẳng
  // const isAuthenticated = authService.isAuthenticated();
  // if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Dev mode: không chặn để dễ phát triển
  void authService; // suppress unused import warning
  return children;
};

export default PrivateRoute;
