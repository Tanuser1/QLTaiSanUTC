const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware);
router.use(adminOnly);

/**
 * GET /api/admin/dashboard
 */
router.get('/dashboard', async (req, res) => {
    try {
        const [
            [[stats]],
            [[{ totalRooms }]],
            [recentRequests],
            [recentReports],
            [byDept],
            [byCategory],
        ] = await Promise.all([
            db.query('SELECT * FROM v_Dashboard'),
            db.query('SELECT COUNT(*) AS totalRooms FROM Phong WHERE IsDeleted = 0'),

            // Yêu cầu hỗ trợ mới chờ phân công (TrangThai 1=Mới, 2=Đã tiếp nhận)
            db.query(`
                SELECT yc.MaYeuCau, yc.MoTaLoi, yc.MucDo, yc.NgayTao,
                       ts.MaQuanLy, ts.TenTaiSan,
                       p.TenPhong, p.TenToaNha,
                       nd.HoTen AS TenNguoiBao
                FROM YeuCauHoTro yc
                LEFT JOIN TaiSan ts ON ts.MaTaiSan = yc.MaTaiSan
                LEFT JOIN Phong  p  ON p.MaPhong   = ts.MaPhong
                LEFT JOIN NguoiDung nd ON nd.MaNguoiDung = yc.MaNguoiBao
                WHERE yc.TrangThai IN (1, 2)
                ORDER BY yc.NgayTao DESC
                LIMIT 5
            `),

            // Biên bản sửa chữa chờ duyệt kinh phí (TrangThai 1=Chờ duyệt)
            db.query(`
                SELECT bb.MaBienBan, bb.ChiPhiUocTinh, bb.NgayLap,
                       ts.MaQuanLy, ts.TenTaiSan,
                       p.TenPhong, p.TenToaNha,
                       nd.HoTen AS TenKTV
                FROM BienBanSuaChua bb
                LEFT JOIN YeuCauHoTro yc ON yc.MaYeuCau  = bb.MaYeuCau
                LEFT JOIN TaiSan ts      ON ts.MaTaiSan   = yc.MaTaiSan
                LEFT JOIN Phong  p       ON p.MaPhong     = ts.MaPhong
                LEFT JOIN NguoiDung nd   ON nd.MaNguoiDung = bb.MaKTV
                WHERE bb.TrangThai = 1
                ORDER BY bb.NgayLap DESC
                LIMIT 5
            `),

            // Thiết bị theo khoa (bar chart)
            db.query(`
                SELECT k.KyHieu AS code, k.TenKhoa AS name,
                       COUNT(ts.MaTaiSan) AS count
                FROM TaiSan ts
                LEFT JOIN Phong p   ON p.MaPhong = ts.MaPhong
                LEFT JOIN Khoa  k   ON k.MaKhoa  = p.MaKhoa
                WHERE ts.IsDeleted = 0 AND ts.TrangThai != 0
                GROUP BY k.MaKhoa, k.TenKhoa, k.KyHieu
                ORDER BY count DESC
                LIMIT 8
            `),

            // Thiết bị theo nhóm loại (donut chart)
            db.query(`
                SELECT COALESCE(lt.NhomLoai, 'Khác') AS \`group\`,
                       COUNT(ts.MaTaiSan) AS count
                FROM TaiSan ts
                LEFT JOIN LoaiTaiSan lt ON lt.MaLoai = ts.MaLoai
                WHERE ts.IsDeleted = 0 AND ts.TrangThai != 0
                GROUP BY lt.NhomLoai
                ORDER BY count DESC
                LIMIT 6
            `),
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
                rooms:           { total: totalRooms },
                supportRequests: { new: stats.YeuCauMoi, inProgress: stats.YeuCauDangXuLy },
                repairReports:   { pendingApproval: stats.BienBanChoDuyet },
                liquidation:     { pending: stats.ChoThanhLyKho },

                recentSupportRequests: recentRequests.map(r => ({
                    id:          r.MaYeuCau,
                    assetCode:   r.MaQuanLy  ?? '—',
                    assetName:   r.TenTaiSan ?? '—',
                    location:    [r.TenToaNha, r.TenPhong].filter(Boolean).join(' ') || '—',
                    description: r.MoTaLoi,
                    priority:    r.MucDo,
                    reporter:    r.TenNguoiBao ?? '—',
                    createdAt:   r.NgayTao,
                })),

                recentRepairReports: recentReports.map(r => ({
                    id:             r.MaBienBan,
                    assetCode:      r.MaQuanLy      ?? '—',
                    assetName:      r.TenTaiSan     ?? '—',
                    location:       [r.TenToaNha, r.TenPhong].filter(Boolean).join(' ') || '—',
                    estimatedCost:  r.ChiPhiUocTinh ?? 0,
                    technicianName: r.TenKTV        ?? '—',
                    createdAt:      r.NgayLap,
                })),

                assetsByDepartment: byDept.map(r => ({
                    code:  r.code  ?? 'Khác',
                    name:  r.name  ?? 'Chưa phân khoa',
                    count: r.count,
                })),

                assetsByCategory: byCategory.map(r => ({
                    group: r.group ?? 'Khác',
                    count: r.count,
                })),
            },
        });
    } catch (error) {
        console.error('[DASHBOARD]', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi thống kê', error: error.message });
    }
});

module.exports = router;
