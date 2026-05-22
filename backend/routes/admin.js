const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware);
router.use(adminOnly);

/**
 * GET /api/admin/dashboard
 * Dùng view v_Dashboard + query thêm số phòng
 */
router.get('/dashboard', async (req, res) => {
    try {
        const [[stats], [[{ totalRooms }]]] = await Promise.all([
            db.query('SELECT * FROM v_Dashboard'),
            db.query('SELECT COUNT(*) AS totalRooms FROM Phong WHERE IsDeleted = 0'),
        ]);

        res.json({
            success: true,
            data: {
                assets: {
                    total:              stats.TongThietBi,
                    active:             stats.DangHoatDong,
                    broken:             stats.DangHong,
                    underRepair:        stats.DangSuaChua,
                    pendingLiquidation: stats.ChoThanhLy,
                },
                rooms: {
                    total: totalRooms,
                },
                supportRequests: {
                    new:        stats.YeuCauMoi,
                    inProgress: stats.YeuCauDangXuLy,
                },
                repairReports: {
                    pendingApproval: stats.BienBanChoDuyet,
                },
                liquidation: {
                    pending: stats.ChoThanhLyKho,
                },
            },
        });
    } catch (error) {
        console.error('[DASHBOARD]', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi thống kê', error: error.message });
    }
});

module.exports = router;
