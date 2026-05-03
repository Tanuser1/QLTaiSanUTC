import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm tài sản...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={16}
        className="absolute left-3 text-[#74777d] pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-10 pl-9 pr-4
          bg-[#f3f4f5] border border-[#c4c6cd] rounded
          text-sm text-[#191c1d] placeholder:text-[#74777d]
          focus:bg-white focus:border-[#26a69a] focus:ring-1 focus:ring-[#26a69a]
          outline-none transition-all duration-150
        "
      />
    </div>
  );
};

export default SearchBar;
