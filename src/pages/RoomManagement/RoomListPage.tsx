import React, { useState } from "react";
import { Eye, Trash2, Plus, Search, Building2, Layers, ChevronLeft, ChevronRight } from "lucide-react";

const MOCKDATA = [
  { id: 1, maPhong: "PM101", tenPhong: "Phòng máy 101", toaNha: "Nhà A", tang: 1, loaiPhong: "PhongMay",  soThietBi: 25, trangThai: 1 },
  { id: 2, maPhong: "PM102", tenPhong: "Phòng máy 102", toaNha: "Nhà A", tang: 1, loaiPhong: "PhongMay",  soThietBi: 22, trangThai: 1 },
  { id: 3, maPhong: "PM201", tenPhong: "Lab HTTT 201",  toaNha: "Nhà A", tang: 2, loaiPhong: "PhongMay",  soThietBi: 18, trangThai: 1 },
  { id: 4, maPhong: "PH301", tenPhong: "Phòng học 301", toaNha: "Nhà B", tang: 3, loaiPhong: "PhongHoc",  soThietBi: 0,  trangThai: 1 },
  { id: 5, maPhong: "KHO01", tenPhong: "Kho thiết bị",  toaNha: "Nhà C", tang: 1, loaiPhong: "Kho",       soThietBi: 12, trangThai: 1 },
  { id: 6, maPhong: "VP401", tenPhong: "VP Khoa CNTT",  toaNha: "Nhà A", tang: 4, loaiPhong: "VanPhong",  soThietBi: 6,  trangThai: 0 },
];

const LOAI_LABEL: Record<string, string> = {
  PhongMay: "Phòng máy",
  PhongHoc: "Phòng học",
  VanPhong: "Văn phòng",
  Kho:      "Kho",
  Xuong:    "Xưởng",
};

const PAGE_SIZE = 10;

