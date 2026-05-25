/**
 * routes/bienban.js
 * Quản lý BienBanSuaChua — phân quyền:
 *   KyThuat  : tạo biên bản + xem biên bản của mình
 *   Admin    : xem tất cả + duyệt/từ chối
 *   BGH      : xem biên bản chờ duyệt + duyệt kinh phí
 *   GiaoVien : xem biên bản liên quan đến YC của mình (read-only)
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { mapRepairReport, paginatedResponse } = require('../mappers');

router.use(authMiddleware);

// ─── Helper join ──────────────────────────────────────────────────────────────
const BASE_SELECT = `
    SELECT bb.*,
           kt.HoTen AS TenKTV,
           yc.MaTaiSan, yc.MaNguoiBao, yc.LoaiYeuCau,
           ts.MaQuanLy, ts.TenTaiSan,
           p.TenPhong, p.TenToaNha
    FROM BienBanSuaChua bb
    LEFT JOIN YeuCauHoTro yc ON yc.MaYeuCau  = bb.MaYeuCau
    LEFT JOIN NguoiDung   kt ON kt.MaNguoiDung = bb.MaKTV
    LEFT JOIN TaiSan      ts ON ts.MaTaiSan    = yc.MaTaiSan
    LEFT JOIN Phong        p ON p.MaPhong      = ts.MaPhong
`;

// ─── GET /api/bienban ─────────────────────────────────────────────────────────
/**
 * Filter theo vai trò:
 *   KyThuat  → chỉ biên bản do mình lập (MaKTV = req.user.id)
 *   BGH      → chỉ biên bản chờ duyệt (TrangThai = 1)
 *   Admin    → tất cả
 *   GiaoVien → biên bản liên quan YC của mình
 * Query: ?TrangThai=&page=1&limit=20
 */
