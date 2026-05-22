-- ============================================================
--  HỆ THỐNG QUẢN LÝ TÀI SẢN TRƯỜNG ĐẠI HỌC UTC
--  Phiên bản: 7.0 | Charset: utf8mb4
--  16 bảng + 4 views | Tiếng Việt


USE QLTaiSanUTC1;

-- ============================================================
-- 1. KHOA
-- ============================================================
CREATE TABLE Khoa (
    MaKhoa      INT          AUTO_INCREMENT PRIMARY KEY,
    TenKhoa     VARCHAR(150) NOT NULL,               -- Tên khoa
    KyHieu      VARCHAR(20)  NULL,                   -- Ký hiệu viết tắt
    MoTa        TEXT         NULL,                   -- Mô tả
    IsDeleted   TINYINT      NOT NULL DEFAULT 0,
    NgayTao     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
 
-- ============================================================
-- 2. PHÒNG
-- ============================================================
CREATE TABLE Phong (
    MaPhong     INT          AUTO_INCREMENT PRIMARY KEY,
    MaKhoa      INT          NULL,                   -- Thuộc khoa nào
    TenPhong    VARCHAR(100) NOT NULL,               -- Tên phòng
    TenToaNha   VARCHAR(100) NOT NULL,               -- Tòa nhà
    DiaChi      VARCHAR(300) NULL,                   -- Địa chỉ
    Tang        TINYINT      NOT NULL DEFAULT 1,     -- Tầng
    LoaiPhong   ENUM(
        'PhongHoc',     -- Phòng học lý thuyết
        'PhongMay',     -- Phòng máy tính
        'VanPhong',     -- Văn phòng
        'Kho',          -- Kho
        'Xuong'         -- Xưởng thực hành
    ) NOT NULL DEFAULT 'PhongMay',
    GhiChu      TEXT         NULL,
    IsDeleted   TINYINT      NOT NULL DEFAULT 0,
    NgayTao     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_phong_khoa FOREIGN KEY (MaKhoa) REFERENCES Khoa(MaKhoa)
) ENGINE=InnoDB;
 
CREATE INDEX idx_phong_khoa    ON Phong(MaKhoa);
CREATE INDEX idx_phong_deleted ON Phong(IsDeleted);
 
-- ============================================================
-- 3. NGƯỜI DÙNG
-- ============================================================
CREATE TABLE NguoiDung (
    MaNguoiDung         INT          AUTO_INCREMENT PRIMARY KEY,
    MaKhoa              INT          NULL,           -- Thuộc khoa nào
    TenDangNhap         VARCHAR(50)  NOT NULL UNIQUE,
    MatKhau             VARCHAR(255) NOT NULL,       -- Đã hash bcrypt
    HoTen               VARCHAR(150) NOT NULL,
    Email               VARCHAR(150) NULL,
    SoDienThoai         VARCHAR(20)  NULL,
    VaiTro              ENUM(
        'Admin',        -- Quản trị toàn hệ thống
        'BGH',          -- Ban giám hiệu duyệt kinh phí
        'KyThuat',      -- Kỹ thuật viên kiểm tra sửa chữa
        'GiaoVien'      -- Giảng viên báo hỏng
    ) NOT NULL DEFAULT 'GiaoVien',
    LanDangNhapCuoi     DATETIME     NULL,
    SoLanDangNhapSai    TINYINT      NOT NULL DEFAULT 0,
    DaDoiMatKhau        TINYINT      NOT NULL DEFAULT 0, -- 0:Chưa đổi → bắt đổi khi login  1:Đã đổi
    TrangThai           TINYINT      NOT NULL DEFAULT 1, -- 1:Hoạt động 0:Khóa
    IsDeleted           TINYINT      NOT NULL DEFAULT 0,
    NgayTao             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nguoidung_khoa FOREIGN KEY (MaKhoa) REFERENCES Khoa(MaKhoa)
) ENGINE=InnoDB;
 
CREATE INDEX idx_nguoidung_vaitro  ON NguoiDung(VaiTro);
CREATE INDEX idx_nguoidung_deleted ON NguoiDung(IsDeleted);
 
-- ============================================================
-- 4. LOẠI TÀI SẢN
--    MaLoaiCha NULL = loại gốc, có giá trị = loại con
-- ============================================================
CREATE TABLE LoaiTaiSan (
    MaLoai      INT          AUTO_INCREMENT PRIMARY KEY,
    MaLoaiCha   INT          NULL,                   -- NULL = loại cha
    TenLoai     VARCHAR(150) NOT NULL,               -- Tên loại
    KyHieu      VARCHAR(50)  NULL,                   -- Dùng sinh mã tài sản
    NhomLoai    ENUM(
        'ThietBiDienTu',    -- Màn hình, máy chiếu, TV
        'MayTinh',          -- Thùng máy, laptop
        'NgoaiViMayTinh',   -- Bàn phím, chuột, RAM, SSD
        'InAnQuet',         -- Máy in, máy scan
        'MangVienThong',    -- WiFi, switch, router
        'DieuHoaQuat',      -- Điều hòa, quạt
        'ChieuSang',        -- Đèn chiếu sáng
        'NoiThat',          -- Bàn ghế, tủ
        'ThietBiChuyen',    -- Thiết bị chuyên ngành
        'Khac'
    ) NOT NULL DEFAULT 'Khac',
    GhiChu      TEXT         NULL,
    ThuTu       INT          NOT NULL DEFAULT 1,     -- Thứ tự hiển thị
    IsDeleted   TINYINT      NOT NULL DEFAULT 0,
    NgayTao     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loai_cha FOREIGN KEY (MaLoaiCha) REFERENCES LoaiTaiSan(MaLoai)
) ENGINE=InnoDB;
 
CREATE INDEX idx_loai_cha     ON LoaiTaiSan(MaLoaiCha);
CREATE INDEX idx_loai_deleted ON LoaiTaiSan(IsDeleted);
 
-- ============================================================
-- 5. NHÀ CUNG CẤP
-- ============================================================
CREATE TABLE NhaCungCap (
    MaNCC           INT          AUTO_INCREMENT PRIMARY KEY,
    TenNCC          VARCHAR(200) NOT NULL,
    Email           VARCHAR(150) NULL,
    SoDienThoai     VARCHAR(20)  NULL,
    DiaChi          VARCHAR(500) NULL,
    ThongTinHoTro   TEXT         NULL,               -- Chính sách bảo hành
    TrangThai       TINYINT      NOT NULL DEFAULT 1,
    IsDeleted       TINYINT      NOT NULL DEFAULT 0,
    NgayTao         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
 
-- ============================================================
-- 6. HÓA ĐƠN MUA SẮM
-- ============================================================
CREATE TABLE HoaDonMua (
    MaHoaDon    INT           AUTO_INCREMENT PRIMARY KEY,
    LoaiPhieu   ENUM('YeuCau','DonHang','NhapHang') NOT NULL,
    MaNguoiLap  INT           NOT NULL,              -- Người lập phiếu
    MaNCC       INT           NULL,                  -- Nhà cung cấp
    NgayLap     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TongTien    DECIMAL(18,2) NOT NULL DEFAULT 0,
    TrangThai   TINYINT       NOT NULL DEFAULT 1,    -- 1:Chờ 2:Hoàn thành 9:Hủy
    GhiChu      TEXT          NULL,
    CONSTRAINT fk_hoadon_nguoilap FOREIGN KEY (MaNguoiLap) REFERENCES NguoiDung(MaNguoiDung),
    CONSTRAINT fk_hoadon_ncc      FOREIGN KEY (MaNCC)      REFERENCES NhaCungCap(MaNCC)
) ENGINE=InnoDB;
 
CREATE TABLE ChiTietHoaDon (
    MaChiTiet   INT           AUTO_INCREMENT PRIMARY KEY,
    MaHoaDon    INT           NOT NULL,
    MaLoai      INT           NOT NULL,              -- Loại tài sản
    SoLuong     INT           NOT NULL,
    DonGia      DECIMAL(18,2) NOT NULL DEFAULT 0,
    ThanhTien   DECIMAL(18,2) GENERATED ALWAYS AS (SoLuong * DonGia) STORED,
    CONSTRAINT fk_chitiet_hoadon FOREIGN KEY (MaHoaDon) REFERENCES HoaDonMua(MaHoaDon) ON DELETE CASCADE,
    CONSTRAINT fk_chitiet_loai   FOREIGN KEY (MaLoai)   REFERENCES LoaiTaiSan(MaLoai)
) ENGINE=InnoDB;
 
-- ============================================================
-- 7. TÀI SẢN  ← TRUNG TÂM HỆ THỐNG
-- ============================================================
CREATE TABLE TaiSan (
    MaTaiSan        INT           AUTO_INCREMENT PRIMARY KEY,
    MaQuanLy        VARCHAR(50)   NOT NULL UNIQUE,   -- CPU-00001, PRJ-00001
    TenTaiSan       VARCHAR(200)  NOT NULL,
    MaLoai          INT           NOT NULL,
    MaNCC           INT           NULL,
    MaPhong         INT           NULL,               -- NULL = đang trong kho
    MaNguoiSuDung   INT           NULL,               -- Người được giao dùng
    MaHoaDon        INT           NULL,               -- Hóa đơn nhập
    Gia             DECIMAL(18,2) NOT NULL DEFAULT 0,
    ThongSoKyThuat  JSON          NULL,               -- Cấu hình tự do theo loại
    HinhAnh         VARCHAR(500)  NULL,
    QRCode          VARCHAR(500)  NULL,               -- Quét → trang thông tin
    ThoiGianBaoHanh INT           NULL,               -- Đơn vị: tháng
    NgayNhap        DATE          NULL,
    NamSanXuat      YEAR          NULL,
    TrangThai       TINYINT       NOT NULL DEFAULT 1,
    -- 1:Đang dùng 2:Đang mượn 3:Hỏng 4:Đang sửa 5:Chờ thanh lý 0:Đã thanh lý
    IsDeleted       TINYINT       NOT NULL DEFAULT 0,
    NgayTao         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgaySua         DATETIME      NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_taisan_loai        FOREIGN KEY (MaLoai)         REFERENCES LoaiTaiSan(MaLoai),
    CONSTRAINT fk_taisan_ncc         FOREIGN KEY (MaNCC)          REFERENCES NhaCungCap(MaNCC),
    CONSTRAINT fk_taisan_phong       FOREIGN KEY (MaPhong)        REFERENCES Phong(MaPhong),
    CONSTRAINT fk_taisan_nguoisudung FOREIGN KEY (MaNguoiSuDung)  REFERENCES NguoiDung(MaNguoiDung),
    CONSTRAINT fk_taisan_hoadon      FOREIGN KEY (MaHoaDon)       REFERENCES HoaDonMua(MaHoaDon)
) ENGINE=InnoDB;
 
CREATE INDEX idx_taisan_phong     ON TaiSan(MaPhong);
CREATE INDEX idx_taisan_loai      ON TaiSan(MaLoai);
CREATE INDEX idx_taisan_trangthai ON TaiSan(TrangThai);
CREATE INDEX idx_taisan_deleted   ON TaiSan(IsDeleted);
 
-- ============================================================
-- 8. LINH KIỆN GẮN VÀO THIẾT BỊ
--    VD: RAM, SSD gắn vào Thùng máy
-- ============================================================
CREATE TABLE TaiSan_LinhKien (
    MaLienKet       INT     AUTO_INCREMENT PRIMARY KEY,
    MaTaiSanCha     INT     NOT NULL,                -- Thiết bị cha
    MaTaiSanCon     INT     NOT NULL,                -- Linh kiện con
    NgayGhep        DATE    NOT NULL,
    NgayThao        DATE    NULL,                    -- NULL = đang gắn
    NguoiGhep       INT     NULL,
    NguoiThao       INT     NULL,
    GhiChu          TEXT    NULL,
    IsDeleted       TINYINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_linhkien_cha   FOREIGN KEY (MaTaiSanCha) REFERENCES TaiSan(MaTaiSan),
    CONSTRAINT fk_linhkien_con   FOREIGN KEY (MaTaiSanCon) REFERENCES TaiSan(MaTaiSan),
    CONSTRAINT fk_linhkien_ghep  FOREIGN KEY (NguoiGhep)   REFERENCES NguoiDung(MaNguoiDung),
    CONSTRAINT fk_linhkien_thao  FOREIGN KEY (NguoiThao)   REFERENCES NguoiDung(MaNguoiDung)
) ENGINE=InnoDB;
 
-- ============================================================
-- 9. YÊU CẦU HỖ TRỢ / BÁO HỎNG
-- ============================================================
CREATE TABLE YeuCauHoTro (
    MaYeuCau    INT     AUTO_INCREMENT PRIMARY KEY,
    MaTaiSan    INT     NOT NULL,
    MaNguoiBao  INT     NOT NULL,                    -- Người báo hỏng
    LoaiYeuCau  ENUM(
        'BaoHong',          -- Báo thiết bị hỏng
        'YeuCauMuaMoi',     -- Yêu cầu mua mới
        'YeuCauMuon'        -- Yêu cầu mượn thiết bị
    ) NOT NULL DEFAULT 'BaoHong',
    MoTaLoi     TEXT    NOT NULL,                    -- Mô tả lỗi chi tiết
    HinhAnhLoi  VARCHAR(500) NULL,                   -- Ảnh chụp lỗi
    MucDo       TINYINT NOT NULL DEFAULT 1,          -- 1:Bình thường 2:Khẩn cấp
    TrangThai   TINYINT NOT NULL DEFAULT 1,
    -- 1:Chờ tiếp nhận
    -- 2:Đã phân công KTV
    -- 3:KTV đang kiểm tra
    -- 4:Chờ duyệt biên bản
    -- 5:Đã duyệt đang sửa/mua
    -- 6:Hoàn thành
    -- 9:Từ chối
    NguoiXuLy   INT     NULL,                        -- KTV được phân công
    NgayXuLy    DATETIME NULL,
    LyDoTuChoi  TEXT    NULL,
    NgayTao     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_yeucau_taisan    FOREIGN KEY (MaTaiSan)   REFERENCES TaiSan(MaTaiSan),
    CONSTRAINT fk_yeucau_nguoibao  FOREIGN KEY (MaNguoiBao) REFERENCES NguoiDung(MaNguoiDung),
    CONSTRAINT fk_yeucau_nguoixuly FOREIGN KEY (NguoiXuLy)  REFERENCES NguoiDung(MaNguoiDung)
) ENGINE=InnoDB;
 
CREATE INDEX idx_yeucau_taisan    ON YeuCauHoTro(MaTaiSan);
CREATE INDEX idx_yeucau_trangthai ON YeuCauHoTro(TrangThai);
CREATE INDEX idx_yeucau_ngaytao   ON YeuCauHoTro(NgayTao);
 
-- ============================================================
-- 10. BIÊN BẢN SỬA CHỮA (KTV lập sau khi kiểm tra)
-- ============================================================
CREATE TABLE BienBanSuaChua (
    MaBienBan       INT           AUTO_INCREMENT PRIMARY KEY,
    MaYeuCau        INT           NOT NULL,
    MaKTV           INT           NOT NULL,          -- KTV lập biên bản
    ChiTietHong     TEXT          NOT NULL,          -- Hỏng cái gì, hỏng như thế nào
    DeXuat          ENUM(
        'SuaChua',      -- Có thể sửa được
        'ThayMoi',      -- Cần thay thiết bị mới
        'ThanhLy'       -- Không sửa được, đề xuất thanh lý
    ) NOT NULL DEFAULT 'SuaChua',
    ChiPhiUocTinh   DECIMAL(18,2) NOT NULL DEFAULT 0,
    HinhAnh         VARCHAR(500)  NULL,
    TrangThai       TINYINT       NOT NULL DEFAULT 1,
    -- 1:Chờ duyệt  2:Đã duyệt  3:Từ chối
    GhiChu          TEXT          NULL,
    NgayLap         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bienban_yeucau FOREIGN KEY (MaYeuCau) REFERENCES YeuCauHoTro(MaYeuCau),
    CONSTRAINT fk_bienban_ktv    FOREIGN KEY (MaKTV)    REFERENCES NguoiDung(MaNguoiDung)
) ENGINE=InnoDB;
 
CREATE INDEX idx_bienban_yeucau    ON BienBanSuaChua(MaYeuCau);
CREATE INDEX idx_bienban_trangthai ON BienBanSuaChua(TrangThai);
 
-- ============================================================
-- 11. PHÊ DUYỆT KINH PHÍ (Admin / BGH duyệt)
-- ============================================================
CREATE TABLE PheDuyetKinhPhi (
    MaPheDuyet      INT           AUTO_INCREMENT PRIMARY KEY,
    MaBienBan       INT           NOT NULL,
    NguoiDuyet      INT           NOT NULL,
    VaiTroDuyet     ENUM('Admin','BGH') NOT NULL,
    QuyetDinh       ENUM('DongY','TuChoi') NOT NULL,
    KinhPhiDuyet    DECIMAL(18,2) NULL,              -- Số tiền được duyệt
    FileBienBan     VARCHAR(500)  NULL,              -- File scan chữ ký BGH
    GhiChu          TEXT          NULL,
    NgayDuyet       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pheduyet_bienban    FOREIGN KEY (MaBienBan)  REFERENCES BienBanSuaChua(MaBienBan),
    CONSTRAINT fk_pheduyet_nguoiduyet FOREIGN KEY (NguoiDuyet) REFERENCES NguoiDung(MaNguoiDung)
) ENGINE=InnoDB;
 
CREATE INDEX idx_pheduyet_bienban ON PheDuyetKinhPhi(MaBienBan);
 
-- ============================================================
-- 12. LỊCH SỬ SỬA CHỮA
-- ============================================================
CREATE TABLE LichSuSuaChua (
    MaSuaChua       INT           AUTO_INCREMENT PRIMARY KEY,
    MaTaiSan        INT           NOT NULL,
    MaYeuCau        INT           NULL,
    MaBienBan       INT           NULL,
    NgaySua         DATE          NOT NULL,
    ChiPhi          DECIMAL(18,2) NOT NULL DEFAULT 0,
    MoTa            TEXT          NULL,
    NguoiSuaChua    INT           NULL,
    KetQua          TINYINT       NOT NULL DEFAULT 1,
    -- 1:Đã sửa xong  2:Không sửa được  3:Cần thay thế
    NgayTao         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_suachua_taisan   FOREIGN KEY (MaTaiSan)     REFERENCES TaiSan(MaTaiSan),
    CONSTRAINT fk_suachua_yeucau   FOREIGN KEY (MaYeuCau)     REFERENCES YeuCauHoTro(MaYeuCau),
    CONSTRAINT fk_suachua_bienban  FOREIGN KEY (MaBienBan)    REFERENCES BienBanSuaChua(MaBienBan),
    CONSTRAINT fk_suachua_nguoi    FOREIGN KEY (NguoiSuaChua) REFERENCES NguoiDung(MaNguoiDung)
) ENGINE=InnoDB;
 
CREATE INDEX idx_suachua_taisan ON LichSuSuaChua(MaTaiSan);
 
-- ============================================================
-- 13. LỊCH SỬ THAY THẾ
--     Lưu vết: máy cũ (mã nào) → thay bằng máy mới (mã nào)
-- ============================================================
CREATE TABLE LichSuThayThe (
    MaThayThe       INT     AUTO_INCREMENT PRIMARY KEY,
    MaTaiSanCu      INT     NOT NULL,                -- Thiết bị cũ hỏng
    MaTaiSanMoi     INT     NOT NULL,                -- Thiết bị mới thay vào
    NgayThayThe     DATE    NOT NULL,
    LyDo            TEXT    NULL,
    NguoiThucHien   INT     NOT NULL,
    MaYeuCau        INT     NULL,
    GhiChu          TEXT    NULL,
    CONSTRAINT fk_thayte_cu      FOREIGN KEY (MaTaiSanCu)    REFERENCES TaiSan(MaTaiSan),
    CONSTRAINT fk_thayte_moi     FOREIGN KEY (MaTaiSanMoi)   REFERENCES TaiSan(MaTaiSan),
    CONSTRAINT fk_thayte_nguoi   FOREIGN KEY (NguoiThucHien) REFERENCES NguoiDung(MaNguoiDung),
    CONSTRAINT fk_thayte_yeucau  FOREIGN KEY (MaYeuCau)      REFERENCES YeuCauHoTro(MaYeuCau)
) ENGINE=InnoDB;
 
-- ============================================================
-- 14. THANH LÝ
--     Gộp KhoThanhLy + PhieuThanhLy thành 1 bảng
-- ============================================================
CREATE TABLE ThanhLy (
    MaThanhLy       INT           AUTO_INCREMENT PRIMARY KEY,
    MaTaiSan        INT           NOT NULL,
    MaYeuCau        INT           NULL,
    LyDoThanhLy     TEXT          NOT NULL,
    TrangThai       TINYINT       NOT NULL DEFAULT 1,
    -- 1:Chờ xử lý  2:Đã thanh lý  3:Đã hủy
    NgayNhapKho     DATE          NOT NULL,          -- Ngày đưa vào kho
    NgayThanhLy     DATE          NULL,              -- Ngày thanh lý thực tế
    GiaThanhLy      DECIMAL(18,2) NOT NULL DEFAULT 0,
    NguoiLap        INT           NOT NULL,
    NguoiDuyet      INT           NULL,
    GhiChu          TEXT          NULL,
    CONSTRAINT fk_thanhly_taisan     FOREIGN KEY (MaTaiSan)   REFERENCES TaiSan(MaTaiSan),
    CONSTRAINT fk_thanhly_yeucau     FOREIGN KEY (MaYeuCau)   REFERENCES YeuCauHoTro(MaYeuCau),
    CONSTRAINT fk_thanhly_nguoilap   FOREIGN KEY (NguoiLap)   REFERENCES NguoiDung(MaNguoiDung),
    CONSTRAINT fk_thanhly_nguoiduyet FOREIGN KEY (NguoiDuyet) REFERENCES NguoiDung(MaNguoiDung)
) ENGINE=InnoDB;
 
CREATE INDEX idx_thanhly_taisan    ON ThanhLy(MaTaiSan);
CREATE INDEX idx_thanhly_trangthai ON ThanhLy(TrangThai);
 
-- ============================================================
-- 15. THÔNG BÁO
-- ============================================================
CREATE TABLE ThongBao (
    MaThongBao  INT     AUTO_INCREMENT PRIMARY KEY,
    LoaiSuKien  VARCHAR(50) NOT NULL,
    -- 'YEUCAU_MOI'      Có yêu cầu mới
    -- 'YEUCAU_DUYET'    Yêu cầu được duyệt
    -- 'YEUCAU_TUCHOI'   Yêu cầu bị từ chối
    -- 'BIENBAN_MOI'     Có biên bản mới cần duyệt
    -- 'PHEDUYET_MOI'    Có phê duyệt kinh phí mới
    -- 'PHANCONG_MOI'    KTV được phân công việc mới
    MaDoiTuong  INT     NULL,                        -- MaYeuCau hoặc MaBienBan
    NguoiNhan   INT     NOT NULL,
    NoiDung     TEXT    NULL,
    DaDoc       TINYINT NOT NULL DEFAULT 0,
    NgayTao     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_thongbao_nguoinhan FOREIGN KEY (NguoiNhan) REFERENCES NguoiDung(MaNguoiDung)
) ENGINE=InnoDB;
 
CREATE INDEX idx_thongbao_nguoinhan ON ThongBao(NguoiNhan, DaDoc);
 
-- ============================================================
-- DỮ LIỆU MẪU
-- ============================================================
 
-- 1. KHOA
INSERT INTO Khoa (MaKhoa, TenKhoa, KyHieu, MoTa) VALUES
(1, 'Khoa Vận tải - Kinh tế',       'VTKT', 'Quản lý tòa nhà A2'),
(2, 'Khoa Điện - Điện tử',          'DDT',  'Quản lý tòa nhà A3'),
(3, 'Khoa Công nghệ Thông tin',     'CNTT', 'Quản lý tòa nhà A4'),
(4, 'Khoa Cơ khí',                  'CK',   'Quản lý tòa nhà A5'),
(5, 'Phòng Quản trị Thiết bị',      'QTTB', 'Quản lý toàn bộ tài sản trường');
 
-- 2. PHÒNG
INSERT INTO Phong (MaKhoa, TenPhong, TenToaNha, DiaChi, Tang, LoaiPhong, GhiChu) VALUES
-- Tòa A2 - Khoa VTKT
(1, 'Phòng 201',        'Nhà A2', 'Số 3 Cầu Giấy, Hà Nội', 2, 'PhongHoc', 'Phòng học lý thuyết Vận tải'),
(1, 'Phòng 202',        'Nhà A2', 'Số 3 Cầu Giấy, Hà Nội', 2, 'PhongHoc', 'Phòng học Kinh tế vận tải'),
(1, 'Văn phòng VTKT',   'Nhà A2', 'Số 3 Cầu Giấy, Hà Nội', 3, 'VanPhong', 'Văn phòng khoa VTKT'),
-- Tòa A3 - Khoa Điện - Điện tử
(2, 'Lab Điện tử 101',  'Nhà A3', 'Số 3 Cầu Giấy, Hà Nội', 1, 'PhongMay', 'Lab thực hành Điện tử'),
(2, 'Lab Điện CN 102',  'Nhà A3', 'Số 3 Cầu Giấy, Hà Nội', 1, 'PhongMay', 'Lab thực hành Điện công nghiệp'),
(2, 'Phòng 201',        'Nhà A3', 'Số 3 Cầu Giấy, Hà Nội', 2, 'PhongHoc', 'Phòng học lý thuyết Điện'),
(2, 'Văn phòng DDT',    'Nhà A3', 'Số 3 Cầu Giấy, Hà Nội', 3, 'VanPhong', 'Văn phòng khoa Điện - Điện tử'),
-- Tòa A4 - Khoa CNTT (nhiều phòng máy)
(3, 'Phòng máy 401',    'Nhà A4', 'Số 3 Cầu Giấy, Hà Nội', 4, 'PhongMay', 'Thực hành lập trình - 30 máy'),
(3, 'Phòng máy 402',    'Nhà A4', 'Số 3 Cầu Giấy, Hà Nội', 4, 'PhongMay', 'Thực hành mạng máy tính - 30 máy'),
(3, 'Phòng máy 403',    'Nhà A4', 'Số 3 Cầu Giấy, Hà Nội', 4, 'PhongMay', 'Thực hành CSDL - 25 máy'),
(3, 'Lab AI 501',       'Nhà A4', 'Số 3 Cầu Giấy, Hà Nội', 5, 'PhongMay', 'Lab AI và Machine Learning - 20 máy'),
(3, 'Phòng 502',        'Nhà A4', 'Số 3 Cầu Giấy, Hà Nội', 5, 'PhongHoc', 'Phòng học lý thuyết CNTT'),
(3, 'Văn phòng CNTT',   'Nhà A4', 'Số 3 Cầu Giấy, Hà Nội', 3, 'VanPhong', 'Văn phòng khoa CNTT'),
-- Tòa A5 - Khoa Cơ khí
(4, 'Xưởng CNC 101',    'Nhà A5', 'Số 3 Cầu Giấy, Hà Nội', 1, 'Xuong',    'Xưởng thực hành CNC'),
(4, 'Xưởng Hàn 102',    'Nhà A5', 'Số 3 Cầu Giấy, Hà Nội', 1, 'Xuong',    'Xưởng thực hành hàn'),
(4, 'Phòng 201',        'Nhà A5', 'Số 3 Cầu Giấy, Hà Nội', 2, 'PhongHoc', 'Phòng học lý thuyết Cơ khí'),
(4, 'Văn phòng CK',     'Nhà A5', 'Số 3 Cầu Giấy, Hà Nội', 2, 'VanPhong', 'Văn phòng khoa Cơ khí'),
-- Kho chung
(5, 'Kho thiết bị',     'Nhà A1', 'Số 3 Cầu Giấy, Hà Nội', 1, 'Kho',      'Kho dự trữ và thanh lý toàn trường');
 
-- 3. NGƯỜI DÙNG
-- Lưu ý: MatKhau = 'SEED_HASH' → chạy seed.js để tạo hash thật
-- Tên đăng nhập / Mật khẩu mặc định: adminutc / hashcode123
INSERT INTO NguoiDung (MaKhoa, TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, VaiTro) VALUES
(5, 'adminutc',   'SEED_HASH', 'Quản Trị Viên',              'admin@utc.edu.vn',    '0901000001', 'Admin'),
(5, 'bgh01',      'SEED_HASH', 'PGS.TS Trần Văn Hiệu Phó',  'bgh@utc.edu.vn',      '0901000002', 'BGH'),
(5, 'ktv_hung',   'SEED_HASH', 'Nguyễn Văn Hùng',            'ktv01@utc.edu.vn',    '0901000003', 'KyThuat'),
(5, 'ktv_tuan',   'SEED_HASH', 'Phạm Văn Tuấn',              'ktv02@utc.edu.vn',    '0901000004', 'KyThuat'),
(5, 'ktv_linh',   'SEED_HASH', 'Lê Thị Linh',                'ktv03@utc.edu.vn',    '0901000005', 'KyThuat'),
(1, 'gv_vtkt01',  'SEED_HASH', 'TS. Nguyễn Thị Hà',          'ha.nguyen@utc.edu.vn','0901000006', 'GiaoVien'),
(1, 'gv_vtkt02',  'SEED_HASH', 'ThS. Trần Minh Khoa',        'khoa.tran@utc.edu.vn','0901000007', 'GiaoVien'),
(2, 'gv_ddt01',   'SEED_HASH', 'PGS.TS Lê Văn Điện',        'dien.le@utc.edu.vn',  '0901000008', 'GiaoVien'),
(2, 'gv_ddt02',   'SEED_HASH', 'TS. Phạm Thị Điện Tử',      'dientu@utc.edu.vn',   '0901000009', 'GiaoVien'),
(3, 'gv_cntt01',  'SEED_HASH', 'TS. Nguyễn Văn Lập Trình',  'laptrình@utc.edu.vn', '0901000010', 'GiaoVien'),
(3, 'gv_cntt02',  'SEED_HASH', 'ThS. Trần Thị Mạng',        'mang.tt@utc.edu.vn',  '0901000011', 'GiaoVien'),
(3, 'gv_cntt03',  'SEED_HASH', 'TS. Lê Văn Trí Tuệ Nhân Tạo','ai.lv@utc.edu.vn',  '0901000012', 'GiaoVien'),
(4, 'gv_ck01',    'SEED_HASH', 'PGS.TS Hoàng Văn Cơ',       'co.hoang@utc.edu.vn', '0901000013', 'GiaoVien'),
(4, 'gv_ck02',    'SEED_HASH', 'TS. Vũ Thị Khí',             'khi.vu@utc.edu.vn',   '0901000014', 'GiaoVien');
 
-- 4. LOẠI TÀI SẢN
INSERT INTO LoaiTaiSan (MaLoai, MaLoaiCha, TenLoai, KyHieu, NhomLoai, ThuTu) VALUES
-- Loại cha
(1,  NULL, 'Thùng máy (CPU)',         'CPU',  'MayTinh',         1),
(2,  NULL, 'Màn hình máy tính',       'MMT',  'ThietBiDienTu',   2),
(3,  NULL, 'Bàn phím',                'BPM',  'NgoaiViMayTinh',  3),
(4,  NULL, 'Chuột máy tính',          'CM',   'NgoaiViMayTinh',  4),
(5,  NULL, 'Máy chiếu',               'MCC',  'ThietBiDienTu',   5),
(6,  NULL, 'Màn chiếu',               'MCH',  'ThietBiDienTu',   6),
(7,  NULL, 'Máy in',                  'MIN',  'InAnQuet',        7),
(8,  NULL, 'Bộ phát Wi-Fi',           'WIFI', 'MangVienThong',   8),
(9,  NULL, 'Switch mạng',             'SWT',  'MangVienThong',   9),
(10, NULL, 'Điều hòa nhiệt độ',       'DH',   'DieuHoaQuat',     10),
(11, NULL, 'Quạt trần',               'QT',   'DieuHoaQuat',     11),
(12, NULL, 'Bàn học/làm việc',        'BAN',  'NoiThat',         12),
(13, NULL, 'Ghế',                     'GHE',  'NoiThat',         13),
(14, NULL, 'Bảng trắng/đen',          'BNG',  'NoiThat',         14),
(15, NULL, 'Dao động ký (Oscilloscope)','OSC','ThietBiChuyen',   15),
(16, NULL, 'Máy phát sóng',           'MPS',  'ThietBiChuyen',   16),
(17, NULL, 'Bộ thực hành PLC',        'PLC',  'ThietBiChuyen',   17),
(18, NULL, 'Máy tiện CNC',            'CNC',  'ThietBiChuyen',   18),
(19, NULL, 'Máy hàn',                 'HAN',  'ThietBiChuyen',   19),
-- Loại con của Thùng máy (MaLoaiCha = 1)
(20, 1,    'RAM',                     'RAM',  'NgoaiViMayTinh',  20),
(21, 1,    'Ổ cứng SSD',              'SSD',  'NgoaiViMayTinh',  21),
(22, 1,    'Bộ nguồn (PSU)',           'PSU',  'NgoaiViMayTinh',  22),
(23, 1,    'Card đồ họa (GPU)',        'GPU',  'NgoaiViMayTinh',  23);
 
-- 5. NHÀ CUNG CẤP
INSERT INTO NhaCungCap (MaNCC, TenNCC, Email, SoDienThoai, DiaChi, ThongTinHoTro) VALUES
(1, 'Dell Technologies VN',  'support@dell.com.vn',      '1800 1111', 'Hà Nội',  'Bảo hành tại nhà 36 tháng'),
(2, 'LG Electronics VN',     'support@lg.com.vn',        '1800 2222', 'Hà Nội',  'Bảo hành tại cửa hàng'),
(3, 'Panasonic Vietnam',     'support@panasonic.vn',     '1800 3333', 'Hà Nội',  'Bảo hành theo hợp đồng'),
(4, 'Samsung Vietnam',       'support@samsung.vn',       '1800 5888', 'TP.HCM',  'Bảo hành chính hãng'),
(5, 'TP-Link Vietnam',       'support@tp-link.vn',       '1800 6688', 'Hà Nội',  'Bảo hành 24 tháng'),
(6, 'Canon Vietnam',         'support@canon.com.vn',     '1800 7799', 'Hà Nội',  'Bảo hành 12 tháng'),
(7, 'Thiết bị Khoa học ABC', 'info@thietbikhoahoc.vn',   '024 3333 4444','Hà Nội','Thiết bị chuyên ngành'),
(8, 'Nội thất Hòa Phát',    'hoaphat@hoaphat.vn',       '024 5555 6666','Hà Nội','Bảo hành 12 tháng'),
(9, 'Toshiba Vietnam',       'support@toshiba.vn',       '1800 8888', 'TP.HCM',  'Bảo hành 24 tháng');
 
-- 6. HÓA ĐƠN MUA SẮM
INSERT INTO HoaDonMua (MaHoaDon, LoaiPhieu, MaNguoiLap, MaNCC, TongTien, TrangThai, GhiChu) VALUES
(1, 'NhapHang', 1, 1, 450000000, 2, 'Nhập máy tính phòng 401-402-403 tòa A4'),
(2, 'NhapHang', 1, 1, 200000000, 2, 'Nhập máy tính Lab AI tòa A4'),
(3, 'NhapHang', 1, 3, 180000000, 2, 'Nhập máy chiếu và điều hòa toàn trường'),
(4, 'NhapHang', 1, 7, 120000000, 2, 'Nhập thiết bị thực hành Điện - Điện tử'),
(5, 'NhapHang', 1, 7,  90000000, 2, 'Nhập thiết bị CNC và hàn xưởng A5'),
(6, 'NhapHang', 1, 8,  60000000, 2, 'Nhập bàn ghế toàn trường'),
(7, 'NhapHang', 1, 6,  24000000, 2, 'Nhập máy in các khoa');
 
INSERT INTO ChiTietHoaDon (MaHoaDon, MaLoai, SoLuong, DonGia) VALUES
(1,  1, 30, 12000000), -- 30 thùng máy phòng 401-403
(1,  2, 30,  4500000), -- 30 màn hình
(1,  3, 30,    350000), -- 30 bàn phím
(1,  4, 30,    200000), -- 30 chuột
(2,  1, 20, 18000000), -- 20 thùng máy cao cấp Lab AI
(2,  2, 20,  6500000), -- 20 màn hình 4K
(3,  5,  8, 12000000), -- 8 máy chiếu
(3, 10, 12,  9500000), -- 12 điều hòa
(4, 15,  6,  8000000), -- 6 dao động ký
(4, 17,  4, 15000000), -- 4 bộ PLC
(5, 18,  2, 35000000), -- 2 máy tiện CNC
(5, 19,  4,  5000000), -- 4 máy hàn
(6, 12,120,    800000), -- 120 bàn học
(6, 13,150,    500000), -- 150 ghế
(7,  7,  6,  4000000); -- 6 máy in
 
-- 7. TÀI SẢN
INSERT INTO TaiSan (MaQuanLy,TenTaiSan,MaLoai,MaNCC,MaPhong,MaHoaDon,Gia,ThongSoKyThuat,QRCode,ThoiGianBaoHanh,NgayNhap,TrangThai) VALUES
-- ===== TÒA A4 - KHOA CNTT =====
-- Phòng máy 401 (MaPhong=8)
('CPU-00001','Thùng máy Dell OptiPlex 7010 #01',1,1,8,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00001',36,'2023-06-01',1),
('CPU-00002','Thùng máy Dell OptiPlex 7010 #02',1,1,8,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00002',36,'2023-06-01',1),
('CPU-00003','Thùng máy Dell OptiPlex 7010 #03',1,1,8,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00003',36,'2023-06-01',4),
('CPU-00004','Thùng máy Dell OptiPlex 7010 #04',1,1,8,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00004',36,'2023-06-01',1),
('CPU-00005','Thùng máy Dell OptiPlex 7010 #05',1,1,8,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00005',36,'2023-06-01',3),
('CPU-00006','Thùng máy Dell OptiPlex 7010 #06',1,1,8,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00006',36,'2023-06-01',1),
('MMT-00001','Màn hình Dell 24 inch FHD #01',2,1,8,1,4500000,'{"KichThuoc":"24 inch","DoPhanGiai":"1920x1080","TanSo":"75Hz"}','MMT-00001',24,'2023-06-01',1),
('MMT-00002','Màn hình Dell 24 inch FHD #02',2,1,8,1,4500000,'{"KichThuoc":"24 inch","DoPhanGiai":"1920x1080","TanSo":"75Hz"}','MMT-00002',24,'2023-06-01',1),
('MMT-00003','Màn hình Dell 24 inch FHD #03',2,1,8,1,4500000,'{"KichThuoc":"24 inch","DoPhanGiai":"1920x1080","TanSo":"75Hz"}','MMT-00003',24,'2023-06-01',1),
('BPM-00001','Bàn phím Dell KB216 #01',3,1,8,1,350000,'{"KetNoi":"USB","NgonNgu":"Tieng Viet"}','BPM-00001',12,'2023-06-01',1),
('BPM-00002','Bàn phím Dell KB216 #02',3,1,8,1,350000,'{"KetNoi":"USB","NgonNgu":"Tieng Viet"}','BPM-00002',12,'2023-06-01',1),
('CM-00001','Chuột Dell MS116 #01',4,1,8,1,200000,'{"KetNoi":"USB","DPI":"1000"}','CM-00001',12,'2023-06-01',1),
('CM-00002','Chuột Dell MS116 #02',4,1,8,1,200000,'{"KetNoi":"USB","DPI":"1000"}','CM-00002',12,'2023-06-01',1),
-- Phòng máy 402 (MaPhong=9)
('CPU-00101','Thùng máy Dell OptiPlex 7010 #101',1,1,9,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00101',36,'2023-06-01',1),
('CPU-00102','Thùng máy Dell OptiPlex 7010 #102',1,1,9,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00102',36,'2023-06-01',1),
('CPU-00103','Thùng máy Dell OptiPlex 7010 #103',1,1,9,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00103',36,'2023-06-01',3),
('MMT-00101','Màn hình Dell 24 inch FHD #101',2,1,9,1,4500000,'{"KichThuoc":"24 inch","DoPhanGiai":"1920x1080","TanSo":"75Hz"}','MMT-00101',24,'2023-06-01',1),
('MMT-00102','Màn hình Dell 24 inch FHD #102',2,1,9,1,4500000,'{"KichThuoc":"24 inch","DoPhanGiai":"1920x1080","TanSo":"75Hz"}','MMT-00102',24,'2023-06-01',1),
-- Phòng máy 403 (MaPhong=10)
('CPU-00201','Thùng máy Dell OptiPlex 7010 #201',1,1,10,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00201',36,'2023-08-01',1),
('CPU-00202','Thùng máy Dell OptiPlex 7010 #202',1,1,10,1,12000000,'{"CPU":"i5-12500","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11 Pro"}','CPU-00202',36,'2023-08-01',1),
('MMT-00201','Màn hình Dell 24 inch FHD #201',2,1,10,1,4500000,'{"KichThuoc":"24 inch","DoPhanGiai":"1920x1080","TanSo":"75Hz"}','MMT-00201',24,'2023-08-01',1),
-- Lab AI 501 (MaPhong=11) - máy cao cấp
('CPU-00301','Thùng máy Dell Precision 3660 #01',1,1,11,2,18000000,'{"CPU":"i7-13700","RAM":"32GB","SSD":"512GB","GPU":"RTX 3060","HeDieuHanh":"Windows 11 Pro"}','CPU-00301',36,'2024-01-01',1),
('CPU-00302','Thùng máy Dell Precision 3660 #02',1,1,11,2,18000000,'{"CPU":"i7-13700","RAM":"32GB","SSD":"512GB","GPU":"RTX 3060","HeDieuHanh":"Windows 11 Pro"}','CPU-00302',36,'2024-01-01',1),
('CPU-00303','Thùng máy Dell Precision 3660 #03',1,1,11,2,18000000,'{"CPU":"i7-13700","RAM":"32GB","SSD":"512GB","GPU":"RTX 3060","HeDieuHanh":"Windows 11 Pro"}','CPU-00303',36,'2024-01-01',1),
('MMT-00301','Màn hình Dell 27 inch 4K #01',2,1,11,2,6500000,'{"KichThuoc":"27 inch","DoPhanGiai":"4K UHD","TanSo":"60Hz"}','MMT-00301',24,'2024-01-01',1),
('MMT-00302','Màn hình Dell 27 inch 4K #02',2,1,11,2,6500000,'{"KichThuoc":"27 inch","DoPhanGiai":"4K UHD","TanSo":"60Hz"}','MMT-00302',24,'2024-01-01',1),
-- Máy chiếu tòa A4
('MCC-00401','Máy chiếu Panasonic PT-VMZ40 (P401)',5,3,8,3,12000000,'{"DoSang":"4000 lumens","DoPhanGiai":"WUXGA","KetNoi":"HDMI,VGA"}','MCC-00401',24,'2022-09-01',1),
('MCC-00402','Máy chiếu Panasonic PT-VMZ40 (P402)',5,3,9,3,12000000,'{"DoSang":"4000 lumens","DoPhanGiai":"WUXGA","KetNoi":"HDMI,VGA"}','MCC-00402',24,'2022-09-01',1),
('MCC-00403','Máy chiếu Panasonic PT-VMZ40 (P403)',5,3,10,3,12000000,'{"DoSang":"4000 lumens","DoPhanGiai":"WUXGA","KetNoi":"HDMI,VGA"}','MCC-00403',24,'2023-01-01',1),
('MCC-00404','Máy chiếu Panasonic PT-VMZ40 (AI)',5,3,11,3,12000000,'{"DoSang":"4000 lumens","DoPhanGiai":"WUXGA","KetNoi":"HDMI,VGA"}','MCC-00404',24,'2024-01-01',1),
('MCC-00000','Máy chiếu LG HU70LA (hỏng - chờ thanh lý)',5,2,NULL,NULL,0,'{"GhiChu":"Hong bong den, cho thanh ly"}','MCC-00000',0,'2018-03-01',5),
-- Điều hòa tòa A4
('DH-00401','Điều hòa Panasonic 18000BTU (P401)',10,3,8,3,9500000,'{"CongSuat":"18000 BTU","Loai":"Treo tuong","Inverter":"Co"}','DH-00401',36,'2022-05-01',1),
('DH-00402','Điều hòa Panasonic 18000BTU (P402)',10,3,9,3,9500000,'{"CongSuat":"18000 BTU","Loai":"Treo tuong","Inverter":"Co"}','DH-00402',36,'2022-05-01',1),
('DH-00403','Điều hòa Panasonic 18000BTU (P403)',10,3,10,3,9500000,'{"CongSuat":"18000 BTU","Loai":"Treo tuong","Inverter":"Co"}','DH-00403',36,'2022-05-01',1),
('DH-00404','Điều hòa Panasonic 18000BTU (AI)',10,3,11,3,9500000,'{"CongSuat":"18000 BTU","Loai":"Treo tuong","Inverter":"Co"}','DH-00404',36,'2024-01-01',1),
-- Mạng tòa A4
('SWT-00401','Switch TP-Link TL-SG108 (P401)',9,5,8,NULL,1200000,'{"SoCong":"8","TocDo":"Gigabit"}','SWT-00401',24,'2023-06-01',1),
('WIFI-00401','Bộ phát Wi-Fi TP-Link Archer AX55',8,5,8,NULL,900000,'{"BangTan":"Dual Band","TocDo":"3000Mbps"}','WIFI-00401',24,'2023-06-01',1),
-- Máy in tòa A4
('MIN-00401','Máy in Canon LBP6030 (VP CNTT)',7,6,13,7,4000000,'{"KieuIn":"Laser","KhoGiay":"A4"}','MIN-00401',12,'2023-09-01',1),
 
-- ===== TÒA A2 - KHOA VTKT =====
('MCC-00201','Máy chiếu Toshiba TDP-T45 (P201-VTKT)',5,9,1,3,8000000,'{"DoSang":"3000 lumens","DoPhanGiai":"XGA","KetNoi":"VGA,HDMI"}','MCC-00201',24,'2021-08-01',1),
('DH-00201','Điều hòa Panasonic 12000BTU (P201-VTKT)',10,3,1,3,7500000,'{"CongSuat":"12000 BTU","Loai":"Treo tuong"}','DH-00201',36,'2021-08-01',1),
('BAN-00201','Bàn giảng viên P201-VTKT',12,8,1,6,800000,'{"KichThuoc":"160x80cm","ChatLieu":"Go cong nghiep"}','BAN-00201',NULL,'2020-01-01',1),
('BNG-00201','Bảng trắng P201-VTKT',14,8,1,6,1200000,'{"KichThuoc":"3x1.2m","Loai":"Bang trang tu"}','BNG-00201',NULL,'2020-01-01',1),
('MCC-00202','Máy chiếu Toshiba TDP-T45 (P202-VTKT)',5,9,2,3,8000000,'{"DoSang":"3000 lumens","DoPhanGiai":"XGA","KetNoi":"VGA,HDMI"}','MCC-00202',24,'2021-08-01',1),
('DH-00202','Điều hòa Panasonic 12000BTU (P202-VTKT)',10,3,2,3,7500000,'{"CongSuat":"12000 BTU","Loai":"Treo tuong"}','DH-00202',36,'2021-08-01',3),
('CPU-00801','Máy tính văn phòng VTKT #01',1,1,3,1,8000000,'{"CPU":"i3-12100","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11"}','CPU-00801',36,'2023-01-01',1),
('MIN-00201','Máy in Canon LBP2900 (VTKT)',7,6,3,7,3500000,'{"KieuIn":"Laser","KhoGiay":"A4"}','MIN-00201',12,'2023-01-01',1),
 
-- ===== TÒA A3 - KHOA ĐIỆN - ĐIỆN TỬ =====
-- Lab Điện tử 101 (MaPhong=4)
('OSC-00101','Dao động ký Tektronix TBS1102 #01',15,7,4,4,8000000,'{"BangTan":"100MHz","SoKenh":"2","ManHinh":"7 inch"}','OSC-00101',24,'2022-03-01',1),
('OSC-00102','Dao động ký Tektronix TBS1102 #02',15,7,4,4,8000000,'{"BangTan":"100MHz","SoKenh":"2","ManHinh":"7 inch"}','OSC-00102',24,'2022-03-01',1),
('OSC-00103','Dao động ký Tektronix TBS1102 #03',15,7,4,4,8000000,'{"BangTan":"100MHz","SoKenh":"2","ManHinh":"7 inch"}','OSC-00103',24,'2022-03-01',3),
('MPS-00101','Máy phát sóng GW Instek #01',16,7,4,4,5000000,'{"TanSo":"0.1Hz-5MHz","DangSong":"Sin,Vuong,Tam giac"}','MPS-00101',24,'2022-03-01',1),
('MPS-00102','Máy phát sóng GW Instek #02',16,7,4,4,5000000,'{"TanSo":"0.1Hz-5MHz","DangSong":"Sin,Vuong,Tam giac"}','MPS-00102',24,'2022-03-01',1),
('DH-00101','Điều hòa Panasonic 12000BTU (Lab DDT)',10,3,4,3,7500000,'{"CongSuat":"12000 BTU","Loai":"Treo tuong"}','DH-00101',36,'2022-03-01',1),
-- Lab Điện CN 102 (MaPhong=5)
('PLC-00101','Bộ thực hành PLC Siemens S7-1200 #01',17,7,5,4,15000000,'{"CPU":"S7-1200","IO":"14DI/10DO","ManHinh":"KTP700"}','PLC-00101',24,'2022-06-01',1),
('PLC-00102','Bộ thực hành PLC Siemens S7-1200 #02',17,7,5,4,15000000,'{"CPU":"S7-1200","IO":"14DI/10DO","ManHinh":"KTP700"}','PLC-00102',24,'2022-06-01',1),
('PLC-00103','Bộ thực hành PLC Siemens S7-1200 #03',17,7,5,4,15000000,'{"CPU":"S7-1200","IO":"14DI/10DO","ManHinh":"KTP700"}','PLC-00103',24,'2022-06-01',4),
('DH-00102','Điều hòa Panasonic 18000BTU (Lab CN)',10,3,5,3,9500000,'{"CongSuat":"18000 BTU","Loai":"Treo tuong"}','DH-00102',36,'2022-06-01',1),
-- Phòng học 201 DDT (MaPhong=6)
('MCC-00301','Máy chiếu Panasonic PT-LB383 (P201-DDT)',5,3,6,3,10000000,'{"DoSang":"3300 lumens","DoPhanGiai":"XGA","KetNoi":"HDMI,VGA"}','MCC-00301',24,'2022-09-01',1),
('DH-00103','Điều hòa Panasonic 12000BTU (P201-DDT)',10,3,6,3,7500000,'{"CongSuat":"12000 BTU","Loai":"Treo tuong"}','DH-00103',36,'2022-09-01',1),
('CPU-00901','Máy tính văn phòng DDT #01',1,1,7,1,8000000,'{"CPU":"i3-12100","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11"}','CPU-00901',36,'2023-01-01',1),
('MIN-00301','Máy in Canon LBP2900 (DDT)',7,6,7,7,3500000,'{"KieuIn":"Laser","KhoGiay":"A4"}','MIN-00301',12,'2023-01-01',1),
 
-- ===== TÒA A5 - KHOA CƠ KHÍ =====
-- Xưởng CNC (MaPhong=14)
('CNC-00101','Máy tiện CNC Fanuc #01',18,7,14,5,35000000,'{"HangSanXuat":"Fanuc","Model":"0i-MF","SoTruc":"3 truc"}','CNC-00101',24,'2021-05-01',1),
('CNC-00102','Máy tiện CNC Fanuc #02',18,7,14,5,35000000,'{"HangSanXuat":"Fanuc","Model":"0i-MF","SoTruc":"3 truc"}','CNC-00102',24,'2021-05-01',4),
('DH-00501','Điều hòa Panasonic 24000BTU (CNC)',10,3,14,3,12000000,'{"CongSuat":"24000 BTU","Loai":"Treo tuong","Inverter":"Co"}','DH-00501',36,'2021-05-01',1),
-- Xưởng Hàn (MaPhong=15)
('HAN-00101','Máy hàn MIG Lincoln Electric #01',19,7,15,5,5000000,'{"CongSuat":"200A","LoaiHan":"MIG/MAG","DienAp":"220V"}','HAN-00101',24,'2021-05-01',1),
('HAN-00102','Máy hàn MIG Lincoln Electric #02',19,7,15,5,5000000,'{"CongSuat":"200A","LoaiHan":"MIG/MAG","DienAp":"220V"}','HAN-00102',24,'2021-05-01',1),
('HAN-00103','Máy hàn MIG Lincoln Electric #03',19,7,15,5,5000000,'{"CongSuat":"200A","LoaiHan":"MIG/MAG","DienAp":"220V"}','HAN-00103',24,'2021-05-01',3),
('HAN-00104','Máy hàn TIG Miller #01',19,7,15,5,6000000,'{"CongSuat":"250A","LoaiHan":"TIG","DienAp":"220V"}','HAN-00104',24,'2022-01-01',1),
-- Phòng học CK (MaPhong=16)
('MCC-00501','Máy chiếu Toshiba TDP-T45 (P201-CK)',5,9,16,3,8000000,'{"DoSang":"3000 lumens","DoPhanGiai":"XGA","KetNoi":"VGA,HDMI"}','MCC-00501',24,'2021-08-01',1),
('DH-00502','Điều hòa Panasonic 12000BTU (P201-CK)',10,3,16,3,7500000,'{"CongSuat":"12000 BTU","Loai":"Treo tuong"}','DH-00502',36,'2021-08-01',1),
('CPU-01001','Máy tính văn phòng CK #01',1,1,17,1,8000000,'{"CPU":"i3-12100","RAM":"8GB","SSD":"256GB","HeDieuHanh":"Windows 11"}','CPU-01001',36,'2023-01-01',1),
('MIN-00501','Máy in Canon LBP6030 (CK)',7,6,17,7,4000000,'{"KieuIn":"Laser","KhoGiay":"A4"}','MIN-00501',12,'2023-01-01',1),
-- Linh kiện dự phòng (Kho - MaPhong=18)
('RAM-00001','RAM Kingston DDR4 16GB (dự phòng)',20,1,18,NULL,1200000,'{"DungLuong":"16GB","Loai":"DDR4","TocDo":"3200MHz"}','RAM-00001',12,'2023-01-01',1),
('SSD-00001','Ổ cứng Samsung SSD 512GB (dự phòng)',21,4,18,NULL,1800000,'{"DungLuong":"512GB","Chuan":"NVMe M.2"}','SSD-00001',36,'2023-01-01',1),
('RAM-00002','RAM Kingston DDR4 32GB (Lab AI dự phòng)',20,1,18,NULL,2500000,'{"DungLuong":"32GB","Loai":"DDR4","TocDo":"3200MHz"}','RAM-00002',12,'2024-01-01',1);
 
-- 8. LINH KIỆN GẮN VÀO THIẾT BỊ
INSERT INTO TaiSan_LinhKien (MaTaiSanCha, MaTaiSanCon, NgayGhep, NguoiGhep, GhiChu) VALUES
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='CPU-00001'),
 (SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='RAM-00001'),
 '2023-06-01', 3, 'Nâng cấp RAM từ 8GB lên 16GB'),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='CPU-00301'),
 (SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='RAM-00002'),
 '2024-01-01', 3, 'Lab AI cần RAM lớn cho machine learning');
 
-- 9. YÊU CẦU HỖ TRỢ
INSERT INTO YeuCauHoTro (MaTaiSan,MaNguoiBao,LoaiYeuCau,MoTaLoi,MucDo,TrangThai,NguoiXuLy,NgayXuLy) VALUES
-- Đã hoàn thành
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='CPU-00003'),10,'BaoHong','Máy tính không lên nguồn, có mùi khét. Phòng máy 401.',2,6,3,'2024-11-04 10:00:00'),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='MCC-00000'),11,'BaoHong','Máy chiếu LG hỏng bóng đèn, không chiếu được.',2,6,3,'2023-01-10 09:00:00'),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='OSC-00103'),8,'BaoHong','Dao động ký #03 màn hình tắt đột ngột khi đang đo.',1,6,4,'2024-08-15 09:00:00'),
-- Đang xử lý
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='CPU-00005'),10,'BaoHong','Máy tính #05 phòng 401 bị treo liên tục, khởi động lại nhiều lần.',1,4,3,'2025-01-15 08:00:00'),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='DH-00202'),6,'BaoHong','Điều hòa phòng 202 tòa A2 chảy nước, không lạnh.',2,3,3,'2025-01-20 09:00:00'),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='PLC-00103'),9,'BaoHong','Bộ PLC #03 lỗi module output, đèn báo lỗi sáng đỏ.',2,5,4,'2025-01-18 10:00:00'),
-- Chờ tiếp nhận (mới)
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='CNC-00102'),13,'BaoHong','Máy tiện CNC #02 báo lỗi E001, không chạy được chương trình.',2,1,NULL,NULL),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='MMT-00003'),10,'BaoHong','Màn hình #03 phòng 401 bị sọc ngang, hiển thị không rõ.',1,2,3,'2025-02-01 08:00:00'),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='HAN-00103'),14,'BaoHong','Máy hàn #03 không bật được hồ quang, kiểm tra không có điện ra.',1,1,NULL,NULL);
 
