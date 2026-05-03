import React from 'react';

export type StatusType = 'active' | 'maintenance' | 'pending' | 'inactive';

interface StatusChipProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; bg: string; text: string; dot: string }> = {
  active: {
    label: 'Hoạt động',
    bg: 'rgba(38, 166, 154, 0.1)',
    text: '#26a69a',
    dot: '#26a69a',
  },
  maintenance: {
    label: 'Bảo trì',
    bg: 'rgba(239, 83, 80, 0.1)',
    text: '#ef5350',
    dot: '#ef5350',
  },
  pending: {
    label: 'Chờ duyệt',
    bg: 'rgba(255, 202, 40, 0.2)',
    text: '#e6a817',
    dot: '#ffca28',
  },
  inactive: {
    label: 'Ngừng dùng',
    bg: 'rgba(116, 119, 125, 0.1)',
    text: '#74777d',
    dot: '#74777d',
  },
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, className = '' }) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl text-[11px] font-semibold tracking-wide ${className}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      {label ?? config.label}
    </span>
  );
};

export default StatusChip;
