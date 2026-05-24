const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { mapUser, paginatedResponse } = require('../mappers');

router.use(authMiddleware);
router.use(adminOnly);

/**
 * GET /api/users
 * Query: ?keyword=&VaiTro=&TrangThai=&MaKhoa=&page=1&limit=20
 */
router.get('/', async (req, res) => {
    try {
        const { keyword, VaiTro, TrangThai, MaKhoa, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = 'WHERE nd.IsDeleted = 0';
        const params = [];

        if (keyword) {
            where += ' AND (nd.HoTen LIKE ? OR nd.TenDangNhap LIKE ? OR nd.Email LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }
        if (VaiTro)                           { where += ' AND nd.VaiTro = ?';    params.push(VaiTro); }
        if (TrangThai !== undefined && TrangThai !== '') { where += ' AND nd.TrangThai = ?'; params.push(TrangThai); }
        if (MaKhoa)                           { where += ' AND nd.MaKhoa = ?';    params.push(MaKhoa); }

        const [rows] = await db.query(
            `SELECT nd.MaNguoiDung, nd.MaKhoa, nd.TenDangNhap, nd.HoTen, nd.Email,
                    nd.SoDienThoai, nd.VaiTro, nd.TrangThai, nd.LanDangNhapCuoi,
                    nd.NgayTao, nd.DaDoiMatKhau,
                    k.TenKhoa
             FROM NguoiDung nd
             LEFT JOIN Khoa k ON k.MaKhoa = nd.MaKhoa
             ${where}
             ORDER BY nd.NgayTao DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM NguoiDung nd ${where}`, params
        );

        res.json({
            success: true,
            data: paginatedResponse(rows.map(mapUser), total, parseInt(page), parseInt(limit)),
        });
    } catch (error) {
        console.error('[USERS GET ALL]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/users
 * Body: { TenDangNhap, MatKhau, HoTen, VaiTro?, MaKhoa?, Email?, SoDienThoai? }
 */
router.post('/', async (req, res) => {
    try {
        const {
            TenDangNhap, MatKhau, HoTen,
            VaiTro = 'GiaoVien', MaKhoa, Email, SoDienThoai,
        } = req.body;

        if (!TenDangNhap || !MatKhau || !HoTen) {
            return res.status(400).json({ success: false, message: 'TenDangNhap, MatKhau và HoTen là bắt buộc' });
        }

        const [[existing]] = await db.query(
            `SELECT MaNguoiDung FROM NguoiDung WHERE TenDangNhap = ? AND IsDeleted = 0`, [TenDangNhap]
        );
        if (existing) return res.status(409).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });

        const hashed = await bcrypt.hash(MatKhau, 10);

        const [result] = await db.query(
            `INSERT INTO NguoiDung (TenDangNhap, MatKhau, HoTen, VaiTro, MaKhoa, Email, SoDienThoai, TrangThai, DaDoiMatKhau)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)`,
            [TenDangNhap, hashed, HoTen, VaiTro, MaKhoa || null, Email || null, SoDienThoai || null]
        );

        const [[newUser]] = await db.query(
            `SELECT nd.*, k.TenKhoa FROM NguoiDung nd LEFT JOIN Khoa k ON k.MaKhoa = nd.MaKhoa WHERE nd.MaNguoiDung = ?`,
            [result.insertId]
        );
        res.status(201).json({ success: true, message: 'Tạo người dùng thành công', data: mapUser(newUser) });
    } catch (error) {
        console.error('[USERS POST]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * PUT /api/users/:id/toggle-status  — khóa / mở khóa
 */
router.put('/:id/toggle-status', async (req, res) => {
    try {
        const { id } = req.params;

        const [[user]] = await db.query(
            `SELECT MaNguoiDung, TrangThai, VaiTro FROM NguoiDung WHERE MaNguoiDung = ? AND IsDeleted = 0`, [id]
        );
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

        if (String(id) === String(req.user.MaNguoiDung)) {
            return res.status(409).json({ success: false, message: 'Không thể khóa tài khoản của chính mình' });
        }

        const newStatus = user.TrangThai === 1 ? 0 : 1;
        await db.query(`UPDATE NguoiDung SET TrangThai = ? WHERE MaNguoiDung = ?`, [newStatus, id]);

        res.json({
            success: true,
            message: newStatus === 1 ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
            data: { isActive: newStatus === 1 },
        });
    } catch (error) {
        console.error('[USERS TOGGLE STATUS]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * PUT /api/users/:id/reset-password
 * Body: { MatKhauMoi }
 */
router.put('/:id/reset-password', async (req, res) => {
    try {
        const { id } = req.params;
        const { MatKhauMoi } = req.body;

        if (!MatKhauMoi) return res.status(400).json({ success: false, message: 'MatKhauMoi là bắt buộc' });

        const [[user]] = await db.query(
            `SELECT MaNguoiDung FROM NguoiDung WHERE MaNguoiDung = ? AND IsDeleted = 0`, [id]
        );
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

        const hashed = await bcrypt.hash(MatKhauMoi, 10);
        await db.query(
            `UPDATE NguoiDung SET MatKhau = ?, DaDoiMatKhau = 0 WHERE MaNguoiDung = ?`,
            [hashed, id]
        );

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        console.error('[USERS RESET PWD]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
