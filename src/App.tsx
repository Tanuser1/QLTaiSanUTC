import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

/**
 * App – Entry point của ứng dụng.
 *
 * BrowserRouter được giữ ở đây (cùng level với DeviceCategoryProvider trong main.tsx).
 * Tất cả routing được delegate sang routes/AppRoutes.tsx.
 *
 * Cấu trúc routing (xem routes/AppRoutes.tsx):
 *   /            → redirect /login
 *   /login       → pages/Auth/LoginPage
 *   /dashboard   → pages/Dashboard/DashboardPage    ┐
 *   /assets      → pages/DeviceManagement/...       │  AdminLayout
 *   /tasks/*     → pages/TaskManagement/...         │  (Sidebar + Header)
 *   /reports/*   → pages/Reports/...                ┘
 *   *            → redirect /login
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