export default function DanhSachPhong() {
  const [search,      setSearch]      = useState("");
  const [filterLoai,  setFilterLoai]  = useState("");
  const [selected,    setSelected]    = useState<number[]>([]);
  const [data,        setData]        = useState(MOCKDATA);
  const [page,        setPage]        = useState(1);

  // Filter
  const filtered = data.filter(p => {
    const matchLoai   = !filterLoai || p.loaiPhong === filterLoai;
    const matchSearch = !search ||
      p.maPhong.toLowerCase().includes(search.toLowerCase()) ||
      p.tenPhong.toLowerCase().includes(search.toLowerCase());
    return matchLoai && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Checkbox
  const allChecked  = paged.length > 0 && paged.every(p => selected.includes(p.id));
  const toggleAll   = () => setSelected(allChecked ? selected.filter(id => !paged.find(p => p.id === id)) : Array.from(new Set([...selected, ...paged.map(p => p.id)])));
  const toggleOne   = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // Xóa mềm
  const handleXoa       = (id: number) => setData(d => d.filter(p => p.id !== id));
  const handleXoaNhieu  = () => { setData(d => d.filter(p => !selected.includes(p.id))); setSelected([]); };

  return (
    <div style={styles.wrapper}>

      {/* ── HEADER ── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}><Building2 size={20} color="#fff" /></div>
          <h2 style={styles.headerTitle}>Danh sách phòng</h2>
        </div>
        <button style={styles.btnAdd}>
          <Plus size={16} /> Thêm
        </button>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={styles.filterBar}>
        <div style={styles.filterLeft}>
          <div style={styles.selectWrap}>
            <Layers size={14} style={{ color: "#64748b", marginRight: 6 }} />
            <select
              style={styles.select}
              value={filterLoai}
              onChange={e => { setFilterLoai(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả loại phòng</option>
              <option value="PhongMay">Phòng máy</option>
              <option value="PhongHoc">Phòng học</option>
              <option value="VanPhong">Văn phòng</option>
              <option value="Kho">Kho</option>
            </select>
          </div>

          <div style={styles.inputWrap}>
            <input
              style={styles.input}
              placeholder="Nhập tên hoặc mã phòng..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <button style={styles.btnSearch}>
            <Search size={14} /> Tìm kiếm
          </button>
        </div>

        {selected.length > 0 && (
          <button style={styles.btnDeleteAll} onClick={handleXoaNhieu}>
            <Trash2 size={14} /> Xóa {selected.length} mục đã chọn
          </button>
        )}
      </div>

      {/* ── KẾT QUẢ ── */}
      <p style={styles.resultText}>
        Tìm thấy <strong>{filtered.length}</strong> phòng
      </p>

      {/* ── TABLE ── */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={{ ...styles.th, width: 40 }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} style={styles.checkbox} />
              </th>
              <th style={styles.th}>Mã phòng</th>
              <th style={styles.th}>Tên phòng</th>
              <th style={styles.th}>Tòa nhà – Tầng</th>
              <th style={styles.th}>Loại phòng</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Số lượng thiết bị</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Trạng thái</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Xem</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={9} style={styles.emptyCell}>Không có dữ liệu</td>
              </tr>
            ) : paged.map((p, i) => (
              <tr
                key={p.id}
                style={{
                  ...styles.tr,
                  background: selected.includes(p.id) ? "#eff6ff" : i % 2 === 0 ? "#fff" : "#f8fafc",
                }}
              >
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggleOne(p.id)}
                    style={styles.checkbox}
                  />
                </td>
                <td style={styles.td}>
                  <span style={styles.maCode}>{p.maPhong}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.tenPhong}>{p.tenPhong}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.toaNha}>{p.toaNha}</span>
                  <span style={styles.tang}> – Tầng {p.tang}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.loaiBadge}>{LOAI_LABEL[p.loaiPhong] || p.loaiPhong}</span>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <span style={{
                    ...styles.soThietBi,
                    color: p.soThietBi === 0 ? "#94a3b8" : "#0f172a",
                  }}>
                    {p.soThietBi}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  {p.trangThai === 1
                    ? <span style={styles.badgeGreen}>Đang hoạt động</span>
                    : <span style={styles.badgeGray}>Dừng hoạt động</span>
                  }
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <button style={styles.btnEye} title="Xem chi tiết">
                    <Eye size={16} />
                  </button>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <button style={styles.btnTrash} title="Xóa" onClick={() => handleXoa(p.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── PHÂN TRANG ── */}
      <div style={styles.pagination}>
        <span style={styles.paginationInfo}>
          Hiển thị từ {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} đến{" "}
          {Math.min(page * PAGE_SIZE, filtered.length)} trong {filtered.length} bản ghi
        </span>
        <div style={styles.paginationBtns}>
          <button
            style={{ ...styles.btnPage, opacity: page === 1 ? 0.4 : 1 }}
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={14} /> Trước
          </button>
          <span style={styles.pageNum}>{page} / {totalPages}</span>
          <button
            style={{ ...styles.btnPage, opacity: page === totalPages ? 0.4 : 1 }}
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Tiếp <ChevronRight size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}

// ── STYLES ──
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    padding: "28px 32px",
    background: "#f1f5f9",
    minHeight: "100vh",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px #3b82f640",
  },
  headerTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" },
  btnAdd: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer",
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#fff", fontWeight: 600, fontSize: 14,
    boxShadow: "0 2px 8px #22c55e40",
    transition: "opacity .15s",
  },
  filterBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: 10,
    background: "#fff", borderRadius: 12, padding: "14px 18px",
    boxShadow: "0 1px 4px #0001", marginBottom: 8,
  },
  filterLeft: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  selectWrap: {
    display: "flex", alignItems: "center",
    border: "1.5px solid #e2e8f0", borderRadius: 8,
    padding: "0 10px", background: "#f8fafc", height: 38,
  },
  select: {
    border: "none", background: "transparent", outline: "none",
    fontSize: 13, color: "#374151", cursor: "pointer",
  },
  inputWrap: { position: "relative" },
  input: {
    border: "1.5px solid #e2e8f0", borderRadius: 8,
    padding: "0 12px", height: 38, width: 220,
    fontSize: 13, outline: "none", color: "#374151",
    background: "#f8fafc",
  },
  btnSearch: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "0 16px", height: 38, borderRadius: 8, border: "none",
    background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
    color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
    boxShadow: "0 2px 6px #0ea5e930",
  },
  btnDeleteAll: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "0 16px", height: 38, borderRadius: 8, border: "none",
    background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
    boxShadow: "0 2px 6px #ef444430",
  },
  resultText: { fontSize: 13, color: "#3b82f6", margin: "0 0 10px 2px" },
  tableWrap: {
    background: "#fff", borderRadius: 14,
    boxShadow: "0 1px 6px #0001", overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "linear-gradient(90deg,#dbeafe,#eff6ff)" },
  th: {
    padding: "13px 14px", textAlign: "left",
    fontSize: 13, fontWeight: 700, color: "#1e40af",
    borderBottom: "2px solid #bfdbfe",
    whiteSpace: "nowrap",
  },
  tr: { transition: "background .1s" },
  td: {
    padding: "12px 14px", fontSize: 13, color: "#374151",
    borderBottom: "1px solid #f1f5f9",
  },
  checkbox: { width: 15, height: 15, cursor: "pointer", accentColor: "#3b82f6" },
  maCode: {
    fontFamily: "monospace", fontWeight: 700, fontSize: 13,
    color: "#1d4ed8", background: "#eff6ff",
    padding: "2px 8px", borderRadius: 5,
  },
  tenPhong: { fontWeight: 600, color: "#0f172a" },
  toaNha:   { color: "#374151" },
  tang:     { color: "#64748b", fontSize: 12 },
  loaiBadge: {
    fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
    background: "#e0f2fe", color: "#0369a1",
  },
  soThietBi: { fontWeight: 700, fontSize: 14 },
  badgeGreen: {
    display: "inline-block", padding: "3px 12px", borderRadius: 20,
    background: "#dcfce7", color: "#15803d",
    fontSize: 12, fontWeight: 600,
  },
  badgeGray: {
    display: "inline-block", padding: "3px 12px", borderRadius: 20,
    background: "#f1f5f9", color: "#64748b",
    fontSize: 12, fontWeight: 600,
  },
  btnEye: {
    background: "#eff6ff", border: "none", borderRadius: 7,
    color: "#3b82f6", padding: "5px 8px", cursor: "pointer",
    display: "inline-flex", alignItems: "center",
  },
  btnTrash: {
    background: "#fff1f2", border: "none", borderRadius: 7,
    color: "#ef4444", padding: "5px 8px", cursor: "pointer",
    display: "inline-flex", alignItems: "center",
  },
  emptyCell: {
    textAlign: "center", padding: "40px", color: "#94a3b8",
    fontSize: 14, fontStyle: "italic",
  },
  pagination: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 4px", flexWrap: "wrap", gap: 8,
  },
  paginationInfo: { fontSize: 13, color: "#64748b" },
  paginationBtns: { display: "flex", alignItems: "center", gap: 8 },
  btnPage: {
    display: "flex", alignItems: "center", gap: 4,
    padding: "6px 14px", borderRadius: 8,
    border: "1.5px solid #e2e8f0", background: "#fff",
    fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer",
  },
  pageNum: {
    fontSize: 13, fontWeight: 700, color: "#1d4ed8",
    padding: "0 8px",
  },
};
