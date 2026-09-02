import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, ShieldCheck, Briefcase, Users, Activity } from 'lucide-react';
import { UserProfile } from '@/services/auth';

interface UserMenuProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onNavigatePortal?: (portal: 'overview' | 'worker' | 'customer' | 'admin' | 'health') => void;
  currentPortal?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  currentUser,
  onLogout,
  onNavigatePortal,
  currentPortal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!currentUser) return null;

  const roleMap: Record<string, { bg: string; text: string; border: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
    worker: {
      bg: 'bg-[#EFE2D2]',
      text: 'text-[#9A5B3A]',
      border: 'border-[#C9A07A]',
      label: 'Worker Guild',
      icon: Briefcase,
    },
    customer: {
      bg: 'bg-[#F3E4D4]',
      text: 'text-[#C9684A]',
      border: 'border-[#C9A07A]',
      label: 'Customer',
      icon: Users,
    },
    admin: {
      bg: 'bg-[#171717]',
      text: 'text-[#F7F3EC]',
      border: 'border-[#171717]',
      label: 'Admin Council',
      icon: ShieldCheck,
    },
  };
  const roleStyles = roleMap[currentUser.role] ?? {
    bg: 'bg-[#EFE2D2]',
    text: 'text-[#9A5B3A]',
    border: 'border-[#C9A07A]',
    label: currentUser.role,
    icon: User,
  };

  const RoleIcon = roleStyles.icon;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F7F3EC] border border-[#E0D5C8] transition-all shadow-sm focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${roleStyles.bg} ${roleStyles.text} border ${roleStyles.border} shadow-sm shrink-0`}
        >
          <RoleIcon className="w-4 h-4" />
        </div>

        <div className="hidden sm:block text-left leading-tight max-w-[120px]">
          <p className="font-bold text-xs text-[#171717] truncate">{currentUser.full_name}</p>
          <p className="text-[10px] text-[#6F6A63] font-mono capitalize">{currentUser.role}</p>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6F6A63] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E0D5C8] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-[#E0D5C8]">
            <p className="font-bold text-sm text-[#171717]">{currentUser.full_name}</p>
            <p className="text-xs text-[#6F6A63]">{currentUser.phone_number}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F7F3EC] border border-[#E0D5C8] text-[11px] font-semibold text-[#9A5B3A]">
              <RoleIcon className="w-3 h-3" />
              <span>{roleStyles.label}</span>
            </div>
          </div>

          {/* Quick Portal Switch Options */}
          {onNavigatePortal && (
            <div className="py-1 border-b border-[#E0D5C8]">
              <p className="px-4 py-1 text-[10px] font-bold text-[#6F6A63] uppercase tracking-wider">
                Switch Portal
              </p>
              <button
                onClick={() => {
                  onNavigatePortal('overview');
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center gap-2.5 transition-colors ${
                  currentPortal === 'overview'
                    ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                    : 'text-[#171717] hover:bg-[#F7F3EC]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#9A5B3A]" />
                <span>Platform Overview</span>
              </button>

              <button
                onClick={() => {
                  onNavigatePortal('worker');
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center gap-2.5 transition-colors ${
                  currentPortal === 'worker'
                    ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                    : 'text-[#171717] hover:bg-[#F7F3EC]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-[#9A5B3A]" />
                <span>Worker Portal</span>
              </button>

              <button
                onClick={() => {
                  onNavigatePortal('customer');
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center gap-2.5 transition-colors ${
                  currentPortal === 'customer'
                    ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                    : 'text-[#171717] hover:bg-[#F7F3EC]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#C9684A]" />
                <span>Customer Portal</span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    onNavigatePortal('admin');
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center gap-2.5 transition-colors ${
                    currentPortal === 'admin'
                      ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                      : 'text-[#171717] hover:bg-[#F7F3EC]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#527A62]" />
                  <span>Admin Governance</span>
                </button>
              )}

              <button
                onClick={() => {
                  onNavigatePortal('health');
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center gap-2.5 transition-colors ${
                  currentPortal === 'health'
                    ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                    : 'text-[#171717] hover:bg-[#F7F3EC]'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[#527A62]" />
                <span>System Diagnostic & Health</span>
              </button>
            </div>
          )}

          {/* Logout Action */}
          <div className="pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#A94A43] hover:bg-[#A94A43]/10 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserMenu;
