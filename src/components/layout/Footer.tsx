import React from 'react';

/**
 * Footer – tách từ phần branding cuối Sidebar.
 * Dùng độc lập trong AdminLayout nếu cần.
 */
export const Footer: React.FC = () => {
  return (
    <footer
      className="shrink-0 text-center px-4 py-3"
      style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
    >
      <p
        className="text-[11px] text-[#90a4ae]"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        © 2026 Trường Đại học Giao thông Vận tải (UTC)
      </p>
    </footer>
  );
};

export default Footer;