-- 10. BIÊN BẢN SỬA CHỮA
INSERT INTO BienBanSuaChua (MaYeuCau,MaKTV,ChiTietHong,DeXuat,ChiPhiUocTinh,TrangThai,GhiChu) VALUES
(1,3,'Bo mạch chủ bị cháy tụ điện, RAM DDR4 8GB bị lỗi. Nguồn điện OK.','SuaChua',1550000,2,'Đã sửa xong ngày 05/11/2024'),
(2,3,'Bóng đèn máy chiếu hỏng hoàn toàn, chi phí thay bóng cao hơn mua máy mới.','ThayMoi',12000000,2,'Đề xuất mua máy chiếu Panasonic thay thế'),
(3,4,'Màn hình dao động ký bị lỗi IC điều khiển, có thể thay thế IC.','SuaChua',2500000,2,'Đặt linh kiện từ nước ngoài 2 tuần'),
(4,3,'CPU bị lỗi khe cắm RAM, thử RAM khác vẫn lỗi. Cần thay bo mạch chủ.','SuaChua',3500000,1,'Đang chờ duyệt kinh phí'),
(6,4,'Module output Q0.0-Q0.7 bị cháy, cần thay module mới Siemens SM1222.','ThayMoi',8500000,2,'Đã duyệt, đang đặt hàng');
 
