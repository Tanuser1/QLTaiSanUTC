import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={15}
        className="absolute left-3 text-[#74777d] pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-1.5 text-sm border border-[#c4c6cd] rounded bg-[#f3f4f5] focus:bg-white focus:border-[#00796b] focus:ring-1 focus:ring-[#00796b] outline-none transition-all"
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 text-[#74777d] hover:text-[#191c1d] transition-colors"
          type="button"
          aria-label="Xóa tìm kiếm"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
