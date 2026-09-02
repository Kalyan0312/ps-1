import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface NavDropdownItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  onClick: () => void;
  active?: boolean;
}

interface NavDropdownProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavDropdownItem[];
  active?: boolean;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  label,
  icon: Icon,
  items,
  active = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
          active || isOpen
            ? 'bg-[#EFE2D2] text-[#9A5B3A] shadow-sm'
            : 'text-[#171717] hover:bg-[#EFE2D2]/60 hover:text-[#9A5B3A]'
        }`}
        aria-expanded={isOpen}
      >
        {Icon && <Icon className="w-4 h-4 text-[#9A5B3A]" />}
        <span>{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6F6A63] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E0D5C8] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="space-y-0.5">
            {items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs font-medium flex items-start gap-3 transition-colors ${
                    item.active
                      ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                      : 'text-[#171717] hover:bg-[#F7F3EC]'
                  }`}
                >
                  {ItemIcon && (
                    <div className="p-1.5 rounded-lg bg-[#F7F3EC] text-[#9A5B3A] mt-0.5 shrink-0 border border-[#E0D5C8]">
                      <ItemIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#9A5B3A]/15 text-[#9A5B3A]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[10px] text-[#6F6A63] line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default NavDropdown;
