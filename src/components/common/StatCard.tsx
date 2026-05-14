import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatCard (formerly KPIWidget) – Standalone, no imports from old structure.
 */
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  accentColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, trend, accentColor = '#26a69a', className = '',
}) => {
  const trendPositive = trend?.direction === 'up';
  const trendNeutral  = trend?.direction === 'neutral';

  return (
    <div className={`bg-white rounded-lg p-5 flex flex-col gap-4 transition-shadow duration-200 hover:shadow-[0px_6px_16px_rgba(0,0,0,0.08)] ${className}`}
      style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#44474c] tracking-wide uppercase">{title}</span>
          {subtitle && <span className="text-[11px] text-[#74777d]">{subtitle}</span>}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}15` }}>
          <span style={{ color: accentColor }} className="flex items-center">{icon}</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className="font-manrope text-[28px] font-bold leading-none text-[#191c1d]">{value}</span>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 mb-0.5 ${trendNeutral ? 'bg-[#74777d]/10 text-[#74777d]' : trendPositive ? 'bg-[#26a69a]/10 text-[#26a69a]' : 'bg-[#ef5350]/10 text-[#ef5350]'}`}>
            {!trendNeutral && (trendPositive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>)}
            <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      {trend && <p className="text-[11px] text-[#74777d] -mt-2">{trend.label}</p>}

      <div className="h-1 rounded-full bg-[#e1e3e4] overflow-hidden -mx-5 -mb-5">
        <div className="h-full rounded-full" style={{ width: '65%', backgroundColor: accentColor, opacity: 0.6 }} />
      </div>
    </div>
  );
};

// Backward compat
export { StatCard as KPIWidget };
export default StatCard;
