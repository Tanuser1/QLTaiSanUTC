/**
 * routes/thongbao.js
 * Thông báo trong hệ thống — mọi vai trò đều có quyền xem thông báo của mình
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { mapNotification } = require('../mappers');

router.use(authMiddleware);

// ─── GET /api/thongbao ────────────────────────────────────────────────────────
/**
 * Lấy thông báo của người đang đăng nhập
 * Query: ?chuaDoc=true (chỉ chưa đọc) | ?page=1&limit=20
 */
router.get('/', async (req, res) => {
    try {
        const { chuaDoc, page = 1, limit = 20 } = req.query;
        const { MaNguoiDung } = req.user;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = 'WHERE NguoiNhan = ?';
        const params = [MaNguoiDung];

        if (chuaDoc === 'true') {
            where += ' AND DaDoc = 0';
        }

        const [rows] = await db.query(
            `SELECT * FROM ThongBao ${where} ORDER BY NgayTao DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM ThongBao ${where}`, params
        );

        const [[{ unreadCount }]] = await db.query(
            `SELECT COUNT(*) AS unreadCount FROM ThongBao WHERE NguoiNhan = ? AND DaDoc = 0`,
            [MaNguoiDung]
        );

        res.json({
            success: true,
            data: {
                items: rows.map(mapNotification),
                unreadCount: Number(unreadCount),
                pagination: {
                    total: Number(total),
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(Number(total) / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('[THONGBAO GET]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── PUT /api/thongbao/:id/doc ────────────────────────────────────────────────
/**
 * Đánh dấu một thông báo đã đọc
 */
router.put('/:id/doc', async (req, res) => {
    try {
        const { id } = req.params;
        const { MaNguoiDung } = req.user;

        const [[tb]] = await db.query(
            `SELECT MaThongBao FROM ThongBao WHERE MaThongBao = ? AND NguoiNhan = ?`,
            [id, MaNguoiDung]
        );
        if (!tb) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });

        await db.query(`UPDATE ThongBao SET DaDoc = 1 WHERE MaThongBao = ?`, [id]);
        res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        console.error('[THONGBAO DOC]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── PUT /api/thongbao/doc-tat-ca ─────────────────────────────────────────────
/**
 * Đánh dấu tất cả thông báo của mình là đã đọc
 */
router.put('/doc-tat-ca', async (req, res) => {
    try {
        const { MaNguoiDung } = req.user;
        await db.query(
            `UPDATE ThongBao SET DaDoc = 1 WHERE NguoiNhan = ? AND DaDoc = 0`, [MaNguoiDung]
        );
        res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
    } catch (error) {
        console.error('[THONGBAO DOC TAT CA]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
