import React from 'react';
import { Activity, RefreshCw, Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { HealthResponse } from '@/services/api';
import { UserProfile } from '@/services/auth';

interface HeaderProps {
  healthData: HealthResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  healthData,
  isLoading,
  onRefresh,
  currentUser,
  onLogout
}) => {
  return (
    <header className="h-16 border-b border-[#E0D5C8] bg-[#F7F3EC]/95 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE2D2] border border-[#E0D5C8] text-[#9A5B3A] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#C9684A]" />
          <span className="font-display font-bold">Cooperative Platform</span>
        </div>
        <span className="text-[#C9A07A] text-xs hidden sm:inline">•</span>
        <span className="text-[#6F6A63] text-xs font-mono hidden sm:inline">
          Democratic dividend active
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE2D2] text-[#171717] text-xs font-medium border border-[#E0D5C8] transition-colors disabled:opacity-50 shadow-sm"
          title="Refresh System Health Status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#9A5B3A]' : 'text-[#6F6A63]'}`} />
          <span>{isLoading ? 'Checking...' : 'Ping API'}</span>
        </button>

        {healthData && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E0D5C8] text-xs shadow-sm">
            <Activity className="w-3.5 h-3.5 text-[#527A62]" />
            <span className="text-[#6F6A63]">API:</span>
            <span className="text-[#171717] font-semibold uppercase text-[10px] bg-[#EFE2D2] px-1.5 py-0.5 rounded-md">
              {healthData.status}
            </span>
          </div>
        )}

        {currentUser && (
          <div className="flex items-center gap-3 pl-2 border-l border-[#E0D5C8]">
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                currentUser.role === 'worker' ? 'bg-[#EFE2D2] text-[#9A5B3A] border border-[#C9A07A]' :
                currentUser.role === 'customer' ? 'bg-[#F3E4D4] text-[#C9684A] border border-[#C9A07A]' :
                'bg-[#171717] text-[#F7F3EC] border border-[#171717]'
              }`}>
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden md:block text-left leading-tight">
                <p className="font-semibold text-[#171717] truncate max-w-[120px]">{currentUser.full_name}</p>
                <p className="text-[10px] text-[#6F6A63] uppercase font-mono">{currentUser.role}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A94A43]/10 hover:bg-[#A94A43]/20 text-[#A94A43] text-xs border border-[#A94A43]/30 transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Log out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
