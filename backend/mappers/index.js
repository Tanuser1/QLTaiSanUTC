// Maps DB rows (Vietnamese PascalCase) → API response (English camelCase)

// ─── Lookup tables ────────────────────────────────────────────────────────────

const ASSET_STATUS = {
    1: 'active',
    2: 'borrowed',
    3: 'broken',
    4: 'underRepair',
    5: 'pendingLiquidation',
    0: 'liquidated',
};

const ASSET_STATUS_LABEL = {
    1: 'Đang dùng',
    2: 'Đang mượn',
    3: 'Hỏng',
    4: 'Đang sửa',
    5: 'Chờ thanh lý',
    0: 'Đã thanh lý',
};

const SUPPORT_STATUS = {
    1: 'pending',
    2: 'assigned',
    3: 'inspecting',
    4: 'awaitingApproval',
    5: 'approved',
    6: 'completed',
    9: 'rejected',
};

const REPORT_STATUS = {
    1: 'pending',
    2: 'approved',
    3: 'rejected',
};

const LIQUIDATION_STATUS = {
    1: 'processing',
    2: 'completed',
    3: 'cancelled',
};

const ROLE_MAP = {
    Admin:    'admin',
    BGH:      'bgh',
    KyThuat:  'technician',
    GiaoVien: 'teacher',
};

// ─── Mappers ──────────────────────────────────────────────────────────────────

/**
 * NguoiDung → user
 */
function mapUser(row) {
    if (!row) return null;
    return {
        id:                  row.MaNguoiDung,
        departmentId:        row.MaKhoa       ?? null,
        username:            row.TenDangNhap,
        fullName:            row.HoTen,
        email:               row.Email        ?? null,
        phone:               row.SoDienThoai  ?? null,
        role:                ROLE_MAP[row.VaiTro] ?? row.VaiTro,
        roleRaw:             row.VaiTro,
        mustChangePassword:  row.DaDoiMatKhau === 0,
        isActive:            row.TrangThai    === 1,
        lastLogin:           row.LanDangNhapCuoi ?? null,
        createdAt:           row.NgayTao      ?? null,
        // joined
        departmentName:      row.TenKhoa      ?? null,
    };
}

/**
 * Khoa → department
 */
function mapDepartment(row) {
    if (!row) return null;
    return {
        id:          row.MaKhoa,
        name:        row.TenKhoa,
        code:        row.KyHieu   ?? null,
        description: row.MoTa    ?? null,
        createdAt:   row.NgayTao ?? null,
    };
}

/**
 * LoaiTaiSan → deviceCategory
 */
function mapDeviceCategory(row) {
    if (!row) return null;
    return {
        id:         row.MaLoai,
        parentId:   row.MaLoaiCha  ?? null,
        name:       row.TenLoai,
        code:       row.KyHieu     ?? null,
        group:      row.NhomLoai,
        note:       row.GhiChu     ?? null,
        sortOrder:  row.ThuTu,
        createdAt:  row.NgayTao    ?? null,
        // nested children if present
        children:   Array.isArray(row.LoaiCon) ? row.LoaiCon.map(mapDeviceCategory) : undefined,
    };
}

/**
 * NhaCungCap → supplier
 */
function mapSupplier(row) {
    if (!row) return null;
    return {
        id:          row.MaNCC,
        name:        row.TenNCC,
        email:       row.Email          ?? null,
        phone:       row.SoDienThoai    ?? null,
        address:     row.DiaChi         ?? null,
        supportInfo: row.ThongTinHoTro  ?? null,
        isActive:    row.TrangThai      === 1,
        createdAt:   row.NgayTao        ?? null,
    };
}

/**
 * Phong → room
 */
function mapRoom(row) {
    if (!row) return null;
    return {
        id:             row.MaPhong,
        departmentId:   row.MaKhoa       ?? null,
        name:           row.TenPhong,
        building:       row.TenToaNha,
        address:        row.DiaChi        ?? null,
        floor:          row.Tang,
        type:           row.LoaiPhong,
        note:           row.GhiChu        ?? null,
        createdAt:      row.NgayTao       ?? null,
        // joined
        departmentName: row.TenKhoa       ?? null,
        assetCount:     row.SoLuongTaiSan ?? undefined,
        // nested
        assets: Array.isArray(row.DanhSachThietBi)
            ? row.DanhSachThietBi.map(mapAsset)
            : undefined,
    };
}

