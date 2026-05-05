import React from 'react';
import type { StatusType } from '../atoms/StatusChip';
import { StatusChip } from '../atoms/StatusChip';
import { Eye, Trash2 } from 'lucide-react';

export interface TableRowData {
  id: string;
  assetCode: string;
  assetName: string;
  category: string;
  value: string;
  assignedTo: string;
  specs: string;
  location: string;
  status: StatusType;
  assetType: string;
  attention?: boolean;
}

interface TableRowProps {
  row: TableRowData;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (row: TableRowData) => void;
}

export const TableRow: React.FC<TableRowProps> = ({
  row,
  selected = false,
  onSelect,
  onClick,
}) => {
  return (
    <tr
      onClick={() => onClick?.(row)}
      className={`
        border-b border-[#e1e3e4] last:border-0
        cursor-pointer transition-colors duration-100
        ${row.attention ? 'bg-[#fff176]/10' : ''}
        ${selected ? 'bg-[#041627]/5' : 'hover:bg-[#041627]/5'}
      `}
    >
      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect?.(row.id)}
          className="w-4 h-4 rounded border-[#c4c6cd] accent-[#26a69a] cursor-pointer"
        />
      </td>
      <td className="px-3 py-2.5 text-sm font-medium text-[#002957] tabular-nums whitespace-nowrap">
        {row.assetCode}
      </td>
      <td className="px-3 py-2.5 text-sm text-[#191c1d] max-w-[200px] truncate">
        {row.assetName}
      </td>
      <td className="px-3 py-2.5 text-sm text-[#44474c] whitespace-nowrap">
        {row.category}
      </td>
      <td className="px-3 py-2.5 text-sm font-medium text-[#191c1d] tabular-nums whitespace-nowrap">
        {row.value}
      </td>
      <td className="px-3 py-2.5 text-sm text-[#44474c] whitespace-nowrap">
        {row.assignedTo}
      </td>
      <td className="px-3 py-2.5 text-sm text-[#44474c] max-w-[150px] truncate">
        {row.specs}
      </td>
      <td className="px-3 py-2.5 text-sm text-[#44474c] whitespace-nowrap">
        {row.location}
      </td>
      <td className="px-3 py-2.5">
        <StatusChip status={row.status} />
      </td>
      <td className="px-3 py-2.5 text-sm text-[#44474c] whitespace-nowrap">
        {row.assetType}
      </td>
      <td className="px-3 py-2.5">
        <button className="text-[#041627] hover:text-[#26a69a] transition-colors p-1" title="Xem chi tiết" onClick={(e) => e.stopPropagation()}>
          <Eye size={16} />
        </button>
      </td>
      <td className="px-3 py-2.5">
        <button className="text-[#ef5350] hover:text-[#d32f2f] transition-colors p-1" title="Xóa" onClick={(e) => e.stopPropagation()}>
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default TableRow;