-- 11. PHÊ DUYỆT KINH PHÍ
INSERT INTO PheDuyetKinhPhi (MaBienBan,NguoiDuyet,VaiTroDuyet,QuyetDinh,KinhPhiDuyet,GhiChu) VALUES
(1,1,'Admin','DongY',1550000,'Duyệt sửa chữa CPU-00003 phòng máy 401'),
(2,2,'BGH',  'DongY',12000000,'Duyệt mua máy chiếu mới, thiết bị quan trọng'),
(3,1,'Admin','DongY',2500000,'Duyệt sửa dao động ký Lab DDT'),
(5,1,'Admin','DongY',8500000,'Duyệt thay module PLC Siemens');
 
-- 12. LỊCH SỬ SỬA CHỮA
INSERT INTO LichSuSuaChua (MaTaiSan,MaYeuCau,MaBienBan,NgaySua,ChiPhi,MoTa,NguoiSuaChua,KetQua) VALUES
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='CPU-00003'),1,1,'2024-11-04', 350000,'Thay tụ điện bo mạch chủ.',3,1),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='CPU-00003'),1,1,'2024-11-05',1200000,'Thay RAM DDR4 8GB mới.',3,1),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='MCC-00000'),2,2,'2023-01-05',0,'Bóng đèn hỏng hoàn toàn, không sửa được.',3,2),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='OSC-00103'),3,3,'2024-09-01',2500000,'Thay IC điều khiển màn hình, máy hoạt động tốt.',4,1),
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='PLC-00103'),6,5,'2025-02-01',8500000,'Thay module SM1222 mới, test OK.',4,1);
 
