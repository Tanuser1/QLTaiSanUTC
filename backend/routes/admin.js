
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
            db.query(`
                SELECT
                    (SELECT COALESCE(SUM(SoLuong),0) FROM TaiSan WHERE IsDeleted=0)                         AS TongThietBi,
                    (SELECT COALESCE(SUM(SoLuong),0) FROM TaiSan WHERE TrangThai=1 AND IsDeleted=0)         AS DangHoatDong,
                    (SELECT COALESCE(SUM(SoLuong),0) FROM TaiSan WHERE TrangThai=3 AND IsDeleted=0)         AS DangHong,
                    (SELECT COALESCE(SUM(SoLuong),0) FROM TaiSan WHERE TrangThai=4 AND IsDeleted=0)         AS DangSuaChua,
                    (SELECT COALESCE(SUM(SoLuong),0) FROM TaiSan WHERE TrangThai=5 AND IsDeleted=0)         AS ChoThanhLy,
                    (SELECT COUNT(*) FROM YeuCauHoTro WHERE TrangThai=1)                                     AS YeuCauMoi,
                    (SELECT COUNT(*) FROM YeuCauHoTro WHERE TrangThai IN(2,3))                               AS YeuCauDangXuLy,
                    (SELECT COUNT(*) FROM BienBanSuaChua WHERE TrangThai=1)                                  AS BienBanChoDuyet,
                    (SELECT COALESCE(SUM(SoLuong),0) FROM TaiSan WHERE TrangThai=5 AND IsDeleted=0)          AS ChoThanhLyKho
            `),
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
                       COALESCE(SUM(ts.SoLuong), 0) AS count
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
                       COALESCE(SUM(ts.SoLuong), 0) AS count
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
                    total: Number(stats.TongThietBi),
                    active: Number(stats.DangHoatDong),
                    broken: Number(stats.DangHong),
                    underRepair: Number(stats.DangSuaChua),
                    pendingLiquidation: Number(stats.ChoThanhLy),
                },
                rooms: { total: totalRooms },
                supportRequests: { new: stats.YeuCauMoi, inProgress: stats.YeuCauDangXuLy },
                repairReports: { pendingApproval: stats.BienBanChoDuyet },
                liquidation: { pending: stats.ChoThanhLyKho },

                recentSupportRequests: recentRequests.map(r => ({
                    id: r.MaYeuCau,
                    assetCode: r.MaQuanLy ?? '—',
                    assetName: r.TenTaiSan ?? '—',
                    location: [r.TenToaNha, r.TenPhong].filter(Boolean).join(' ') || '—',
                    description: r.MoTaLoi,
                    priority: r.MucDo,
                    reporter: r.TenNguoiBao ?? '—',
                    createdAt: r.NgayTao,
                })),

                recentRepairReports: recentReports.map(r => ({
                    id: r.MaBienBan,
                    assetCode: r.MaQuanLy ?? '—',
                    assetName: r.TenTaiSan ?? '—',
                    location: [r.TenToaNha, r.TenPhong].filter(Boolean).join(' ') || '—',
                    estimatedCost: r.ChiPhiUocTinh ?? 0,
                    technicianName: r.TenKTV ?? '—',
                    createdAt: r.NgayLap,
                })),

                assetsByDepartment: byDept.map(r => ({
                    code: r.code ?? 'Khác',
                    name: r.name ?? 'Chưa phân khoa',
                    count: Number(r.count),
                })),

                assetsByCategory: byCategory.map(r => ({
                    group: r.group ?? 'Khác',
                    count: Number(r.count),
                })),
            },
        });
    } catch (error) {
        console.error('[DASHBOARD]', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi thống kê', error: error.message });
    }
});

/**
 * GET /api/admin/stats/by-type
 * Thống kê thiết bị theo loại / nhóm loại
 */