/**
 * TaiSan → asset  (+ joined fields from LoaiTaiSan, Phong, NguoiDung, NhaCungCap)
 */
function mapAsset(row) {
    if (!row) return null;
    return {
        id:              row.MaTaiSan,
        code:            row.MaQuanLy,
        name:            row.TenTaiSan,
        categoryId:      row.MaLoai         ?? null,
        supplierId:      row.MaNCC           ?? null,
        roomId:          row.MaPhong         ?? null,
        userId:          row.MaNguoiSuDung   ?? null,
        invoiceId:       row.MaHoaDon        ?? null,
        price:           row.Gia,
        specs:           row.ThongSoKyThuat  ?? null,
        image:           row.HinhAnh         ?? null,
        qrCode:          row.QRCode          ?? null,
        warrantyMonths:  row.ThoiGianBaoHanh ?? null,
        purchaseDate:    row.NgayNhap        ?? null,
        manufactureYear: row.NamSanXuat      ?? null,
        status:          ASSET_STATUS[row.TrangThai]      ?? row.TrangThai,
        statusLabel:     ASSET_STATUS_LABEL[row.TrangThai] ?? null,
        createdAt:       row.NgayTao         ?? null,
        updatedAt:       row.NgaySua         ?? null,
        // joined
        categoryName:    row.TenLoai         ?? null,
        categoryGroup:   row.NhomLoai        ?? null,
        categoryCode:    row.KyHieu          ?? null,
        roomName:        row.TenPhong        ?? null,
        building:        row.TenToaNha       ?? null,
        floor:           row.Tang            ?? null,
        assignedTo:      row.NguoiSuDung     ?? null,
        assignedEmail:   row.EmailNguoiSuDung?? null,
        supplierName:    row.TenNCC          ?? null,
        supplierPhone:   row.SDTNhaCungCap   ?? null,
        // nested
        components: Array.isArray(row.LinhKien)
            ? row.LinhKien.map(mapComponentLink)
            : undefined,
    };
}

/**
 * TaiSan_LinhKien → componentLink
 */
function mapComponentLink(row) {
    if (!row) return null;
    return {
        linkId:       row.MaLienKet,
        attachedAt:   row.NgayGhep,
        detachedAt:   row.NgayThao    ?? null,
        note:         row.GhiChu      ?? null,
        attachedBy:   row.NguoiGhep   ?? null,
        detachedBy:   row.NguoiThao   ?? null,
        // child asset
        assetId:      row.MaTaiSanCon ?? row.MaTaiSan ?? null,
        code:         row.MaQuanLy    ?? null,
        name:         row.TenTaiSan   ?? null,
        status:       ASSET_STATUS[row.TrangThai] ?? row.TrangThai ?? null,
        categoryName: row.TenLoai     ?? row.TenLoaiCon ?? null,
        categoryGroup:row.NhomLoai    ?? row.NhomLoaiCon ?? null,
    };
}

/**
 * YeuCauHoTro → supportRequest
 */
function mapSupportRequest(row) {
    if (!row) return null;
    return {
        id:               row.MaYeuCau,
        assetId:          row.MaTaiSan,
        reportedBy:       row.MaNguoiBao,
        type:             row.LoaiYeuCau,
        description:      row.MoTaLoi,
        image:            row.HinhAnhLoi    ?? null,
        priority:         row.MucDo,
        status:           SUPPORT_STATUS[row.TrangThai] ?? row.TrangThai,
        assignedTo:       row.NguoiXuLy    ?? null,
        processedAt:      row.NgayXuLy     ?? null,
        rejectionReason:  row.LyDoTuChoi   ?? null,
        createdAt:        row.NgayTao,
        // joined
        assetCode:        row.MaQuanLy     ?? null,
        assetName:        row.TenTaiSan    ?? null,
        reporterName:     row.TenNguoiBao  ?? null,
        assignedName:     row.TenNguoiXuLy ?? null,
    };
}

