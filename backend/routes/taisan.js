const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { mapAsset, mapLiquidation, paginatedResponse } = require('../mappers');

router.use(authMiddleware);

// ─── Helper ───────────────────────────────────────────────────────────────────

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
        const [[{ cnt }]] = await db.query(
            `SELECT COUNT(*) AS cnt FROM TaiSan WHERE MaQuanLy = ?`, [maQuanLy]
        );
        if (cnt === 0) break;
        attempt++;
    } while (true);

    return maQuanLy;
}

const SYSTEM_WAREHOUSE_NAME = 'Kho quản trị thiết bị';
const SYSTEM_WAREHOUSE_BUILDING = 'Kho quản trị';

async function getSystemWarehouseRoomId() {
    const [[exactRoom]] = await db.query(
        `SELECT MaPhong FROM Phong
         WHERE IsDeleted = 0 AND LoaiPhong = 'Kho' AND TenPhong = ?
         LIMIT 1`,
        [SYSTEM_WAREHOUSE_NAME]
    );
    if (exactRoom) return exactRoom.MaPhong;

    const [[anyWarehouse]] = await db.query(
        `SELECT MaPhong FROM Phong
         WHERE IsDeleted = 0 AND LoaiPhong = 'Kho'
         ORDER BY MaPhong ASC
         LIMIT 1`
    );
    if (anyWarehouse) return anyWarehouse.MaPhong;

    const [result] = await db.query(
        `INSERT INTO Phong (MaKhoa, TenPhong, TenToaNha, Tang, LoaiPhong, GhiChu)
         VALUES (NULL, ?, ?, 1, 'Kho', ?)`,
        [SYSTEM_WAREHOUSE_NAME, SYSTEM_WAREHOUSE_BUILDING, 'Kho hệ thống dùng cho thiết bị chờ thanh lý']
    );
    return result.insertId;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/taisan
 * Query: ?MaPhong=&MaLoai=&TrangThai=&keyword=&page=1&limit=20&inKho=true
 */
router.get('/', async (req, res) => {
    try {
        const { MaPhong, MaLoai, TrangThai, keyword, page = 1, limit = 20, inKho } = req.query;
        const { VaiTro, MaKhoa } = req.user;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = 'WHERE ts.IsDeleted = 0';
        const params = [];

        // GiaoVien chỉ thấy tài sản thuộc khoa mình
        if (VaiTro === 'GiaoVien' && MaKhoa) {
            where += ' AND p.MaKhoa = ?';
            params.push(MaKhoa);
        }

        if (MaPhong)       { where += ' AND ts.MaPhong = ?';   params.push(MaPhong); }
        if (MaLoai)        { where += ' AND ts.MaLoai = ?';    params.push(MaLoai); }
        if (TrangThai)     { where += ' AND ts.TrangThai = ?'; params.push(TrangThai); }
        if (inKho === 'true') { where += ' AND ts.MaPhong IS NULL AND ts.TrangThai NOT IN (0, 5)'; }
        if (keyword) {
            where += ' AND (ts.TenTaiSan LIKE ? OR ts.MaQuanLy LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        const [rows] = await db.query(
            `SELECT ts.MaTaiSan, ts.MaQuanLy, ts.TenTaiSan, ts.TrangThai,
                    ts.Gia, ts.SoLuong, ts.NgayNhap, ts.HinhAnh, ts.QRCode, ts.NamSanXuat,
                    lt.TenLoai, lt.NhomLoai, lt.KyHieu,
                    p.TenPhong, p.TenToaNha,
                    nd.HoTen  AS NguoiSuDung,
                    ncc.TenNCC
             FROM TaiSan ts
             LEFT JOIN LoaiTaiSan lt  ON lt.MaLoai        = ts.MaLoai
             LEFT JOIN Phong p        ON p.MaPhong         = ts.MaPhong
             LEFT JOIN NguoiDung nd   ON nd.MaNguoiDung    = ts.MaNguoiSuDung
             LEFT JOIN NhaCungCap ncc ON ncc.MaNCC          = ts.MaNCC
             ${where}
             ORDER BY ts.NgayTao DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [[{ total, totalQuantity }]] = await db.query(
            `SELECT COUNT(*) AS total, COALESCE(SUM(ts.SoLuong), 0) AS totalQuantity FROM TaiSan ts LEFT JOIN Phong p ON p.MaPhong = ts.MaPhong ${where}`, params
        );

        res.json({
            success: true,
            data: {
                ...paginatedResponse(rows.map(mapAsset), total, parseInt(page), parseInt(limit)),
                totalQuantity
            }
        });
    } catch (error) {
        console.error('[TAISAN GET ALL]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * GET /api/taisan/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [[ts]] = await db.query(
            `SELECT ts.*,
                    lt.TenLoai, lt.NhomLoai, lt.KyHieu,
                    p.TenPhong, p.TenToaNha, p.Tang, p.LoaiPhong,
                    k.MaKhoa, k.TenKhoa,
                    nd.HoTen  AS NguoiSuDung, nd.Email AS EmailNguoiSuDung,
                    ncc.TenNCC, ncc.SoDienThoai AS SDTNhaCungCap
             FROM TaiSan ts
             LEFT JOIN LoaiTaiSan lt  ON lt.MaLoai        = ts.MaLoai
             LEFT JOIN Phong p        ON p.MaPhong         = ts.MaPhong
             LEFT JOIN Khoa k         ON k.MaKhoa          = p.MaKhoa
             LEFT JOIN NguoiDung nd   ON nd.MaNguoiDung    = ts.MaNguoiSuDung
             LEFT JOIN NhaCungCap ncc ON ncc.MaNCC          = ts.MaNCC
             WHERE ts.MaTaiSan = ? AND ts.IsDeleted = 0`,
            [id]
        );

        if (!ts) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });

        const [linhKien] = await db.query(
            `SELECT lk.MaLienKet, lk.NgayGhep, lk.GhiChu,
                    ts_con.MaTaiSan, ts_con.MaQuanLy, ts_con.TenTaiSan, ts_con.TrangThai,
                    lt_con.TenLoai AS TenLoaiCon, lt_con.NhomLoai AS NhomLoaiCon
             FROM TaiSan_LinhKien lk
             JOIN TaiSan ts_con       ON ts_con.MaTaiSan = lk.MaTaiSanCon
             JOIN LoaiTaiSan lt_con   ON lt_con.MaLoai   = ts_con.MaLoai
             WHERE lk.MaTaiSanCha = ? AND lk.NgayThao IS NULL AND lk.IsDeleted = 0`,
            [id]
        );

        const [lichSuSuaChua] = await db.query(
            `SELECT lsc.*, nd.HoTen AS TenKTV
             FROM LichSuSuaChua lsc
             LEFT JOIN NguoiDung nd ON nd.MaNguoiDung = lsc.NguoiSuaChua
             WHERE lsc.MaTaiSan = ?
             ORDER BY lsc.NgaySua DESC`,
            [id]
        );

        res.json({ success: true, data: mapAsset({ ...ts, LinhKien: linhKien, LichSuSuaChua: lichSuSuaChua }) });
    } catch (error) {
        console.error('[TAISAN GET ONE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/taisan
 * Body: { TenTaiSan, MaLoai, MaNCC, Gia, ThongSoKyThuat, ThoiGianBaoHanh, NgayNhap, NamSanXuat, MaHoaDon }
 */
router.post('/', adminOnly, async (req, res) => {
    try {
        const {
            TenTaiSan, MaLoai, MaNCC, Gia = 0, MaPhong,
            TrangThai = 1, SoLuong = 1,
            ThongSoKyThuat, ThoiGianBaoHanh, NgayNhap, NamSanXuat, MaHoaDon
        } = req.body;

        if (!TenTaiSan || !MaLoai) {
            return res.status(400).json({ success: false, message: 'TenTaiSan và MaLoai là bắt buộc' });
        }

        const [[loai]] = await db.query(
            `SELECT MaLoai FROM LoaiTaiSan WHERE MaLoai = ? AND IsDeleted = 0`, [MaLoai]
        );
        if (!loai) return res.status(400).json({ success: false, message: 'Loại tài sản không tồn tại' });

        const MaQuanLy = await sinhMaQuanLy(MaLoai);

        const targetRoomId = Number(TrangThai) === 5
            ? await getSystemWarehouseRoomId()
            : (MaPhong || null);

        const [result] = await db.query(
            `INSERT INTO TaiSan
             (MaQuanLy, TenTaiSan, MaLoai, MaNCC, MaPhong, Gia, SoLuong, ThongSoKyThuat, ThoiGianBaoHanh, NgayNhap, NamSanXuat, MaHoaDon, TrangThai)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                MaQuanLy, TenTaiSan, MaLoai,
                MaNCC || null, targetRoomId, Gia,
                Math.max(1, parseInt(SoLuong) || 1),
                ThongSoKyThuat ? JSON.stringify(ThongSoKyThuat) : null,
                ThoiGianBaoHanh || null,
                NgayNhap || null,
                NamSanXuat || null,
                MaHoaDon || null,
                TrangThai,
            ]
        );

        const [[newTs]] = await db.query(`SELECT * FROM TaiSan WHERE MaTaiSan = ?`, [result.insertId]);
        res.status(201).json({ success: true, message: 'Thêm thiết bị thành công', data: mapAsset(newTs) });
    } catch (error) {
        console.error('[TAISAN POST]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * PUT /api/taisan/:id
 */
router.put('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            TenTaiSan, MaLoai, MaNCC, Gia,
            ThongSoKyThuat, ThoiGianBaoHanh, NgayNhap, NamSanXuat, TrangThai, MaNguoiSuDung
        } = req.body;

        const [[ts]] = await db.query(
            `SELECT MaTaiSan FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [id]
        );
        if (!ts) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });

        const fields = [];
        const values = [];

        if (TenTaiSan       !== undefined) { fields.push('TenTaiSan = ?');       values.push(TenTaiSan); }
        if (MaLoai          !== undefined) { fields.push('MaLoai = ?');           values.push(MaLoai); }
        if (MaNCC           !== undefined) { fields.push('MaNCC = ?');            values.push(MaNCC); }
        if (Gia             !== undefined) { fields.push('Gia = ?');              values.push(Gia); }
        if (ThongSoKyThuat  !== undefined) { fields.push('ThongSoKyThuat = ?');   values.push(JSON.stringify(ThongSoKyThuat)); }
        if (ThoiGianBaoHanh !== undefined) { fields.push('ThoiGianBaoHanh = ?'); values.push(ThoiGianBaoHanh); }
        if (NgayNhap        !== undefined) { fields.push('NgayNhap = ?');         values.push(NgayNhap); }
        if (NamSanXuat      !== undefined) { fields.push('NamSanXuat = ?');       values.push(NamSanXuat); }
        if (TrangThai       !== undefined) { fields.push('TrangThai = ?');        values.push(TrangThai); }
        if (MaNguoiSuDung   !== undefined) { fields.push('MaNguoiSuDung = ?');   values.push(MaNguoiSuDung); }

        if (Number(TrangThai) === 5) {
            const warehouseRoomId = await getSystemWarehouseRoomId();
            fields.push('MaPhong = ?', 'MaNguoiSuDung = ?');
            values.push(warehouseRoomId, null);
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có trường nào cần cập nhật' });
        }

        values.push(id);
        await db.query(`UPDATE TaiSan SET ${fields.join(', ')} WHERE MaTaiSan = ?`, values);

        const [[updated]] = await db.query(`SELECT * FROM TaiSan WHERE MaTaiSan = ?`, [id]);
        res.json({ success: true, message: 'Cập nhật thiết bị thành công', data: mapAsset(updated) });
    } catch (error) {
        console.error('[TAISAN PUT]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * DELETE /api/taisan/:id  (soft delete)
 */
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const [[ts]] = await db.query(
            `SELECT MaTaiSan, MaPhong FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [id]
        );
        if (!ts) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });

        const [[{ soLinhKien }]] = await db.query(
            `SELECT COUNT(*) AS soLinhKien FROM TaiSan_LinhKien
             WHERE MaTaiSanCha = ? AND NgayThao IS NULL AND IsDeleted = 0`, [id]
        );
        if (soLinhKien > 0) {
            return res.status(409).json({
                success: false,
                message: `Thiết bị còn ${soLinhKien} linh kiện đang gắn. Vui lòng gỡ linh kiện trước`
            });
        }

        await db.query(`UPDATE TaiSan SET IsDeleted = 1 WHERE MaTaiSan = ?`, [id]);
        res.json({ success: true, message: 'Xóa thiết bị thành công' });
    } catch (error) {
        console.error('[TAISAN DELETE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * GET /api/taisan/:id/qrcode
 */
router.get('/:id/qrcode', async (req, res) => {
    try {
        const { id } = req.params;

        const [[ts]] = await db.query(
            `SELECT MaTaiSan, MaQuanLy, TenTaiSan, QRCode FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [id]
        );
        if (!ts) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });

        const baseUrl = process.env.APP_URL || 'http://localhost:5173';
        const qrContent = `${baseUrl}/assets/${id}`;

        const qrDataUrl = await QRCode.toDataURL(qrContent, {
            width: 300, margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
        });

        if (!ts.QRCode) {
            await db.query(`UPDATE TaiSan SET QRCode = ? WHERE MaTaiSan = ?`, [qrContent, id]);
        }

        res.json({
            success: true,
            data: {
                id:        ts.MaTaiSan,
                code:      ts.MaQuanLy,
                name:      ts.TenTaiSan,
                qrContent,
                qrDataUrl,
            },
        });
    } catch (error) {
        console.error('[TAISAN QRCODE]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/taisan/:id/gan-phong
 * Body: { MaPhong, MaNguoiSuDung? }
 */
router.post('/:id/gan-phong', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { MaPhong, MaNguoiSuDung } = req.body;

        if (!MaPhong) return res.status(400).json({ success: false, message: 'MaPhong là bắt buộc' });

        const [[ts]] = await db.query(
            `SELECT MaTaiSan, TrangThai FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [id]
        );
        if (!ts) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });
        if (ts.TrangThai === 0) {
            return res.status(409).json({ success: false, message: 'Thiết bị đã được thanh lý, không thể gán phòng' });
        }

        const [[phong]] = await db.query(
            `SELECT MaPhong FROM Phong WHERE MaPhong = ? AND IsDeleted = 0`, [MaPhong]
        );
        if (!phong) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });

        await db.query(
            `UPDATE TaiSan SET MaPhong = ?, MaNguoiSuDung = ?, TrangThai = 1 WHERE MaTaiSan = ?`,
            [MaPhong, MaNguoiSuDung || null, id]
        );

        const [[updated]] = await db.query(
            `SELECT ts.*, p.TenPhong, p.TenToaNha
             FROM TaiSan ts JOIN Phong p ON p.MaPhong = ts.MaPhong
             WHERE ts.MaTaiSan = ?`, [id]
        );
        res.json({ success: true, message: 'Gán thiết bị vào phòng thành công', data: mapAsset(updated) });
    } catch (error) {
        console.error('[TAISAN GAN PHONG]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/taisan/:id/tra-kho
 */
router.post('/:id/tra-kho', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const [[ts]] = await db.query(
            `SELECT MaTaiSan, MaPhong FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [id]
        );
        if (!ts) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });
        if (!ts.MaPhong) {
            return res.status(409).json({ success: false, message: 'Thiết bị đang ở kho, không cần trả' });
        }

        await db.query(
            `UPDATE TaiSan SET MaPhong = NULL, MaNguoiSuDung = NULL, TrangThai = 1 WHERE MaTaiSan = ?`, [id]
        );
        res.json({ success: true, message: 'Trả thiết bị về kho thành công' });
    } catch (error) {
        console.error('[TAISAN TRA KHO]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/taisan/:id/thanh-ly
 * Body: { LyDoThanhLy, GhiChu }
 */
router.post('/:id/thanh-ly', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { LyDoThanhLy, GhiChu } = req.body;

        if (!LyDoThanhLy) {
            return res.status(400).json({ success: false, message: 'LyDoThanhLy là bắt buộc' });
        }

        const [[ts]] = await db.query(
            `SELECT MaTaiSan, TrangThai FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [id]
        );
        if (!ts) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });
        if (ts.TrangThai === 0) {
            return res.status(409).json({ success: false, message: 'Thiết bị đã được thanh lý rồi' });
        }

        const warehouseRoomId = await getSystemWarehouseRoomId();
        await db.query(
            `UPDATE TaiSan SET MaPhong = ?, MaNguoiSuDung = NULL, TrangThai = 5 WHERE MaTaiSan = ?`,
            [warehouseRoomId, id]
        );

        const [[updated]] = await db.query(
            `SELECT ts.*, p.TenPhong, p.TenToaNha
             FROM TaiSan ts
             LEFT JOIN Phong p ON p.MaPhong = ts.MaPhong
             WHERE ts.MaTaiSan = ?`,
            [id]
        );

        res.json({ success: true, message: 'Đã chuyển thiết bị vào kho chờ thanh lý', data: mapAsset(updated) });
    } catch (error) {
        console.error('[TAISAN THANH LY]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * POST /api/taisan/:id/hoan-tat-thanh-ly
 * Body: { LyDoThanhLy, GiaThanhLy?, GhiChu? }
 */
router.post('/:id/hoan-tat-thanh-ly', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { LyDoThanhLy, GiaThanhLy = 0, GhiChu } = req.body;

        if (!LyDoThanhLy) {
            return res.status(400).json({ success: false, message: 'LyDoThanhLy là bắt buộc' });
        }

        const [[ts]] = await db.query(
            `SELECT MaTaiSan, TrangThai FROM TaiSan WHERE MaTaiSan = ? AND IsDeleted = 0`, [id]
        );
        if (!ts) return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });
        if (ts.TrangThai === 0) {
            return res.status(409).json({ success: false, message: 'Thiết bị đã được thanh lý rồi' });
        }
        if (ts.TrangThai !== 5) {
            return res.status(409).json({ success: false, message: 'Chỉ có thể hoàn tất thanh lý thiết bị đang chờ thanh lý' });
        }

        const [[pending]] = await db.query(
            `SELECT MaThanhLy FROM ThanhLy
             WHERE MaTaiSan = ? AND TrangThai = 1
             ORDER BY MaThanhLy DESC
             LIMIT 1`,
            [id]
        );

        let liquidationId;
        if (pending) {
            liquidationId = pending.MaThanhLy;
            await db.query(
                `UPDATE ThanhLy
                 SET LyDoThanhLy = ?, TrangThai = 2, NgayThanhLy = CURDATE(),
                     GiaThanhLy = ?, NguoiDuyet = ?, GhiChu = ?
                 WHERE MaThanhLy = ?`,
                [LyDoThanhLy, GiaThanhLy, req.user.MaNguoiDung, GhiChu || null, liquidationId]
            );
        } else {
            const [result] = await db.query(
                `INSERT INTO ThanhLy
                 (MaTaiSan, LyDoThanhLy, TrangThai, NgayNhapKho, NgayThanhLy, GiaThanhLy, NguoiLap, NguoiDuyet, GhiChu)
                 VALUES (?, ?, 2, CURDATE(), CURDATE(), ?, ?, ?, ?)`,
                [id, LyDoThanhLy, GiaThanhLy, req.user.MaNguoiDung, req.user.MaNguoiDung, GhiChu || null]
            );
            liquidationId = result.insertId;
        }

        await db.query(
            `UPDATE TaiSan SET MaPhong = NULL, MaNguoiSuDung = NULL, TrangThai = 0 WHERE MaTaiSan = ?`,
            [id]
        );

        const [[thanhLy]] = await db.query(`SELECT * FROM ThanhLy WHERE MaThanhLy = ?`, [liquidationId]);
        res.json({
            success: true,
            message: 'Đã hoàn tất thanh lý thiết bị',
            data: mapLiquidation(thanhLy),
        });
    } catch (error) {
        console.error('[TAISAN HOAN TAT THANH LY]', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