-- 13. LỊCH SỬ THAY THẾ
INSERT INTO LichSuThayThe (MaTaiSanCu,MaTaiSanMoi,NgayThayThe,LyDo,NguoiThucHien,MaYeuCau) VALUES
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='MCC-00000'),
 (SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='MCC-00401'),
 '2022-09-01',
 'Máy chiếu LG HU70LA hỏng bóng đèn, chi phí thay thế cao hơn mua máy mới. Thay bằng Panasonic PT-VMZ40.',
 1,2);
 
-- Cập nhật trạng thái máy chiếu cũ đã thanh lý
UPDATE TaiSan SET TrangThai = 0 WHERE MaQuanLy = 'MCC-00000';
 
-- 14. THANH LÝ
INSERT INTO ThanhLy (MaTaiSan,MaYeuCau,LyDoThanhLy,TrangThai,NgayNhapKho,NgayThanhLy,GiaThanhLy,NguoiLap,NguoiDuyet,GhiChu) VALUES
((SELECT MaTaiSan FROM TaiSan WHERE MaQuanLy='MCC-00000'),
 2,
 'Máy chiếu LG HU70LA: bóng đèn hỏng, chi phí thay 12tr > giá máy chiếu mới 8tr. Không hiệu quả kinh tế.',
 2,'2023-02-01','2023-03-01',500000,1,1,
 'Đã thanh lý, thu hồi 500.000đ');
 
