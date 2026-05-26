import React from 'react';

export interface Column<T extends object> {
  header: string;
  accessor: keyof T | string;
  render?: (item: T) => React.ReactNode;
}

export interface SimpleTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
}

export function SimpleTable<T extends object>({ columns, data, isLoading }: SimpleTableProps<T>) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead className="bg-[#f8f9fa] border-b border-[#e1e3e4]">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3 text-[13px] font-semibold text-[#44474c] tracking-wide whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e1e3e4]">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((_, j) => (
                  <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-[#74777d] text-sm">
                Chưa có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3 text-sm text-[#191c1d]">
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[String(col.accessor)] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SimpleTable;
