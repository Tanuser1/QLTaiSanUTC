import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  label?: string;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = '#26a69a',
  className = '',
  label,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <svg
        className={`animate-spin ${sizeMap[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label={label ?? 'Đang tải...'}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill={color}
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      {label && (
        <p className="text-sm text-[#74777d]" style={{ fontFamily: 'Inter, sans-serif' }}>
          {label}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