-- 15. THÔNG BÁO
INSERT INTO ThongBao (LoaiSuKien,MaDoiTuong,NguoiNhan,NoiDung) VALUES
('YEUCAU_MOI',   7, 1, 'Yêu cầu mới #7: Máy tiện CNC #02 xưởng A5 báo lỗi E001.'),
('YEUCAU_MOI',   9, 1, 'Yêu cầu mới #9: Máy hàn #03 xưởng Hàn A5 không bật được.'),
('YEUCAU_MOI',   8, 1, 'Yêu cầu mới #8: Màn hình #03 phòng 401 A4 bị sọc ngang.'),
('BIENBAN_MOI',  4, 1, 'Biên bản #4 chờ duyệt: CPU-00005 phòng 401 cần thay bo mạch chủ.'),
('PHANCONG_MOI', 7, 3, 'Bạn được phân công kiểm tra: Máy tiện CNC #02 xưởng A5.'),
('PHANCONG_MOI', 9, 3, 'Bạn được phân công kiểm tra: Máy hàn #03 xưởng Hàn A5.'),
('PHEDUYET_MOI', 2, 3, 'Biên bản #2 đã được BGH duyệt 12.000.000đ - Mua máy chiếu mới.'),
('PHEDUYET_MOI', 5, 4, 'Biên bản #5 đã được Admin duyệt 8.500.000đ - Thay module PLC.');
 
