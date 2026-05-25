/**
 * hooks/useAuth.ts
 * Wrapper mỏng re-export từ AuthContext để giữ backward compatibility
 * với các component đã dùng useAuth() trước khi có AuthContext.
 *
 * Cho code mới, ưu tiên dùng useAuthContext() trực tiếp.
 */
import { useAuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const ctx = useAuthContext();
  return {
    user:            ctx.user,
    isAuthenticated: ctx.isAuthenticated,
    isLoading:       ctx.isLoading,
    error:           ctx.error,
    login:           ctx.login,
    logout:          ctx.logout,
  };
}

