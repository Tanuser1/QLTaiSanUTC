import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-sm mx-2 my-0.5 text-sm font-medium
         transition-all duration-150 relative group
         ${isActive
           ? 'bg-white/10 text-white border-l-[3px] border-[#4db6ac] pl-[13px]'
           : 'text-[#8192a7] hover:bg-white/10 hover:text-white'
         }`
      }
    >
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {icon}
      </span>
      <span className="truncate flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto flex-shrink-0 bg-[#26a69a] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );
};

export default NavItem;
