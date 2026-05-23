const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { mapSupplier } = require('../mappers');

router.use(authMiddleware);

// ─── Helper: fetch a single supplier with asset count ─────────────────────────

async function fetchSupplierWithCount(id) {
    const [[row]] = await db.query(
        `SELECT ncc.*, COUNT(ts.MaTaiSan) AS SoThietBi
         FROM NhaCungCap ncc
         LEFT JOIN TaiSan ts ON ts.MaNCC = ncc.MaNCC AND ts.IsDeleted = 0
         WHERE ncc.MaNCC = ? AND ncc.IsDeleted = 0
         GROUP BY ncc.MaNCC`,
        [id]
    );
    if (!row) return null;
    return { ...mapSupplier(row), assetCount: row.SoThietBi };
}

// ─── GET / ────────────────────────────────────────────────────────────────────

/**
 * GET /api/nhacc
 * Query: ?keyword=<search>  (searches TenNCC, Email, SoDienThoai)
 */
router.get('/', async (req, res) => {
    try {
        const { keyword } = req.query;

        let where = 'WHERE ncc.IsDeleted = 0';
        const params = [];

        if (keyword && keyword.trim()) {
            where += ' AND (ncc.TenNCC LIKE ? OR ncc.Email LIKE ? OR ncc.SoDienThoai LIKE ?)';
            const like = `%${keyword.trim()}%`;
            params.push(like, like, like);
        }

        const [rows] = await db.query(
            `SELECT ncc.*, COUNT(ts.MaTaiSan) AS SoThietBi
             FROM NhaCungCap ncc
             LEFT JOIN TaiSan ts ON ts.MaNCC = ncc.MaNCC AND ts.IsDeleted = 0
             ${where}
             GROUP BY ncc.MaNCC
             ORDER BY ncc.TenNCC ASC`,
            params
        );

        res.json({
            success: true,
            data: rows.map(r => ({ ...mapSupplier(r), assetCount: r.SoThietBi })),
        });
    } catch (err) {
        console.error('[NCC GET ALL]', err);
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
});

// ─── POST / ───────────────────────────────────────────────────────────────────

/**
 * POST /api/nhacc
 * Body: { TenNCC (required), Email?, SoDienThoai?, DiaChi?, ThongTinHoTro?, TrangThai? }
 */
router.post('/', adminOnly, async (req, res) => {
    try {
        const {
            TenNCC,
            Email,
            SoDienThoai,
            DiaChi,
            ThongTinHoTro,
            TrangThai = 1,
        } = req.body;

        if (!TenNCC || !TenNCC.trim()) {
            return res.status(400).json({ success: false, message: 'TenNCC là bắt buộc' });
        }

        const [result] = await db.query(
            `INSERT INTO NhaCungCap (TenNCC, Email, SoDienThoai, DiaChi, ThongTinHoTro, TrangThai)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                TenNCC.trim(),
                Email       || null,
                SoDienThoai || null,
                DiaChi      || null,
                ThongTinHoTro || null,
                TrangThai,
            ]
        );

        const data = await fetchSupplierWithCount(result.insertId);
        res.status(201).json({ success: true, message: 'Thêm nhà cung cấp thành công', data });
    } catch (err) {
        console.error('[NCC POST]', err);
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
});

// ─── PUT /:id ─────────────────────────────────────────────────────────────────

/**
 * PUT /api/nhacc/:id
 * Body: any subset of { TenNCC, Email, SoDienThoai, DiaChi, ThongTinHoTro, TrangThai }
 */
router.put('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const [[existing]] = await db.query(
            `SELECT MaNCC FROM NhaCungCap WHERE MaNCC = ? AND IsDeleted = 0`,
            [id]
        );
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhà cung cấp' });
        }

        const { TenNCC, Email, SoDienThoai, DiaChi, ThongTinHoTro, TrangThai } = req.body;

        const fields = [];
        const values = [];

        if (TenNCC       !== undefined) { fields.push('TenNCC = ?');        values.push(TenNCC); }
        if (Email        !== undefined) { fields.push('Email = ?');         values.push(Email); }
        if (SoDienThoai  !== undefined) { fields.push('SoDienThoai = ?');   values.push(SoDienThoai); }
        if (DiaChi       !== undefined) { fields.push('DiaChi = ?');        values.push(DiaChi); }
        if (ThongTinHoTro!== undefined) { fields.push('ThongTinHoTro = ?'); values.push(ThongTinHoTro); }
        if (TrangThai    !== undefined) { fields.push('TrangThai = ?');     values.push(TrangThai); }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có trường nào cần cập nhật' });
        }

        values.push(id);
        await db.query(`UPDATE NhaCungCap SET ${fields.join(', ')} WHERE MaNCC = ?`, values);

        const data = await fetchSupplierWithCount(id);
        res.json({ success: true, message: 'Cập nhật nhà cung cấp thành công', data });
    } catch (err) {
        console.error('[NCC PUT]', err);
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────

/**
 * DELETE /api/nhacc/:id
 * Soft-deletes the supplier. Blocked if supplier still has active assets.
 */
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const [[existing]] = await db.query(
            `SELECT MaNCC FROM NhaCungCap WHERE MaNCC = ? AND IsDeleted = 0`,
            [id]
        );
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhà cung cấp' });
        }

        const [[{ soTaiSan }]] = await db.query(
            `SELECT COUNT(*) AS soTaiSan FROM TaiSan WHERE MaNCC = ? AND IsDeleted = 0`,
            [id]
        );
        if (soTaiSan > 0) {
            return res.status(409).json({
                success: false,
                message: `Không thể xóa: nhà cung cấp này đang có ${soTaiSan} thiết bị liên kết`,
            });
        }

        await db.query(`UPDATE NhaCungCap SET IsDeleted = 1 WHERE MaNCC = ?`, [id]);
        res.json({ success: true, message: 'Xóa nhà cung cấp thành công' });
    } catch (err) {
        console.error('[NCC DELETE]', err);
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
});

module.exports = router;
