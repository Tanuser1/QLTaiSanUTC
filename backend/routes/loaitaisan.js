const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { mapDeviceCategory } = require('../mappers');

router.use(authMiddleware);

/**
 * GET /api/loai-taisan
 * Query: ?NhomLoai=MayTinh&all=true (all=true trả cả loại con)
 */
router.get('/', async (req, res) => {
    try {
        const { NhomLoai, all } = req.query;

        let where = 'WHERE IsDeleted = 0';
        const params = [];

        if (all !== 'true') { where += ' AND MaLoaiCha IS NULL'; }
        if (NhomLoai) { where += ' AND NhomLoai = ?'; params.push(NhomLoai); }

        const [rows] = await db.query(
            `SELECT * FROM LoaiTaiSan ${where} ORDER BY ThuTu, TenLoai`, params
        );
        res.json({ success: true, data: rows.map(mapDeviceCategory) });
    } catch (error) {
        console.error('[LOAI GET ALL]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * GET /api/loai-taisan/:id
 * Chi tiết + danh sách loại con
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [[loai]] = await db.query(
            `SELECT * FROM LoaiTaiSan WHERE MaLoai = ? AND IsDeleted = 0`, [id]
        );
        if (!loai) return res.status(404).json({ success: false, message: 'Không tìm thấy loại tài sản' });

        const [loaiCon] = await db.query(
            `SELECT * FROM LoaiTaiSan WHERE MaLoaiCha = ? AND IsDeleted = 0 ORDER BY ThuTu, TenLoai`,
            [id]
        );

        res.json({ success: true, data: mapDeviceCategory({ ...loai, LoaiCon: loaiCon }) });
    } catch (error) {
        console.error('[LOAI GET ONE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/loai-taisan
 * Body: { TenLoai, KyHieu, NhomLoai, GhiChu, ThuTu, MaLoaiCha? }
 */
router.post('/', adminOnly, async (req, res) => {
    try {
        const { TenLoai, KyHieu, NhomLoai = 'Khac', GhiChu, ThuTu = 1, MaLoaiCha } = req.body;

        if (!TenLoai) return res.status(400).json({ success: false, message: 'TenLoai là bắt buộc' });

        if (MaLoaiCha) {
            const [[cha]] = await db.query(
                `SELECT MaLoai FROM LoaiTaiSan WHERE MaLoai = ? AND IsDeleted = 0`, [MaLoaiCha]
            );
            if (!cha) return res.status(400).json({ success: false, message: 'Loại cha không tồn tại' });
        }

        const [result] = await db.query(
            `INSERT INTO LoaiTaiSan (MaLoaiCha, TenLoai, KyHieu, NhomLoai, GhiChu, ThuTu)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [MaLoaiCha || null, TenLoai, KyHieu || null, NhomLoai, GhiChu || null, ThuTu]
        );

        const [[newLoai]] = await db.query(`SELECT * FROM LoaiTaiSan WHERE MaLoai = ?`, [result.insertId]);
        res.status(201).json({ success: true, message: 'Thêm loại tài sản thành công', data: mapDeviceCategory(newLoai) });
    } catch (error) {
        console.error('[LOAI POST]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * PUT /api/loai-taisan/:id
 */
router.put('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { TenLoai, KyHieu, NhomLoai, GhiChu, ThuTu, MaLoaiCha } = req.body;

        const [[existing]] = await db.query(
            `SELECT MaLoai FROM LoaiTaiSan WHERE MaLoai = ? AND IsDeleted = 0`, [id]
        );
        if (!existing) return res.status(404).json({ success: false, message: 'Không tìm thấy loại tài sản' });

        const fields = [];
        const values = [];

        if (TenLoai  !== undefined) { fields.push('TenLoai = ?');   values.push(TenLoai); }
        if (KyHieu   !== undefined) { fields.push('KyHieu = ?');    values.push(KyHieu); }
        if (NhomLoai !== undefined) { fields.push('NhomLoai = ?');  values.push(NhomLoai); }
        if (GhiChu   !== undefined) { fields.push('GhiChu = ?');    values.push(GhiChu); }
        if (ThuTu    !== undefined) { fields.push('ThuTu = ?');     values.push(ThuTu); }
        if (MaLoaiCha!== undefined) { fields.push('MaLoaiCha = ?'); values.push(MaLoaiCha || null); }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có trường nào cần cập nhật' });
        }

        values.push(id);
        await db.query(`UPDATE LoaiTaiSan SET ${fields.join(', ')} WHERE MaLoai = ?`, values);

        const [[updated]] = await db.query(`SELECT * FROM LoaiTaiSan WHERE MaLoai = ?`, [id]);
        res.json({ success: true, message: 'Cập nhật thành công', data: mapDeviceCategory(updated) });
    } catch (error) {
        console.error('[LOAI PUT]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * DELETE /api/loai-taisan/:id
 */
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const [[existing]] = await db.query(
            `SELECT MaLoai FROM LoaiTaiSan WHERE MaLoai = ? AND IsDeleted = 0`, [id]
        );
        if (!existing) return res.status(404).json({ success: false, message: 'Không tìm thấy loại tài sản' });

        const [[{ soTaiSan }]] = await db.query(
            `SELECT COUNT(*) AS soTaiSan FROM TaiSan WHERE MaLoai = ? AND IsDeleted = 0`, [id]
        );
        if (soTaiSan > 0) {
            return res.status(409).json({
                success: false,
                message: `Không thể xóa: có ${soTaiSan} thiết bị đang sử dụng loại này`
            });
        }

        await db.query(`UPDATE LoaiTaiSan SET MaLoaiCha = NULL WHERE MaLoaiCha = ?`, [id]);
        await db.query(`UPDATE LoaiTaiSan SET IsDeleted = 1 WHERE MaLoai = ?`, [id]);
        res.json({ success: true, message: 'Xóa loại tài sản thành công' });
    } catch (error) {
        console.error('[LOAI DELETE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/loai-taisan/:id/loai-con
 * Gán loại có sẵn thành con của loại này
 * Body: { MaLoaiCon }
 */
router.post('/:id/loai-con', adminOnly, async (req, res) => {
    try {
        const MaLoaiCha = req.params.id;
        const { MaLoaiCon } = req.body;

        if (!MaLoaiCon) return res.status(400).json({ success: false, message: 'MaLoaiCon là bắt buộc' });
        if (String(MaLoaiCha) === String(MaLoaiCon)) {
            return res.status(400).json({ success: false, message: 'Loại cha và loại con không được trùng nhau' });
        }

        const [[cha]] = await db.query(`SELECT MaLoai FROM LoaiTaiSan WHERE MaLoai = ? AND IsDeleted = 0`, [MaLoaiCha]);
        if (!cha) return res.status(404).json({ success: false, message: 'Loại cha không tồn tại' });

        const [[con]] = await db.query(`SELECT MaLoai, MaLoaiCha FROM LoaiTaiSan WHERE MaLoai = ? AND IsDeleted = 0`, [MaLoaiCon]);
        if (!con) return res.status(404).json({ success: false, message: 'Loại con không tồn tại' });

        if (con.MaLoaiCha !== null) {
            return res.status(409).json({ success: false, message: 'Loại tài sản này đã có loại cha rồi' });
        }

        await db.query(`UPDATE LoaiTaiSan SET MaLoaiCha = ? WHERE MaLoai = ?`, [MaLoaiCha, MaLoaiCon]);
        res.status(201).json({ success: true, message: 'Gán loại con thành công' });
    } catch (error) {
        console.error('[LOAI CON POST]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * DELETE /api/loai-taisan/:id/loai-con/:maLoaiCon
 * Gỡ loại con (set MaLoaiCha = NULL)
 */
router.delete('/:id/loai-con/:maLoaiCon', adminOnly, async (req, res) => {
    try {
        const { id: MaLoaiCha, maLoaiCon: MaLoaiCon } = req.params;

        const [[con]] = await db.query(
            `SELECT MaLoai FROM LoaiTaiSan WHERE MaLoai = ? AND MaLoaiCha = ? AND IsDeleted = 0`,
            [MaLoaiCon, MaLoaiCha]
        );
        if (!con) {
            return res.status(404).json({ success: false, message: 'Quan hệ loại cha-con không tồn tại' });
        }

        await db.query(`UPDATE LoaiTaiSan SET MaLoaiCha = NULL WHERE MaLoai = ?`, [MaLoaiCon]);
        res.json({ success: true, message: 'Đã gỡ loại con khỏi loại cha' });
    } catch (error) {
        console.error('[LOAI CON DELETE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
