import React from 'react';
import { BarChart3 } from 'lucide-react';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  title?: string;
  data: BarData[];
  maxValue?: number;
  className?: string;
}

/**
 * Chart – simple horizontal bar chart (CSS-only, no external library).
 * Phù hợp cho các trang báo cáo thống kê.
 */
export const Chart: React.FC<ChartProps> = ({
  title,
  data,
  maxValue,
  className = '',
}) => {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ${className}`}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {title && (
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: '1px solid #e0e0e0' }}
        >
          <BarChart3 size={16} style={{ color: '#303f9f' }} />
          <h3
            className="text-[14px] font-bold"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#1a237e' }}
          >
            {title}
          </h3>
        </div>
      )}

      <div className="px-5 py-4 flex flex-col gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span
                className="text-[12px]"
                style={{ color: '#546e7a', fontFamily: 'Inter, sans-serif' }}
              >
                {item.label}
              </span>
              <span
                className="text-[12px] font-semibold tabular-nums"
                style={{ color: '#1a237e', fontFamily: 'Inter, sans-serif' }}
              >
                {item.value.toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f2f5' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((item.value / max) * 100)}%`,
                  backgroundColor: item.color ?? '#303f9f',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chart;
