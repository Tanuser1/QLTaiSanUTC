/**
 * routes/yeucau.js
 * Quản lý YeuCauHoTro — phân quyền theo vai trò:
 *   GiaoVien : tạo YC + xem YC của mình
 *   KyThuat  : xem YC được phân công + nhận YC + cập nhật trạng thái
 *   Admin    : toàn quyền (xem tất cả, phân công KTV)
 *   BGH      : chỉ xem (để đối chiếu biên bản)
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { mapSupportRequest, paginatedResponse } = require('../mappers');

router.use(authMiddleware);

// ─── Helper join ──────────────────────────────────────────────────────────────
const BASE_SELECT = `
    SELECT yc.*,
           ts.MaQuanLy, ts.TenTaiSan,
           p.TenPhong, p.TenToaNha, p.MaKhoa,
           nb.HoTen AS TenNguoiBao,
           nx.HoTen AS TenNguoiXuLy
    FROM YeuCauHoTro yc
    LEFT JOIN TaiSan    ts ON ts.MaTaiSan    = yc.MaTaiSan
    LEFT JOIN Phong     p  ON p.MaPhong      = ts.MaPhong
    LEFT JOIN NguoiDung nb ON nb.MaNguoiDung = yc.MaNguoiBao
    LEFT JOIN NguoiDung nx ON nx.MaNguoiDung = yc.NguoiXuLy
`;

// ─── GET /api/yeucau ─────────────────────────────────────────────────────────
/**
 * Lấy danh sách yêu cầu — filter theo vai trò:
 *   GiaoVien  → chỉ thấy YC của mình (MaNguoiBao = req.user.id)
 *   KyThuat   → chỉ thấy YC được phân công (NguoiXuLy = req.user.id)
 *   Admin/BGH → thấy tất cả
 * Query: ?TrangThai=&LoaiYeuCau=&page=1&limit=20
 */
