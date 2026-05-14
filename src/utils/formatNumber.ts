/**
 * Format số tiền sang định dạng VNĐ.
 * Ví dụ: 28500000 → "28.500.000 ₫"
 */
export function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + ' ₫';
}

/**
 * Format số nguyên có dấu chấm phân cách nghìn.
 * Ví dụ: 2500 → "2.500"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('vi-VN');
}

/**
 * Parse chuỗi số VNĐ thành number.
 * Ví dụ: "28.500.000 ₫" → 28500000
 */
export function parseVND(str: string): number {
  return Number(str.replace(/\./g, '').replace(' ₫', '').replace('₫', '').trim());
}

/**
 * Format phần trăm.
 * Ví dụ: 0.835 → "83.5%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}