router.get('/stats/by-type', async (_req, res) => {
    try {
        const [[byCategoryRows], [byGroupRows]] = await Promise.all([
            // Per-category breakdown
            db.query(`
                SELECT
                    lt.MaLoai                                                        AS id,
                    lt.TenLoai                                                       AS name,
                    lt.NhomLoai                                                      AS \`group\`,
                    lt.KyHieu                                                        AS code,
                    COALESCE(SUM(ts.SoLuong), 0)                                    AS total,
                    SUM(CASE WHEN ts.TrangThai = 1 THEN ts.SoLuong ELSE 0 END)      AS active,
                    SUM(CASE WHEN ts.TrangThai = 2 THEN ts.SoLuong ELSE 0 END)      AS borrowed,
                    SUM(CASE WHEN ts.TrangThai = 3 THEN ts.SoLuong ELSE 0 END)      AS broken,
                    SUM(CASE WHEN ts.TrangThai = 4 THEN ts.SoLuong ELSE 0 END)      AS underRepair,
                    SUM(CASE WHEN ts.TrangThai = 5 THEN ts.SoLuong ELSE 0 END)      AS pendingLiquidation,
                    SUM(COALESCE(ts.Gia * ts.SoLuong, 0))                           AS totalValue
                FROM LoaiTaiSan lt
                LEFT JOIN TaiSan ts ON ts.MaLoai = lt.MaLoai AND ts.IsDeleted = 0
                WHERE lt.IsDeleted = 0
                GROUP BY lt.MaLoai, lt.TenLoai, lt.NhomLoai, lt.KyHieu
                HAVING total > 0
                ORDER BY total DESC
            `),

            // Per-group summary
            db.query(`
                SELECT
                    COALESCE(lt.NhomLoai, 'Khac')                                   AS \`group\`,
                    COALESCE(SUM(ts.SoLuong), 0)                                    AS total,
                    SUM(CASE WHEN ts.TrangThai IN (1,2) THEN ts.SoLuong ELSE 0 END) AS active,
                    SUM(CASE WHEN ts.TrangThai = 3 THEN ts.SoLuong ELSE 0 END)      AS broken,
                    SUM(CASE WHEN ts.TrangThai = 4 THEN ts.SoLuong ELSE 0 END)      AS underRepair,
                    SUM(COALESCE(ts.Gia * ts.SoLuong, 0))                           AS totalValue
                FROM TaiSan ts
                LEFT JOIN LoaiTaiSan lt ON lt.MaLoai = ts.MaLoai
                WHERE ts.IsDeleted = 0
                GROUP BY lt.NhomLoai
                ORDER BY total DESC
            `),
        ]);

        const sumOf = (field) => byCategoryRows.reduce((s, r) => s + (Number(r[field]) || 0), 0);

        res.json({
            success: true,
            data: {
                summary: {
                    total: sumOf('total'),
                    active: sumOf('active') + sumOf('borrowed'),
                    broken: sumOf('broken'),
                    underRepair: sumOf('underRepair'),
                    pendingLiquidation: sumOf('pendingLiquidation'),
                    totalValue: sumOf('totalValue'),
                },
                byGroup: byGroupRows.map(r => ({
                    group: r.group,
                    total: Number(r.total),
                    active: Number(r.active),
                    broken: Number(r.broken),
                    underRepair: Number(r.underRepair),
                    totalValue: Number(r.totalValue),
                })),
                byCategory: byCategoryRows.map(r => ({
                    id: r.id,
                    name: r.name,
                    group: r.group,
                    code: r.code ?? null,
                    total: Number(r.total),
                    active: Number(r.active) + Number(r.borrowed),
                    broken: Number(r.broken),
                    underRepair: Number(r.underRepair),
                    pendingLiquidation: Number(r.pendingLiquidation),
                    totalValue: Number(r.totalValue),
                })),
            },
        });
    } catch (error) {
        console.error('[STATS BY TYPE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * GET /api/admin/stats/by-department
 * Thống kê thiết bị theo khoa → phòng
 * Query: ?MaKhoa=   (nếu không truyền → tất cả khoa)
 */
router.get('/stats/by-department', async (req, res) => {
    try {
        const { MaKhoa } = req.query;

        let where = 'WHERE ts.IsDeleted = 0';
        const params = [];
        if (MaKhoa) { where += ' AND k.MaKhoa = ?'; params.push(MaKhoa); }

        const [rows] = await db.query(
            `SELECT
                k.MaKhoa                            AS khoaId,
                k.TenKhoa                           AS khoaName,
                p.TenToaNha                         AS building,
                p.TenPhong                          AS roomName,
                p.LoaiPhong                         AS roomType,
                COALESCE(SUM(ts.SoLuong), 0)          AS assetCount,
                COALESCE(SUM(ts.Gia * ts.SoLuong), 0) AS totalValue
             FROM TaiSan ts
             JOIN Phong p  ON p.MaPhong = ts.MaPhong AND p.IsDeleted = 0
             JOIN Khoa  k  ON k.MaKhoa  = p.MaKhoa
             ${where}
             GROUP BY k.MaKhoa, k.TenKhoa, p.TenToaNha, p.TenPhong, p.LoaiPhong
             ORDER BY k.TenKhoa, p.TenToaNha, p.TenPhong`,
            params
        );

        const summary = {
            assetCount: rows.reduce((s, r) => s + Number(r.assetCount), 0),
            totalValue: rows.reduce((s, r) => s + Number(r.totalValue), 0),
        };

        res.json({
            success: true,
            data: {
                summary,
                byRoom: rows.map(r => ({
                    khoaId:     r.khoaId,
                    khoaName:   r.khoaName,
                    building:   r.building   ?? '—',
                    roomName:   r.roomName,
                    roomType:   r.roomType   ?? null,
                    assetCount: Number(r.assetCount),
                    totalValue: Number(r.totalValue),
                })),
            },
        });
    } catch (error) {
        console.error('[STATS BY DEPT]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * GET /api/admin/stats/repair-history
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD&MaKhoa=&MaKTV=&KetQua=&page=1&limit=20
 */
router.get('/stats/repair-history', async (req, res) => {
    try {
        const { from, to, MaKhoa, MaKTV, KetQua, page = 1, limit = 20 } = req.query;

        const now      = new Date();
        const fromDate = from || new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10); // 1/1 năm nay
        const toDate   = to   || now.toISOString().slice(0, 10);

        const joins = `
            FROM LichSuSuaChua ls
            JOIN TaiSan ts          ON ts.MaTaiSan      = ls.MaTaiSan AND ts.IsDeleted = 0
            LEFT JOIN Phong p       ON p.MaPhong         = ts.MaPhong  AND p.IsDeleted  = 0
            LEFT JOIN Khoa k        ON k.MaKhoa          = p.MaKhoa
            LEFT JOIN NguoiDung nd  ON nd.MaNguoiDung    = ls.NguoiSuaChua
        `;

        let where = 'WHERE ls.NgaySua BETWEEN ? AND ?';
        const bp  = [fromDate, toDate + ' 23:59:59'];

        if (MaKhoa) { where += ' AND k.MaKhoa = ?';        bp.push(MaKhoa); }
        if (MaKTV)  { where += ' AND ls.NguoiSuaChua = ?'; bp.push(MaKTV);  }
        if (KetQua) { where += ' AND ls.KetQua = ?';        bp.push(KetQua); }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [[rows], [[agg]], [topKTV], [topCostRow]] = await Promise.all([
            db.query(
                `SELECT ls.MaSuaChua, ls.NgaySua, ls.ChiPhi, ls.MoTa, ls.KetQua,
                        ts.MaQuanLy, ts.TenTaiSan,
                        p.TenPhong, p.TenToaNha,
                        k.MaKhoa, k.TenKhoa,
                        nd.MaNguoiDung AS MaKTV, nd.HoTen AS TenKTV
                 ${joins} ${where}
                 ORDER BY ls.NgaySua DESC
                 LIMIT ? OFFSET ?`,
                [...bp, parseInt(limit), offset]
            ),
            db.query(
                `SELECT
                    COUNT(*)                                          AS total,
                    COALESCE(SUM(ls.ChiPhi), 0)                      AS totalCost,
                    SUM(CASE WHEN ls.KetQua = 1 THEN 1 ELSE 0 END)  AS done,
                    SUM(CASE WHEN ls.KetQua = 2 THEN 1 ELSE 0 END)  AS failed,
                    SUM(CASE WHEN ls.KetQua = 3 THEN 1 ELSE 0 END)  AS needReplace
                 ${joins} ${where}`,
                bp
            ),
            db.query(
                `SELECT nd.HoTen AS ktvName, COUNT(*) AS cnt
                 ${joins} ${where}
                 GROUP BY ls.NguoiSuaChua, nd.HoTen
                 ORDER BY cnt DESC LIMIT 1`,
                bp
            ),
            db.query(
                `SELECT ts.MaQuanLy AS code, ts.TenTaiSan AS name, ls.ChiPhi AS cost
                 ${joins} ${where}
                 ORDER BY ls.ChiPhi DESC LIMIT 1`,
                bp
            ),
        ]);

        const RESULT_LABEL = { 1: 'Đã sửa xong', 2: 'Không sửa được', 3: 'Cần thay thế' };

        res.json({
            success: true,
            data: {
                items: rows.map(r => ({
                    id:          r.MaSuaChua,
                    assetCode:   r.MaQuanLy,
                    assetName:   r.TenTaiSan,
                    roomName:    r.TenPhong  ?? '—',
                    building:    r.TenToaNha ?? '—',
                    khoaId:      r.MaKhoa    ?? null,
                    khoaName:    r.TenKhoa   ?? '—',
                    date:        r.NgaySua,
                    cost:        Number(r.ChiPhi) || 0,
                    description: r.MoTa      ?? null,
                    ktvId:       r.MaKTV     ?? null,
                    ktvName:     r.TenKTV    ?? '—',
                    result:      Number(r.KetQua),
                    resultLabel: RESULT_LABEL[r.KetQua] ?? '—',
                })),
                pagination: {
                    total:      Number(agg.total),
                    page:       parseInt(page),
                    limit:      parseInt(limit),
                    totalPages: Math.ceil(Number(agg.total) / parseInt(limit)),
                },
                summary: {
                    total:       Number(agg.total),
                    totalCost:   Number(agg.totalCost),
                    done:        Number(agg.done),
                    failed:      Number(agg.failed),
                    needReplace: Number(agg.needReplace),
                    highestCost: topCostRow[0]
                        ? { code: topCostRow[0].code, name: topCostRow[0].name, cost: Number(topCostRow[0].cost) }
                        : null,
                    topKTV: topKTV[0]
                        ? { name: topKTV[0].ktvName, count: Number(topKTV[0].cnt) }
                        : null,
                },
                filters: { from: fromDate, to: toDate },
            },
        });
    } catch (error) {
        console.error('[STATS REPAIR HISTORY]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * GET /api/admin/thanh-ly
 * Danh sách thiết bị thanh lý (lịch sử bán đồ hỏng)
 * Query: ?TrangThai=2&from=YYYY-MM-DD&to=YYYY-MM-DD&keyword=&page=1&limit=20
 */
router.get('/thanh-ly', async (req, res) => {
    try {
        const { TrangThai = '2', from, to, keyword, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = 'WHERE 1=1';
        const params = [];

        if (TrangThai === 'all') {
            where += ' AND tl.TrangThai IN (2, 3)';
        } else if (TrangThai) {
            where += ' AND tl.TrangThai = ?';
            params.push(TrangThai);
        }
        if (from)      { where += ' AND tl.NgayThanhLy >= ?';          params.push(from); }
        if (to)        { where += ' AND tl.NgayThanhLy <= ?';          params.push(to); }
        if (keyword)   { where += ' AND (ts.TenTaiSan LIKE ? OR ts.MaQuanLy LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

        const [rows] = await db.query(
            `SELECT
                tl.MaThanhLy, tl.LyDoThanhLy, tl.TrangThai,
                tl.NgayNhapKho, tl.NgayThanhLy, tl.GiaThanhLy, tl.GhiChu,
                ts.MaQuanLy, ts.TenTaiSan,
                lt.TenLoai, lt.NhomLoai,
                p.TenPhong, p.TenToaNha,
                k.TenKhoa,
                nd_lap.HoTen    AS TenNguoiLap,
                nd_duyet.HoTen  AS TenNguoiDuyet
             FROM ThanhLy tl
             JOIN TaiSan ts           ON ts.MaTaiSan      = tl.MaTaiSan
             LEFT JOIN LoaiTaiSan lt  ON lt.MaLoai         = ts.MaLoai
             LEFT JOIN Phong p        ON p.MaPhong          = ts.MaPhong
             LEFT JOIN Khoa k         ON k.MaKhoa           = p.MaKhoa
             LEFT JOIN NguoiDung nd_lap   ON nd_lap.MaNguoiDung   = tl.NguoiLap
             LEFT JOIN NguoiDung nd_duyet ON nd_duyet.MaNguoiDung = tl.NguoiDuyet
             ${where}
             ORDER BY tl.NgayNhapKho DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [[{ total, tongGiaThanhLy }]] = await db.query(
            `SELECT COUNT(*) AS total, COALESCE(SUM(tl.GiaThanhLy), 0) AS tongGiaThanhLy
             FROM ThanhLy tl
             JOIN TaiSan ts ON ts.MaTaiSan = tl.MaTaiSan
             ${where}`,
            params
        );

        const STATUS_LABEL = { 1: 'Chờ xử lý', 2: 'Đã thanh lý', 3: 'Đã hủy' };

        res.json({
            success: true,
            data: {
                items: rows.map(r => ({
                    id:              r.MaThanhLy,
                    assetCode:       r.MaQuanLy,
                    assetName:       r.TenTaiSan,
                    category:        r.TenLoai       ?? '—',
                    categoryGroup:   r.NhomLoai      ?? '—',
                    roomName:        r.TenPhong       ?? '—',
                    building:        r.TenToaNha      ?? '—',
                    department:      r.TenKhoa        ?? '—',
                    reason:          r.LyDoThanhLy,
                    status:          r.TrangThai,
                    statusLabel:     STATUS_LABEL[r.TrangThai] ?? '—',
                    receivedDate:    r.NgayNhapKho,
                    liquidatedDate:  r.NgayThanhLy   ?? null,
                    salePrice:       Number(r.GiaThanhLy) || 0,
                    note:            r.GhiChu         ?? null,
                    createdBy:       r.TenNguoiLap    ?? '—',
                    approvedBy:      r.TenNguoiDuyet  ?? null,
                })),
                pagination: {
                    total:      Number(total),
                    page:       parseInt(page),
                    limit:      parseInt(limit),
                    totalPages: Math.ceil(Number(total) / parseInt(limit)),
                },
                summary: {
                    total:          Number(total),
                    tongGiaThanhLy: Number(tongGiaThanhLy),
                },
            },
        });
    } catch (error) {
        console.error('[ADMIN THANH LY]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