router.get('/', async (req, res) => {
    try {
        const { TrangThai, LoaiYeuCau, page = 1, limit = 20 } = req.query;
        const { VaiTro, MaNguoiDung } = req.user;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = 'WHERE 1=1';
        const params = [];

        // Filter dữ liệu theo vai trò
        if (VaiTro === 'GiaoVien') {
            where += ' AND yc.MaNguoiBao = ?';
            params.push(MaNguoiDung);
        } else if (VaiTro === 'KyThuat') {
            where += ' AND yc.NguoiXuLy = ?';
            params.push(MaNguoiDung);
        }
        // Admin và BGH thấy tất cả → không thêm filter

        if (TrangThai)   { where += ' AND yc.TrangThai = ?';   params.push(TrangThai); }
        if (LoaiYeuCau)  { where += ' AND yc.LoaiYeuCau = ?';  params.push(LoaiYeuCau); }

        const [rows] = await db.query(
            `${BASE_SELECT} ${where} ORDER BY yc.NgayTao DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM YeuCauHoTro yc
             LEFT JOIN TaiSan ts ON ts.MaTaiSan = yc.MaTaiSan
             LEFT JOIN Phong  p  ON p.MaPhong   = ts.MaPhong
             ${where}`,
            params
        );

        res.json({
            success: true,
            data: paginatedResponse(rows.map(mapSupportRequest), total, parseInt(page), parseInt(limit)),
        });
    } catch (error) {
        console.error('[YEUCAU GET ALL]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── GET /api/yeucau/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { VaiTro, MaNguoiDung } = req.user;

        const [[yc]] = await db.query(`${BASE_SELECT} WHERE yc.MaYeuCau = ?`, [id]);
        if (!yc) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });

        // GiaoVien chỉ xem YC của mình
        if (VaiTro === 'GiaoVien' && yc.MaNguoiBao !== MaNguoiDung) {
            return res.status(403).json({ success: false, message: 'Không có quyền xem yêu cầu này' });
        }
        // KTV chỉ xem YC được phân công
        if (VaiTro === 'KyThuat' && yc.NguoiXuLy !== MaNguoiDung) {
            return res.status(403).json({ success: false, message: 'Yêu cầu này không được phân công cho bạn' });
        }

        res.json({ success: true, data: mapSupportRequest(yc) });
    } catch (error) {
        console.error('[YEUCAU GET ONE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── POST /api/yeucau ────────────────────────────────────────────────────────
/**
 * Tạo yêu cầu hỗ trợ — GiaoVien + Admin
 * Body: { MaTaiSan, LoaiYeuCau, MoTaLoi, MucDo? }
 */
router.post('/', checkRole('GiaoVien', 'Admin'), async (req, res) => {
    try {
        const { MaTaiSan, LoaiYeuCau = 'BaoHong', MoTaLoi, MucDo = 1 } = req.body;
        const { MaNguoiDung } = req.user;

        if (!MaTaiSan || !MoTaLoi) {
            return res.status(400).json({ success: false, message: 'MaTaiSan và MoTaLoi là bắt buộc' });
        }

        const [[ts]] = await db.query(
            `SELECT MaTaiSan FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [MaTaiSan]
        );
        if (!ts) return res.status(404).json({ success: false, message: 'Thiết bị không tồn tại' });

        const [result] = await db.query(
            `INSERT INTO YeuCauHoTro (MaTaiSan, MaNguoiBao, LoaiYeuCau, MoTaLoi, MucDo, TrangThai)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [MaTaiSan, MaNguoiDung, LoaiYeuCau, MoTaLoi, MucDo]
        );

        const [[newYC]] = await db.query(`${BASE_SELECT} WHERE yc.MaYeuCau = ?`, [result.insertId]);

        // Tạo thông báo cho Admin
        await db.query(
            `INSERT INTO ThongBao (LoaiSuKien, MaDoiTuong, NguoiNhan, NoiDung)
             SELECT 'YEUCAU_MOI', ?, MaNguoiDung, CONCAT('Yêu cầu mới #', ?, ': ', ?)
             FROM NguoiDung WHERE VaiTro = 'Admin' AND IsDeleted = 0`,
            [result.insertId, result.insertId, MoTaLoi.substring(0, 100)]
        );

        res.status(201).json({
            success: true,
            message: 'Gửi yêu cầu hỗ trợ thành công',
            data: mapSupportRequest(newYC),
        });
    } catch (error) {
        console.error('[YEUCAU POST]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── PUT /api/yeucau/:id/phan-cong ───────────────────────────────────────────
/**
 * Admin phân công KTV xử lý yêu cầu
 * Body: { NguoiXuLy (MaNguoiDung của KTV) }
 */
router.put('/:id/phan-cong', checkRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { NguoiXuLy } = req.body;

        if (!NguoiXuLy) return res.status(400).json({ success: false, message: 'NguoiXuLy là bắt buộc' });

        const [[yc]] = await db.query(`SELECT MaYeuCau, TrangThai FROM YeuCauHoTro WHERE MaYeuCau = ?`, [id]);
        if (!yc) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });
        if (yc.TrangThai > 2) {
            return res.status(409).json({ success: false, message: 'Yêu cầu đã được xử lý, không thể phân công lại' });
        }

        const [[ktv]] = await db.query(
            `SELECT MaNguoiDung FROM NguoiDung WHERE MaNguoiDung = ? AND VaiTro = 'KyThuat' AND IsDeleted = 0`,
            [NguoiXuLy]
        );
        if (!ktv) return res.status(404).json({ success: false, message: 'Kỹ thuật viên không tồn tại' });

        await db.query(
            `UPDATE YeuCauHoTro SET NguoiXuLy = ?, TrangThai = 2, NgayXuLy = NOW() WHERE MaYeuCau = ?`,
            [NguoiXuLy, id]
        );

        // Thông báo cho KTV
        await db.query(
            `INSERT INTO ThongBao (LoaiSuKien, MaDoiTuong, NguoiNhan, NoiDung)
             VALUES ('PHANCONG_MOI', ?, ?, CONCAT('Bạn được phân công xử lý yêu cầu #', ?))`,
            [id, NguoiXuLy, id]
        );

        const [[updated]] = await db.query(`${BASE_SELECT} WHERE yc.MaYeuCau = ?`, [id]);
        res.json({ success: true, message: 'Phân công KTV thành công', data: mapSupportRequest(updated) });
    } catch (error) {
        console.error('[YEUCAU PHAN CONG]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── PUT /api/yeucau/:id/nhan ─────────────────────────────────────────────────
/**
 * KTV nhận/xác nhận đang xử lý yêu cầu → chuyển TrangThai = 3 (đang kiểm tra)
 */
router.put('/:id/nhan', checkRole('KyThuat'), async (req, res) => {
    try {
        const { id } = req.params;
        const { MaNguoiDung } = req.user;

        const [[yc]] = await db.query(
            `SELECT MaYeuCau, TrangThai, NguoiXuLy FROM YeuCauHoTro WHERE MaYeuCau = ?`, [id]
        );
        if (!yc) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });
        if (yc.NguoiXuLy !== MaNguoiDung) {
            return res.status(403).json({ success: false, message: 'Yêu cầu này không được phân công cho bạn' });
        }
        if (yc.TrangThai !== 2) {
            return res.status(409).json({ success: false, message: 'Yêu cầu phải ở trạng thái "Đã phân công" mới có thể nhận' });
        }

        await db.query(
            `UPDATE YeuCauHoTro SET TrangThai = 3 WHERE MaYeuCau = ?`, [id]
        );

        const [[updated]] = await db.query(`${BASE_SELECT} WHERE yc.MaYeuCau = ?`, [id]);
        res.json({ success: true, message: 'Đã xác nhận nhận yêu cầu, bắt đầu kiểm tra', data: mapSupportRequest(updated) });
    } catch (error) {
        console.error('[YEUCAU NHAN]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// ─── PUT /api/yeucau/:id/tu-choi ──────────────────────────────────────────────
/**
 * Admin từ chối yêu cầu
 * Body: { LyDoTuChoi }
 */
router.put('/:id/tu-choi', checkRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { LyDoTuChoi } = req.body;

        if (!LyDoTuChoi) return res.status(400).json({ success: false, message: 'Cần ghi rõ lý do từ chối' });

        await db.query(
            `UPDATE YeuCauHoTro SET TrangThai = 9, LyDoTuChoi = ? WHERE MaYeuCau = ?`,
            [LyDoTuChoi, id]
        );

        const [[updated]] = await db.query(`${BASE_SELECT} WHERE yc.MaYeuCau = ?`, [id]);
        res.json({ success: true, message: 'Đã từ chối yêu cầu', data: mapSupportRequest(updated) });
    } catch (error) {
        console.error('[YEUCAU TU CHOI]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});
// ─── PUT /api/yeucau/:id/dong-yeu-cau ─────────────────────────────────────────
/**
 * KTV đóng yêu cầu nhanh (không có lỗi) -> chuyển sang trạng thái 6 (Hoàn thành)
 * Ghi vết vào LichSuSuaChua với ChiPhi = 0 và KetQua = 1.
 */
router.put('/:id/dong-yeu-cau', checkRole('KyThuat'), async (req, res) => {
    try {
        const { id } = req.params;
        const { LyDo } = req.body;
        const { MaNguoiDung } = req.user;

        if (!LyDo) return res.status(400).json({ success: false, message: 'Cần ghi rõ lý do đóng yêu cầu' });

        const [[yc]] = await db.query(
            `SELECT MaYeuCau, TrangThai, NguoiXuLy, MaTaiSan FROM YeuCauHoTro WHERE MaYeuCau = ?`, [id]
        );
        if (!yc) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });
        if (yc.NguoiXuLy !== MaNguoiDung) {
            return res.status(403).json({ success: false, message: 'Yêu cầu này không được phân công cho bạn' });
        }
        if (yc.TrangThai !== 3) {
            return res.status(409).json({ success: false, message: 'Yêu cầu phải đang ở trạng thái "Đang kiểm tra"' });
        }

        // Ghi vào lịch sử sửa chữa (không qua Biên bản)
        await db.query(
            `INSERT INTO LichSuSuaChua (MaTaiSan, MaYeuCau, MaBienBan, NgaySua, ChiPhi, MoTa, NguoiSuaChua, KetQua)
             VALUES (?, ?, NULL, CURDATE(), 0, ?, ?, 1)`,
            [yc.MaTaiSan, id, LyDo, MaNguoiDung]
        );

        // Cập nhật trạng thái Yêu cầu -> 6 (Hoàn thành)
        await db.query(
            `UPDATE YeuCauHoTro SET TrangThai = 6 WHERE MaYeuCau = ?`,
            [id]
        );
        
        // Cũng nên đổi trạng thái thiết bị thành 1 (Đang dùng) nếu trước đó là 3 (Hỏng)
        await db.query(
            `UPDATE TaiSan SET TrangThai = 1 WHERE MaTaiSan = ? AND TrangThai IN (3, 4)`,
            [yc.MaTaiSan]
        );

        const [[updated]] = await db.query(`${BASE_SELECT} WHERE yc.MaYeuCau = ?`, [id]);
        res.json({ success: true, message: 'Đã đóng yêu cầu', data: mapSupportRequest(updated) });
    } catch (error) {
        console.error('[YEUCAU DONG]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