-- ============================================================
-- VIEWS
-- ============================================================
 
-- Dashboard tổng quan
CREATE OR REPLACE VIEW v_Dashboard AS
SELECT
    (SELECT COUNT(*) FROM TaiSan WHERE IsDeleted=0)                          AS TongThietBi,
    (SELECT COUNT(*) FROM TaiSan WHERE TrangThai=1 AND IsDeleted=0)          AS DangHoatDong,
    (SELECT COUNT(*) FROM TaiSan WHERE TrangThai=3 AND IsDeleted=0)          AS DangHong,
    (SELECT COUNT(*) FROM TaiSan WHERE TrangThai=4 AND IsDeleted=0)          AS DangSuaChua,
    (SELECT COUNT(*) FROM TaiSan WHERE TrangThai=5 AND IsDeleted=0)          AS ChoThanhLy,
    (SELECT COUNT(*) FROM YeuCauHoTro WHERE TrangThai=1)                     AS YeuCauMoi,
    (SELECT COUNT(*) FROM YeuCauHoTro WHERE TrangThai IN(2,3))               AS YeuCauDangXuLy,
    (SELECT COUNT(*) FROM BienBanSuaChua WHERE TrangThai=1)                  AS BienBanChoDuyet,
    (SELECT COUNT(*) FROM ThanhLy WHERE TrangThai=1)                         AS ChoThanhLyKho;
 
