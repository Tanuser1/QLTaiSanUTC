const db = require('./db');

async function checkUsers() {
  try {
    const [users] = await db.query('SELECT MaNguoiDung, TenDangNhap, HoTen, VaiTro, TrangThai, MatKhau FROM NguoiDung');
    
    let total = users.length;
    let active = 0;
    let canLogin = 0;
    let issues = [];
    
    console.log('=== DANH SACH TAI KHOAN TRONG DATABASE ===');
    for (const u of users) {
      const isActive = u.TrangThai === 1;
      const isPasswordHashed = u.MatKhau && u.MatKhau.startsWith('$2a$'); // bcrypt hash format
      
      if (isActive) active++;
      if (isActive && isPasswordHashed) canLogin++;
      
      let status = isActive ? 'Hoat dong' : 'Bi khoa';
      let pwdStatus = isPasswordHashed ? 'OK (da ma hoa)' : 'LOI (Chua ma hoa)';
      
      console.log(`- [${u.VaiTro}] ${u.TenDangNhap} | ${u.HoTen} | Trang thai: ${status} | Mat khau: ${pwdStatus}`);
      
      if (!isPasswordHashed) {
        issues.push(`Tai khoan ${u.TenDangNhap} co mat khau la '${u.MatKhau}' (chua duoc ma hoa).`);
      }
    }
    
    console.log('\n=== TONG KET ===');
    console.log(`Tong so tai khoan: ${total}`);
    console.log(`So tai khoan dang hoat dong: ${active}`);
    console.log(`So tai khoan CO THE DANG NHAP: ${canLogin}`);
    
    if (issues.length > 0) {
      console.log('\n⚠️ CAC LOI PHAT HIEN:');
      issues.forEach(i => console.log(i));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkUsers();