router.get('/', async (req, res) => {
    try {
        const { TrangThai, page = 1, limit = 20 } = req.query;
        const { VaiTro, MaNguoiDung } = req.user;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = 'WHERE 1=1';
        const params = [];

        if (VaiTro === 'KyThuat') {
            where += ' AND bb.MaKTV = ?';
            params.push(MaNguoiDung);
        } else if (VaiTro === 'BGH') {
            // BGH chỉ xem biên bản chờ duyệt của mình — trừ khi filter TrangThai cụ thể
            if (!TrangThai) { where += ' AND bb.TrangThai = 1'; }
        } else if (VaiTro === 'GiaoVien') {
            where += ' AND yc.MaNguoiBao = ?';
            params.push(MaNguoiDung);
        }

        if (TrangThai) { where += ' AND bb.TrangThai = ?'; params.push(TrangThai); }

        const [rows] = await db.query(
            `${BASE_SELECT} ${where} ORDER BY bb.NgayLap DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM BienBanSuaChua bb
             LEFT JOIN YeuCauHoTro yc ON yc.MaYeuCau = bb.MaYeuCau
             ${where}`,
            params
        );

        res.json({
            success: true,
            data: paginatedResponse(rows.map(mapRepairReport), total, parseInt(page), parseInt(limit)),
        });
    } catch (error) {
        console.error('[BIENBAN GET ALL]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── GET /api/bienban/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { VaiTro, MaNguoiDung } = req.user;

        const [[bb]] = await db.query(`${BASE_SELECT} WHERE bb.MaBienBan = ?`, [id]);
        if (!bb) return res.status(404).json({ success: false, message: 'Không tìm thấy biên bản' });

        // KTV chỉ xem biên bản của mình
        if (VaiTro === 'KyThuat' && bb.MaKTV !== MaNguoiDung) {
            return res.status(403).json({ success: false, message: 'Không có quyền xem biên bản này' });
        }
        // GiaoVien chỉ xem biên bản liên quan YC của mình
        if (VaiTro === 'GiaoVien' && bb.MaNguoiBao !== MaNguoiDung) {
            return res.status(403).json({ success: false, message: 'Không có quyền xem biên bản này' });
        }

        // Lấy lịch sử phê duyệt
        const [approvals] = await db.query(
            `SELECT pd.*, nd.HoTen AS TenNguoiDuyet
             FROM PheDuyetKinhPhi pd
             LEFT JOIN NguoiDung nd ON nd.MaNguoiDung = pd.NguoiDuyet
             WHERE pd.MaBienBan = ? ORDER BY pd.NgayDuyet DESC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...mapRepairReport(bb),
                approvals: approvals.map(a => ({
                    id:           a.MaPheDuyet,
                    approvedBy:   a.NguoiDuyet,
                    approverName: a.TenNguoiDuyet,
                    approverRole: a.VaiTroDuyet,
                    decision:     a.QuyetDinh,
                    approvedCost: a.KinhPhiDuyet,
                    note:         a.GhiChu,
                    approvedAt:   a.NgayDuyet,
                })),
            },
        });
    } catch (error) {
        console.error('[BIENBAN GET ONE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── POST /api/bienban ────────────────────────────────────────────────────────
/**
 * KTV lập biên bản sửa chữa
 * Body: { MaYeuCau, ChiTietHong, DeXuat, ChiPhiUocTinh, GhiChu? }
 */
router.post('/', checkRole('KyThuat', 'Admin'), async (req, res) => {
    try {
        const { MaYeuCau, ChiTietHong, DeXuat = 'SuaChua', ChiPhiUocTinh = 0, GhiChu } = req.body;
        const { MaNguoiDung } = req.user;

        if (!MaYeuCau || !ChiTietHong) {
            return res.status(400).json({ success: false, message: 'MaYeuCau và ChiTietHong là bắt buộc' });
        }

        const [[yc]] = await db.query(
            `SELECT MaYeuCau, TrangThai, MaNguoiBao FROM YeuCauHoTro WHERE MaYeuCau = ?`, [MaYeuCau]
        );
        if (!yc) return res.status(404).json({ success: false, message: 'Yêu cầu hỗ trợ không tồn tại' });
        if (![2, 3].includes(yc.TrangThai)) {
            return res.status(409).json({ success: false, message: 'Yêu cầu phải được phân công trước khi lập biên bản' });
        }

        const [result] = await db.query(
            `INSERT INTO BienBanSuaChua (MaYeuCau, MaKTV, ChiTietHong, DeXuat, ChiPhiUocTinh, GhiChu, TrangThai)
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [MaYeuCau, MaNguoiDung, ChiTietHong, DeXuat, ChiPhiUocTinh, GhiChu || null]
        );

        // Cập nhật YC → TrangThai 4 (chờ duyệt biên bản)
        await db.query(`UPDATE YeuCauHoTro SET TrangThai = 4 WHERE MaYeuCau = ?`, [MaYeuCau]);

        // Thông báo cho Admin + BGH
        await db.query(
            `INSERT INTO ThongBao (LoaiSuKien, MaDoiTuong, NguoiNhan, NoiDung)
             SELECT 'BIENBAN_MOI', ?, MaNguoiDung,
                    CONCAT('Biên bản #', ?, ' chờ duyệt kinh phí: ', ?)
             FROM NguoiDung
             WHERE VaiTro IN ('Admin','BGH') AND IsDeleted = 0`,
            [result.insertId, result.insertId, ChiTietHong.substring(0, 80)]
        );

        const [[newBB]] = await db.query(`${BASE_SELECT} WHERE bb.MaBienBan = ?`, [result.insertId]);
        res.status(201).json({
            success: true,
            message: 'Lập biên bản sửa chữa thành công',
            data: mapRepairReport(newBB),
        });
    } catch (error) {
        console.error('[BIENBAN POST]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── PUT /api/bienban/:id/duyet ───────────────────────────────────────────────
/**
 * Admin hoặc BGH phê duyệt / từ chối kinh phí
 * Body: { QuyetDinh: 'DongY'|'TuChoi', KinhPhiDuyet?, GhiChu? }
 */
router.put('/:id/duyet', checkRole('Admin', 'BGH'), async (req, res) => {
    try {
        const { id } = req.params;
        const { QuyetDinh, KinhPhiDuyet, GhiChu } = req.body;
        const { MaNguoiDung, VaiTro } = req.user;

        if (!QuyetDinh || !['DongY', 'TuChoi'].includes(QuyetDinh)) {
            return res.status(400).json({ success: false, message: 'QuyetDinh phải là DongY hoặc TuChoi' });
        }

        const [[bb]] = await db.query(
            `SELECT MaBienBan, TrangThai, MaYeuCau, MaKTV FROM BienBanSuaChua WHERE MaBienBan = ?`, [id]
        );
        if (!bb) return res.status(404).json({ success: false, message: 'Không tìm thấy biên bản' });
        if (bb.TrangThai !== 1) {
            return res.status(409).json({ success: false, message: 'Biên bản này đã được xử lý rồi' });
        }

        // Ghi phê duyệt
        await db.query(
            `INSERT INTO PheDuyetKinhPhi (MaBienBan, NguoiDuyet, VaiTroDuyet, QuyetDinh, KinhPhiDuyet, GhiChu)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, MaNguoiDung, VaiTro, QuyetDinh, KinhPhiDuyet || null, GhiChu || null]
        );

        const newBBStatus = QuyetDinh === 'DongY' ? 2 : 3;
        await db.query(`UPDATE BienBanSuaChua SET TrangThai = ? WHERE MaBienBan = ?`, [newBBStatus, id]);

        // Cập nhật YC → TrangThai 5 (đã duyệt, đang xử lý)
        if (QuyetDinh === 'DongY') {
            await db.query(`UPDATE YeuCauHoTro SET TrangThai = 5 WHERE MaYeuCau = ?`, [bb.MaYeuCau]);
        }

        // Thông báo cho KTV
        const noiDung = QuyetDinh === 'DongY'
            ? `Biên bản #${id} đã được duyệt với kinh phí ${(KinhPhiDuyet || 0).toLocaleString('vi-VN')}đ`
            : `Biên bản #${id} bị từ chối. Lý do: ${GhiChu || 'Không ghi rõ'}`;

        await db.query(
            `INSERT INTO ThongBao (LoaiSuKien, MaDoiTuong, NguoiNhan, NoiDung)
             VALUES ('PHEDUYET_MOI', ?, ?, ?)`,
            [id, bb.MaKTV, noiDung]
        );

        const [[updated]] = await db.query(`${BASE_SELECT} WHERE bb.MaBienBan = ?`, [id]);
        res.json({
            success: true,
            message: QuyetDinh === 'DongY' ? 'Đã duyệt biên bản' : 'Đã từ chối biên bản',
            data: mapRepairReport(updated),
        });
    } catch (error) {
        console.error('[BIENBAN DUYET]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── PUT /api/bienban/:id/hoan-thanh ─────────────────────────────────────────
/**
 * KTV đánh dấu hoàn thành sửa chữa — ghi vào LichSuSuaChua
 * Body: { ChiPhi, MoTa, KetQua: 1|2|3 }
 */
router.put('/:id/hoan-thanh', checkRole('KyThuat', 'Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { ChiPhi = 0, MoTa, KetQua = 1 } = req.body;
        const { MaNguoiDung, VaiTro } = req.user;

        const [[bb]] = await db.query(
            `SELECT bb.MaBienBan, bb.MaKTV, bb.MaYeuCau, yc.MaTaiSan
             FROM BienBanSuaChua bb
             LEFT JOIN YeuCauHoTro yc ON yc.MaYeuCau = bb.MaYeuCau
             WHERE bb.MaBienBan = ?`, [id]
        );
        if (!bb) return res.status(404).json({ success: false, message: 'Không tìm thấy biên bản' });
        if (VaiTro === 'KyThuat' && bb.MaKTV !== MaNguoiDung) {
            return res.status(403).json({ success: false, message: 'Biên bản này không phải do bạn lập' });
        }

        // Ghi lịch sử sửa chữa
        await db.query(
            `INSERT INTO LichSuSuaChua (MaTaiSan, MaYeuCau, MaBienBan, NgaySua, ChiPhi, MoTa, NguoiSuaChua, KetQua)
             VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
            [bb.MaTaiSan, bb.MaYeuCau, id, ChiPhi, MoTa || null, MaNguoiDung, KetQua]
        );

        // Cập nhật trạng thái tài sản và YC
        const newAssetStatus = KetQua === 1 ? 1 : (KetQua === 3 ? 5 : 3);
        await db.query(`UPDATE TaiSan SET TrangThai = ? WHERE MaTaiSan = ?`, [newAssetStatus, bb.MaTaiSan]);
        await db.query(`UPDATE YeuCauHoTro SET TrangThai = 6 WHERE MaYeuCau = ?`, [bb.MaYeuCau]);

        res.json({ success: true, message: 'Đã ghi nhận hoàn thành sửa chữa' });
    } catch (error) {
        console.error('[BIENBAN HOAN THANH]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