-- Danh sách tài sản đầy đủ
CREATE OR REPLACE VIEW v_DanhSachTaiSan AS
SELECT
    ts.MaTaiSan,
    ts.MaQuanLy,
    ts.TenTaiSan,
    lt.TenLoai          AS LoaiTaiSan,
    lt.NhomLoai,
    ts.Gia,
    p.TenPhong          AS Phong,
    p.TenToaNha         AS ToaNha,
    k.TenKhoa           AS Khoa,
    ncc.TenNCC          AS NhaCungCap,
    nd.HoTen            AS NguoiSuDung,
    ts.ThongSoKyThuat,
    ts.QRCode,
    ts.NgayNhap,
    ts.ThoiGianBaoHanh,
    CASE ts.TrangThai
        WHEN 1 THEN 'Đang dùng'
        WHEN 2 THEN 'Đang mượn'
        WHEN 3 THEN 'Hỏng'
        WHEN 4 THEN 'Đang sửa'
        WHEN 5 THEN 'Chờ thanh lý'
        WHEN 0 THEN 'Đã thanh lý'
    END                 AS TrangThai,
    ts.TrangThai        AS MaTrangThai
FROM TaiSan ts
JOIN  LoaiTaiSan lt    ON ts.MaLoai        = lt.MaLoai
LEFT JOIN Phong p      ON ts.MaPhong       = p.MaPhong
LEFT JOIN Khoa k       ON p.MaKhoa         = k.MaKhoa
LEFT JOIN NguoiDung nd ON ts.MaNguoiSuDung = nd.MaNguoiDung
LEFT JOIN NhaCungCap ncc ON ts.MaNCC       = ncc.MaNCC
WHERE ts.IsDeleted = 0;
 
