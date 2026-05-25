const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'QLTaiSanUTC_Secret_2024';

/**
 * Middleware xác thực JWT token
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Không có token xác thực' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { MaNguoiDung, TenDangNhap, VaiTro, ... }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

/**
 * Middleware chỉ cho phép Admin
 */
const adminOnly = (req, res, next) => {
    if (req.user?.VaiTro !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Chỉ Admin mới được phép thực hiện thao tác này' });
    }
    next();
};

/**
 * Middleware kiểm tra vai trò linh hoạt
 * Dùng: checkRole('Admin'), checkRole('KyThuat', 'Admin')
 * Lưu ý: phải dùng sau authMiddleware (req.user đã được gán)
 */
const checkRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.VaiTro)) {
        return res.status(403).json({
            success: false,
            message: `Chức năng này yêu cầu vai trò: ${roles.join(' hoặc ')}`,
        });
    }
    next();
};

module.exports = { authMiddleware, adminOnly, checkRole, JWT_SECRET };
