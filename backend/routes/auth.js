const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const { mapUser } = require('../mappers');

/**
 * POST /api/auth/login
 * Body: { TenDangNhap, MatKhau }
 */
router.post('/login', async (req, res) => {
    try {
        const { TenDangNhap, MatKhau } = req.body;

        if (!TenDangNhap || !MatKhau) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
        }

        const [rows] = await db.query(
            `SELECT MaNguoiDung, MaKhoa, TenDangNhap, MatKhau, HoTen, Email,
                    SoDienThoai, VaiTro, TrangThai, SoLanDangNhapSai,
                    DaDoiMatKhau, LanDangNhapCuoi, NgayTao, IsDeleted
             FROM NguoiDung
             WHERE TenDangNhap = ? AND IsDeleted = 0`,
            [TenDangNhap]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Tên đăng nhập không tồn tại' });
        }

        const user = rows[0];

        // TẠM TẮT: Kiểm tra tài khoản bị khóa (để dễ dev)
        // if (user.TrangThai === 0) {
        //     return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên' });
        // }

        const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);

        if (!isMatch) {
            // TẠM TẮT: Đếm số lần sai và khóa tài khoản (để dễ dev)
            // await db.query(
            //     `UPDATE NguoiDung SET SoLanDangNhapSai = SoLanDangNhapSai + 1 WHERE MaNguoiDung = ?`,
            //     [user.MaNguoiDung]
            // );

            // if (user.SoLanDangNhapSai + 1 >= 5) {
            //     await db.query(`UPDATE NguoiDung SET TrangThai = 0 WHERE MaNguoiDung = ?`, [user.MaNguoiDung]);
            //     return res.status(403).json({ success: false, message: 'Tài khoản bị khóa do đăng nhập sai quá nhiều lần' });
            // }

            return res.status(401).json({ success: false, message: 'Mật khẩu không đúng' });
        }

        await db.query(
            `UPDATE NguoiDung SET SoLanDangNhapSai = 0, LanDangNhapCuoi = NOW() WHERE MaNguoiDung = ?`,
            [user.MaNguoiDung]
        );

        const token = jwt.sign(
            {
                MaNguoiDung: user.MaNguoiDung,
                TenDangNhap: user.TenDangNhap,
                HoTen:       user.HoTen,
                VaiTro:      user.VaiTro,
                MaKhoa:      user.MaKhoa ?? null,
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: mapUser(user),
        });
    } catch (error) {
        console.error('[AUTH LOGIN]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