-- Tài sản theo phòng và khoa
CREATE OR REPLACE VIEW v_TaiSanTheoPhong AS
SELECT
    k.TenKhoa,
    p.MaPhong,
    p.TenPhong,
    p.TenToaNha,
    p.Tang,
    p.LoaiPhong,
    ts.MaTaiSan,
    ts.MaQuanLy,
    ts.TenTaiSan,
    lt.TenLoai          AS LoaiTaiSan,
    CASE ts.TrangThai
        WHEN 1 THEN 'Đang dùng'
        WHEN 3 THEN 'Hỏng'
        WHEN 4 THEN 'Đang sửa'
        WHEN 5 THEN 'Chờ thanh lý'
    END                 AS TrangThai,
    ts.QRCode
FROM Phong p
JOIN  Khoa k           ON p.MaKhoa   = k.MaKhoa
JOIN  TaiSan ts        ON ts.MaPhong = p.MaPhong AND ts.IsDeleted=0
JOIN  LoaiTaiSan lt    ON ts.MaLoai  = lt.MaLoai
WHERE p.IsDeleted = 0;
 
-- Thống kê theo loại tài sản
CREATE OR REPLACE VIEW v_ThongKeLoai AS
SELECT
    lt.MaLoai,
    lt.TenLoai,
    lt.KyHieu,
    lt.NhomLoai,
    COUNT(ts.MaTaiSan)      AS TongSo,
    SUM(ts.TrangThai=1)     AS DangDung,
    SUM(ts.TrangThai=3)     AS Hong,
    SUM(ts.TrangThai=4)     AS DangSua,
    SUM(ts.TrangThai=5)     AS ChoThanhLy
FROM LoaiTaiSan lt
LEFT JOIN TaiSan ts ON ts.MaLoai=lt.MaLoai AND ts.IsDeleted=0
WHERE lt.IsDeleted=0 AND lt.MaLoaiCha IS NULL
GROUP BY lt.MaLoai, lt.TenLoai, lt.KyHieu, lt.NhomLoai
ORDER BY lt.ThuTu;
 
-- ============================================================
-- KIỂM TRA DỮ LIỆU
-- ============================================================
SELECT '===== TỔNG KẾT DỮ LIỆU MẪU =====' AS '';
SELECT CONCAT('Khoa          : ', COUNT(*)) AS '' FROM Khoa;
SELECT CONCAT('Phong         : ', COUNT(*)) AS '' FROM Phong;
SELECT CONCAT('NguoiDung     : ', COUNT(*)) AS '' FROM NguoiDung;
SELECT CONCAT('LoaiTaiSan    : ', COUNT(*)) AS '' FROM LoaiTaiSan;
SELECT CONCAT('NhaCungCap    : ', COUNT(*)) AS '' FROM NhaCungCap;
SELECT CONCAT('TaiSan        : ', COUNT(*)) AS '' FROM TaiSan;
SELECT CONCAT('YeuCauHoTro   : ', COUNT(*)) AS '' FROM YeuCauHoTro;
SELECT CONCAT('BienBanSuaChua: ', COUNT(*)) AS '' FROM BienBanSuaChua;
SELECT CONCAT('PheDuyet      : ', COUNT(*)) AS '' FROM PheDuyetKinhPhi;
 
SELECT '===== TÀI SẢN THEO KHOA =====' AS '';
SELECT k.TenKhoa, COUNT(ts.MaTaiSan) AS SoTaiSan
FROM Khoa k
LEFT JOIN Phong p   ON p.MaKhoa  = k.MaKhoa
LEFT JOIN TaiSan ts ON ts.MaPhong = p.MaPhong AND ts.IsDeleted=0
GROUP BY k.MaKhoa, k.TenKhoa;
 
SELECT '===== TRẠNG THÁI TÀI SẢN =====' AS '';
SELECT
    SUM(TrangThai=1) AS DangDung,
    SUM(TrangThai=3) AS Hong,
    SUM(TrangThai=4) AS DangSua,
    SUM(TrangThai=5) AS ChoThanhLy,
    SUM(TrangThai=0) AS DaThanhLy
FROM TaiSan WHERE IsDeleted=0;