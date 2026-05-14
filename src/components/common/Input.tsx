import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  error, label, helperText, leftIcon, rightIcon,
  containerClassName = '', className = '', id, ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#44474c] tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && <span className="absolute left-3 text-[#74777d] flex items-center pointer-events-none">{leftIcon}</span>}
        <input
          id={inputId}
          {...props}
          className={`
            w-full bg-white border rounded px-3 py-2 text-sm text-[#191c1d]
            placeholder:text-[#74777d] transition-all duration-150 outline-none
            ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}
            ${error
              ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]'
              : 'border-[#c4c6cd] focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed ${className}
          `.trim().replace(/\s+/g, ' ')}
        />
        {rightIcon && <span className="absolute right-3 text-[#74777d] flex items-center">{rightIcon}</span>}
      </div>
      {error && (
        <span className="text-xs text-[#ba1a1a] flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 8a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
          {error}
        </span>
      )}
      {!error && helperText && <span className="text-xs text-[#74777d]">{helperText}</span>}
    </div>
  );
};

export default Input;
