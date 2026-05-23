const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { mapDepartment } = require('../mappers');

router.use(authMiddleware);

/**
 * GET /api/khoa
 * Danh sách tất cả khoa / đơn vị
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT MaKhoa, TenKhoa, KyHieu, MoTa, NgayTao FROM Khoa ORDER BY TenKhoa`
        );
        res.json({ success: true, data: rows.map(mapDepartment) });
    } catch (error) {
        console.error('[KHOA GET ALL]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
