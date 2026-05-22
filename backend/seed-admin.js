const bcrypt = require('bcryptjs');
const db = require('./db');

// Mật khẩu mặc định cho tất cả user mẫu (kể cả adminutc)
const DEFAULT_PASSWORD = 'hashcode123';

async function seedPasswords() {
    try {
        const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        const [result] = await db.query(
            `UPDATE NguoiDung SET MatKhau = ? WHERE MatKhau = 'SEED_HASH'`,
            [hashed]
        );

        console.log(`✅ Đã hash mật khẩu cho ${result.affectedRows} tài khoản`);
        console.log(`   Mật khẩu mặc định: ${DEFAULT_PASSWORD}`);
        console.log('');
        console.log('   Tài khoản đăng nhập thử:');
        console.log('   adminutc / hashcode123  (Admin)');
        console.log('   ktv_hung / hashcode123  (KyThuat)');
        console.log('   gv_cntt01 / hashcode123 (GiaoVien)');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed thất bại:', err.message);
        process.exit(1);
    }
}

seedPasswords();
