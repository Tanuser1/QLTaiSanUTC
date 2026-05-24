const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================================================
// Middlewares
// ============================================================
// Cấu hình CORS – cho phép FE (Vite :5173) gửi request có Authorization header
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh (ảnh upload)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// Routes
// ============================================================
const authRoutes        = require('./routes/auth');
const phongRoutes       = require('./routes/phong');
const taiSanRoutes      = require('./routes/taisan');
const loaiTaiSanRoutes  = require('./routes/loaitaisan');
const linhKienRoutes    = require('./routes/linhkien');
const adminRoutes       = require('./routes/admin'); // Dashboard
const nhaCungCapRoutes  = require('./routes/nhacc');
const khoaRoutes        = require('./routes/khoa');
const userRoutes        = require('./routes/users');

// ---- Auth ----
app.use('/api/auth', authRoutes);

// ---- Phòng ----
app.use('/api/phong', phongRoutes);

// ---- Tài sản ----
app.use('/api/taisan', taiSanRoutes);

// ---- Linh kiện / Thiết bị con (nested dưới taisan) ----
app.use('/api/taisan', linhKienRoutes);

// ---- Loại tài sản ----
app.use('/api/loai-taisan', loaiTaiSanRoutes);

// ---- Dashboard Admin ----
app.use('/api/admin', adminRoutes);

// ---- Nhà Cung Cấp ----
app.use('/api/nhacc', nhaCungCapRoutes);

// ---- Khoa / Đơn vị ----
app.use('/api/khoa', khoaRoutes);

// ---- Người dùng ----
app.use('/api/users', userRoutes);

// ============================================================
// Health check
// ============================================================
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server QLTaiSanUTC đang chạy', timestamp: new Date() });
});

// ============================================================
// 404 handler
// ============================================================
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} không tồn tại` });
});

// ============================================================
// Error handler
// ============================================================
app.use((err, req, res, next) => {
    console.error('[GLOBAL ERROR]', err);
    res.status(500).json({ success: false, message: 'Lỗi server không xác định', error: err.message });
});

// ============================================================
// Start server
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server QLTaiSanUTC đang chạy tại http://localhost:${PORT}`);
    console.log(`   API docs: xem file API_DOCS.md`);
});