/**
 * BienBanSuaChua → repairReport
 */
function mapRepairReport(row) {
    if (!row) return null;
    return {
        id:             row.MaBienBan,
        requestId:      row.MaYeuCau,
        technicianId:   row.MaKTV,
        damageDetail:   row.ChiTietHong,
        proposal:       row.DeXuat,
        estimatedCost:  row.ChiPhiUocTinh,
        image:          row.HinhAnh         ?? null,
        status:         REPORT_STATUS[row.TrangThai] ?? row.TrangThai,
        note:           row.GhiChu          ?? null,
        createdAt:      row.NgayLap,
        // joined
        technicianName: row.TenKTV          ?? null,
    };
}

/**
 * ThanhLy → liquidation
 */
function mapLiquidation(row) {
    if (!row) return null;
    return {
        id:             row.MaThanhLy,
        assetId:        row.MaTaiSan,
        requestId:      row.MaYeuCau        ?? null,
        reason:         row.LyDoThanhLy,
        status:         LIQUIDATION_STATUS[row.TrangThai] ?? row.TrangThai,
        receivedDate:   row.NgayNhapKho,
        liquidatedDate: row.NgayThanhLy     ?? null,
        salePrice:      row.GiaThanhLy,
        createdBy:      row.NguoiLap,
        approvedBy:     row.NguoiDuyet      ?? null,
        note:           row.GhiChu          ?? null,
        // joined
        assetCode:      row.MaQuanLy        ?? null,
        assetName:      row.TenTaiSan       ?? null,
    };
}

/**
 * HoaDonMua → invoice
 */
function mapInvoice(row) {
    if (!row) return null;
    return {
        id:          row.MaHoaDon,
        type:        row.LoaiPhieu,
        createdBy:   row.MaNguoiLap,
        supplierId:  row.MaNCC         ?? null,
        createdAt:   row.NgayLap,
        totalAmount: row.TongTien,
        status:      row.TrangThai,
        note:        row.GhiChu        ?? null,
        // joined
        supplierName: row.TenNCC       ?? null,
        creatorName:  row.TenNguoiLap  ?? null,
        // nested
        items: Array.isArray(row.ChiTiet)
            ? row.ChiTiet.map(mapInvoiceItem)
            : undefined,
    };
}

/**
 * ChiTietHoaDon → invoiceItem
 */
function mapInvoiceItem(row) {
    if (!row) return null;
    return {
        id:           row.MaChiTiet,
        invoiceId:    row.MaHoaDon,
        categoryId:   row.MaLoai,
        quantity:     row.SoLuong,
        unitPrice:    row.DonGia,
        totalPrice:   row.ThanhTien,
        // joined
        categoryName: row.TenLoai     ?? null,
    };
}

/**
 * ThongBao → notification
 */
function mapNotification(row) {
    if (!row) return null;
    return {
        id:         row.MaThongBao,
        eventType:  row.LoaiSuKien,
        targetId:   row.MaDoiTuong  ?? null,
        userId:     row.NguoiNhan,
        content:    row.NoiDung     ?? null,
        isRead:     row.DaDoc       === 1,
        createdAt:  row.NgayTao,
    };
}

// ─── Pagination wrapper ───────────────────────────────────────────────────────

/**
 * Wrap a list result with pagination metadata
 * @param {Array}  items   - already-mapped items
 * @param {number} total   - total count from DB
 * @param {number} page
 * @param {number} limit
 */
function paginatedResponse(items, total, page, limit) {
    return {
        items,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    mapUser,
    mapDepartment,
    mapDeviceCategory,
    mapSupplier,
    mapRoom,
    mapAsset,
    mapComponentLink,
    mapSupportRequest,
    mapRepairReport,
    mapLiquidation,
    mapInvoice,
    mapInvoiceItem,
    mapNotification,
    paginatedResponse,
    // status lookup tables (useful for FE reference endpoint)
    ASSET_STATUS,
    ASSET_STATUS_LABEL,
    SUPPORT_STATUS,
    REPORT_STATUS,
    LIQUIDATION_STATUS,
    ROLE_MAP,
};
