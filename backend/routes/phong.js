const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { mapRoom, paginatedResponse } = require('../mappers');

router.use(authMiddleware);

/**
 * GET /api/phong
 * Query: ?LoaiPhong=PhongMay&TenToaNha=A&MaKhoa=3&page=1&limit=50
 */
router.get('/', async (req, res) => {
    try {
        const { LoaiPhong, TenToaNha, MaKhoa, keyword, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = 'WHERE p.IsDeleted = 0';
        const params = [];

        if (LoaiPhong) { where += ' AND p.LoaiPhong = ?';                         params.push(LoaiPhong); }
        if (TenToaNha) { where += ' AND p.TenToaNha LIKE ?';                      params.push(`%${TenToaNha}%`); }
        if (MaKhoa)    { where += ' AND p.MaKhoa = ?';                            params.push(MaKhoa); }
        if (keyword)   { where += ' AND (p.TenPhong LIKE ? OR p.TenToaNha LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

        const [rows] = await db.query(
            `SELECT p.*, k.TenKhoa,
                    COALESCE(SUM(ts.SoLuong), 0) AS SoLuongTaiSan
             FROM Phong p
             LEFT JOIN Khoa k  ON k.MaKhoa = p.MaKhoa
             LEFT JOIN TaiSan ts ON ts.MaPhong = p.MaPhong AND ts.IsDeleted = 0
             ${where}
             GROUP BY p.MaPhong
             ORDER BY p.TenToaNha, p.Tang, p.TenPhong
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM Phong p ${where}`, params
        );

        res.json({
            success: true,
            data: paginatedResponse(rows.map(mapRoom), total, parseInt(page), parseInt(limit)),
        });
    } catch (error) {
        console.error('[PHONG GET ALL]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * GET /api/phong/:id
 * Chi tiết phòng + danh sách thiết bị
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [[phong]] = await db.query(
            `SELECT p.*, k.TenKhoa FROM Phong p
             LEFT JOIN Khoa k ON k.MaKhoa = p.MaKhoa
             WHERE p.MaPhong = ? AND p.IsDeleted = 0`,
            [id]
        );
        if (!phong) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });

        const [danhSachThietBi] = await db.query(
            `SELECT ts.MaTaiSan, ts.MaQuanLy, ts.TenTaiSan, ts.TrangThai,
                    ts.Gia, ts.SoLuong, ts.NgayNhap, ts.HinhAnh, ts.QRCode,
                    lt.TenLoai, lt.NhomLoai, lt.KyHieu,
                    nd.HoTen AS NguoiSuDung
             FROM TaiSan ts
             LEFT JOIN LoaiTaiSan lt ON lt.MaLoai = ts.MaLoai
             LEFT JOIN NguoiDung nd  ON nd.MaNguoiDung = ts.MaNguoiSuDung
             WHERE ts.MaPhong = ? AND ts.IsDeleted = 0
             ORDER BY lt.NhomLoai, ts.TenTaiSan`,
            [id]
        );

        res.json({ success: true, data: mapRoom({ ...phong, DanhSachThietBi: danhSachThietBi }) });
    } catch (error) {
        console.error('[PHONG GET ONE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/phong
 * Body: { TenPhong, TenToaNha, MaKhoa?, DiaChi, Tang, LoaiPhong, GhiChu }
 */
router.post('/', adminOnly, async (req, res) => {
    try {
        const { TenPhong, TenToaNha, MaKhoa, DiaChi, Tang = 1, LoaiPhong = 'PhongMay', GhiChu } = req.body;

        if (!TenPhong || !TenToaNha) {
            return res.status(400).json({ success: false, message: 'TenPhong và TenToaNha là bắt buộc' });
        }

        const validLoai = ['PhongHoc', 'PhongMay', 'VanPhong', 'Kho', 'Xuong'];
        if (!validLoai.includes(LoaiPhong)) {
            return res.status(400).json({ success: false, message: `LoaiPhong không hợp lệ. Chọn: ${validLoai.join(', ')}` });
        }

        const [result] = await db.query(
            `INSERT INTO Phong (MaKhoa, TenPhong, TenToaNha, DiaChi, Tang, LoaiPhong, GhiChu)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [MaKhoa || null, TenPhong, TenToaNha, DiaChi || null, Tang, LoaiPhong, GhiChu || null]
        );

        const [[newPhong]] = await db.query(
            `SELECT p.*, k.TenKhoa FROM Phong p
             LEFT JOIN Khoa k ON k.MaKhoa = p.MaKhoa
             WHERE p.MaPhong = ?`,
            [result.insertId]
        );
        res.status(201).json({ success: true, message: 'Thêm phòng thành công', data: mapRoom(newPhong) });
    } catch (error) {
        console.error('[PHONG POST]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * PUT /api/phong/:id
 */
router.put('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { TenPhong, TenToaNha, MaKhoa, DiaChi, Tang, LoaiPhong, GhiChu } = req.body;

        const [[existing]] = await db.query(
            `SELECT MaPhong FROM Phong WHERE MaPhong = ? AND IsDeleted = 0`, [id]
        );
        if (!existing) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });

        const fields = [];
        const values = [];

        if (TenPhong  !== undefined) { fields.push('TenPhong = ?');  values.push(TenPhong); }
        if (TenToaNha !== undefined) { fields.push('TenToaNha = ?'); values.push(TenToaNha); }
        if (MaKhoa    !== undefined) { fields.push('MaKhoa = ?');    values.push(MaKhoa || null); }
        if (DiaChi    !== undefined) { fields.push('DiaChi = ?');    values.push(DiaChi); }
        if (Tang      !== undefined) { fields.push('Tang = ?');      values.push(Tang); }
        if (LoaiPhong !== undefined) { fields.push('LoaiPhong = ?'); values.push(LoaiPhong); }
        if (GhiChu    !== undefined) { fields.push('GhiChu = ?');    values.push(GhiChu); }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có trường nào cần cập nhật' });
        }

        values.push(id);
        await db.query(`UPDATE Phong SET ${fields.join(', ')} WHERE MaPhong = ?`, values);

        const [[updated]] = await db.query(
            `SELECT p.*, k.TenKhoa FROM Phong p
             LEFT JOIN Khoa k ON k.MaKhoa = p.MaKhoa
             WHERE p.MaPhong = ?`,
            [id]
        );
        res.json({ success: true, message: 'Cập nhật phòng thành công', data: mapRoom(updated) });
    } catch (error) {
        console.error('[PHONG PUT]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * DELETE /api/phong/:id
 */
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const [[existing]] = await db.query(
            `SELECT MaPhong FROM Phong WHERE MaPhong = ? AND IsDeleted = 0`, [id]
        );
        if (!existing) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });

        const [[{ soThietBi }]] = await db.query(
            `SELECT COALESCE(SUM(SoLuong), 0) AS soThietBi FROM TaiSan WHERE MaPhong = ? AND IsDeleted = 0`, [id]
        );
        if (soThietBi > 0) {
            return res.status(409).json({
                success: false,
                message: `Phòng còn ${soThietBi} thiết bị. Vui lòng trả thiết bị về kho trước`
            });
        }

        await db.query(`UPDATE Phong SET IsDeleted = 1 WHERE MaPhong = ?`, [id]);
        res.json({ success: true, message: 'Xóa phòng thành công' });
    } catch (error) {
        console.error('[PHONG DELETE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
