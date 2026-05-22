const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { mapComponentLink, mapAsset } = require('../mappers');

router.use(authMiddleware);

// ─── Helper (dùng chung với taisan.js) ───────────────────────────────────────

async function sinhMaQuanLy(maLoai) {
    const [[loai]] = await db.query(`SELECT KyHieu FROM LoaiTaiSan WHERE MaLoai = ?`, [maLoai]);
    const prefix = (loai?.KyHieu || 'TS').toUpperCase();
    const [[{ soHienTai }]] = await db.query(
        `SELECT COUNT(*) AS soHienTai FROM TaiSan WHERE MaLoai = ? AND IsDeleted = 0`, [maLoai]
    );
    let attempt = soHienTai + 1;
    let maQuanLy;
    do {
        maQuanLy = `${prefix}-${String(attempt).padStart(5, '0')}`;
        const [[{ exists }]] = await db.query(
            `SELECT COUNT(*) AS exists FROM TaiSan WHERE MaQuanLy = ?`, [maQuanLy]
        );
        if (exists === 0) break;
        attempt++;
    } while (true);
    return maQuanLy;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/taisan/:id/linh-kien
 * Query: ?dangGan=true (chỉ lấy đang gắn)
 */
router.get('/:id/linh-kien', async (req, res) => {
    try {
        const { id } = req.params;
        const { dangGan } = req.query;

        const [[ts]] = await db.query(
            `SELECT MaTaiSan FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [id]
        );
        if (!ts) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị cha' });

        let where = 'lk.MaTaiSanCha = ? AND lk.IsDeleted = 0';
        const params = [id];

        if (dangGan === 'true') { where += ' AND lk.NgayThao IS NULL'; }

        const [rows] = await db.query(
            `SELECT lk.MaLienKet, lk.NgayGhep, lk.NgayThao, lk.GhiChu,
                    ts_con.MaTaiSan AS MaTaiSanCon, ts_con.MaQuanLy, ts_con.TenTaiSan, ts_con.TrangThai,
                    lt.TenLoai, lt.NhomLoai, lt.KyHieu,
                    nd_ghep.HoTen AS NguoiGhep,
                    nd_thao.HoTen AS NguoiThao
             FROM TaiSan_LinhKien lk
             JOIN TaiSan ts_con         ON ts_con.MaTaiSan  = lk.MaTaiSanCon
             JOIN LoaiTaiSan lt         ON lt.MaLoai         = ts_con.MaLoai
             LEFT JOIN NguoiDung nd_ghep ON nd_ghep.MaNguoiDung = lk.NguoiGhep
             LEFT JOIN NguoiDung nd_thao ON nd_thao.MaNguoiDung = lk.NguoiThao
             WHERE ${where}
             ORDER BY lk.NgayGhep DESC`,
            params
        );

        res.json({ success: true, data: rows.map(mapComponentLink) });
    } catch (error) {
        console.error('[LINHKIEN GET]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/taisan/:id/linh-kien/gan-co-san
 * Gắn thiết bị con có sẵn vào thiết bị cha
 * Body: { MaTaiSanCon, GhiChu? }
 */
router.post('/:id/linh-kien/gan-co-san', adminOnly, async (req, res) => {
    try {
        const { id: MaTaiSanCha } = req.params;
        const { MaTaiSanCon, GhiChu } = req.body;

        if (!MaTaiSanCon) return res.status(400).json({ success: false, message: 'MaTaiSanCon là bắt buộc' });
        if (String(MaTaiSanCha) === String(MaTaiSanCon)) {
            return res.status(400).json({ success: false, message: 'Thiết bị cha và con không được trùng nhau' });
        }

        const [[cha]] = await db.query(
            `SELECT MaTaiSan, MaLoai FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [MaTaiSanCha]
        );
        if (!cha) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị cha' });

        const [[con]] = await db.query(
            `SELECT MaTaiSan, MaLoai FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [MaTaiSanCon]
        );
        if (!con) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị con' });

        // Kiểm tra loại con có được phép gắn vào loại cha không (dùng MaLoaiCha)
        const [[phepGan]] = await db.query(
            `SELECT MaLoai FROM LoaiTaiSan
             WHERE MaLoai = ? AND MaLoaiCha = ? AND IsDeleted = 0`,
            [con.MaLoai, cha.MaLoai]
        );
        if (!phepGan) {
            return res.status(409).json({
                success: false,
                message: 'Loại thiết bị con này không được phép gắn vào loại thiết bị cha. Hãy cấu hình quan hệ loại trước'
            });
        }

        const [[dangGan]] = await db.query(
            `SELECT MaLienKet FROM TaiSan_LinhKien
             WHERE MaTaiSanCon = ? AND NgayThao IS NULL AND IsDeleted = 0`,
            [MaTaiSanCon]
        );
        if (dangGan) {
            return res.status(409).json({ success: false, message: 'Thiết bị con này đang được gắn vào một thiết bị khác' });
        }

        const [result] = await db.query(
            `INSERT INTO TaiSan_LinhKien (MaTaiSanCha, MaTaiSanCon, NgayGhep, NguoiGhep, GhiChu)
             VALUES (?, ?, CURDATE(), ?, ?)`,
            [MaTaiSanCha, MaTaiSanCon, req.user.MaNguoiDung, GhiChu || null]
        );

        const [[newLink]] = await db.query(
            `SELECT lk.*, ts.MaQuanLy, ts.TenTaiSan, ts.TrangThai,
                    lt.TenLoai, lt.NhomLoai, lt.KyHieu
             FROM TaiSan_LinhKien lk
             JOIN TaiSan ts      ON ts.MaTaiSan = lk.MaTaiSanCon
             JOIN LoaiTaiSan lt  ON lt.MaLoai   = ts.MaLoai
             WHERE lk.MaLienKet = ?`,
            [result.insertId]
        );

        res.status(201).json({ success: true, message: 'Gắn thiết bị con thành công', data: mapComponentLink(newLink) });
    } catch (error) {
        console.error('[LINHKIEN GAN CO SAN]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/taisan/:id/linh-kien/tao-moi-va-gan
 * Tạo mới thiết bị con + gắn luôn vào thiết bị cha
 * Body: { TenTaiSan, MaLoai, MaNCC?, Gia?, ThongSoKyThuat?, NgayNhap?, GhiChu? }
 */
router.post('/:id/linh-kien/tao-moi-va-gan', adminOnly, async (req, res) => {
    try {
        const { id: MaTaiSanCha } = req.params;
        const { TenTaiSan, MaLoai, MaNCC, Gia = 0, ThongSoKyThuat, NgayNhap, GhiChu } = req.body;

        if (!TenTaiSan || !MaLoai) {
            return res.status(400).json({ success: false, message: 'TenTaiSan và MaLoai là bắt buộc' });
        }

        const [[cha]] = await db.query(
            `SELECT MaTaiSan, MaLoai FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [MaTaiSanCha]
        );
        if (!cha) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị cha' });

        const [[phepGan]] = await db.query(
            `SELECT MaLoai FROM LoaiTaiSan
             WHERE MaLoai = ? AND MaLoaiCha = ? AND IsDeleted = 0`,
            [MaLoai, cha.MaLoai]
        );
        if (!phepGan) {
            return res.status(409).json({
                success: false,
                message: 'Loại thiết bị con này không được phép gắn vào loại thiết bị cha. Hãy cấu hình quan hệ loại trước'
            });
        }

        const MaQuanLy = await sinhMaQuanLy(MaLoai);

        const [tsResult] = await db.query(
            `INSERT INTO TaiSan (MaQuanLy, TenTaiSan, MaLoai, MaNCC, Gia, ThongSoKyThuat, NgayNhap, TrangThai)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [
                MaQuanLy, TenTaiSan, MaLoai, MaNCC || null, Gia,
                ThongSoKyThuat ? JSON.stringify(ThongSoKyThuat) : null,
                NgayNhap || null,
            ]
        );
        const MaTaiSanCon = tsResult.insertId;

        const [lkResult] = await db.query(
            `INSERT INTO TaiSan_LinhKien (MaTaiSanCha, MaTaiSanCon, NgayGhep, NguoiGhep, GhiChu)
             VALUES (?, ?, CURDATE(), ?, ?)`,
            [MaTaiSanCha, MaTaiSanCon, req.user.MaNguoiDung, GhiChu || null]
        );

        const [[newTs]]   = await db.query(`SELECT * FROM TaiSan WHERE MaTaiSan = ?`, [MaTaiSanCon]);
        const [[newLink]] = await db.query(`SELECT * FROM TaiSan_LinhKien WHERE MaLienKet = ?`, [lkResult.insertId]);

        res.status(201).json({
            success: true,
            message: 'Tạo và gắn thiết bị con thành công',
            data: {
                asset: mapAsset(newTs),
                link:  mapComponentLink(newLink),
            },
        });
    } catch (error) {
        console.error('[LINHKIEN TAO MOI VA GAN]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * DELETE /api/taisan/:id/linh-kien/:maLienKet
 * Gỡ thiết bị con (cập nhật NgayThao)
 * Body: { GhiChu? }
 */
router.delete('/:id/linh-kien/:maLienKet', adminOnly, async (req, res) => {
    try {
        const { id: MaTaiSanCha, maLienKet } = req.params;
        const { GhiChu } = req.body;

        const [[lk]] = await db.query(
            `SELECT MaLienKet FROM TaiSan_LinhKien
             WHERE MaLienKet = ? AND MaTaiSanCha = ? AND NgayThao IS NULL AND IsDeleted = 0`,
            [maLienKet, MaTaiSanCha]
        );
        if (!lk) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy liên kết hoặc thiết bị đã được gỡ rồi' });
        }

        await db.query(
            `UPDATE TaiSan_LinhKien
             SET NgayThao = CURDATE(), NguoiThao = ?, GhiChu = COALESCE(?, GhiChu)
             WHERE MaLienKet = ?`,
            [req.user.MaNguoiDung, GhiChu || null, maLienKet]
        );

        res.json({ success: true, message: 'Đã gỡ thiết bị con khỏi thiết bị cha' });
    } catch (error) {
        console.error('[LINHKIEN GO]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
