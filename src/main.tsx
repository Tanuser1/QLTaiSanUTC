import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DeviceCategoryProvider } from './contexts/DeviceCategoryContext.tsx'

/**
 * main.tsx – Entry point
 *
 * DeviceCategoryProvider bọc toàn bộ App để:
 * - Sidebar (components/layout/Sidebar.tsx) đọc categories từ context
 * - DeviceCategoryManagementPage gọi refreshCategories() sau CRUD
 *   → Sidebar tự cập nhật mà không cần reload trang
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DeviceCategoryProvider>
      <App />
    </DeviceCategoryProvider>
  </StrictMode>,
)
