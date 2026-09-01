import React from 'react';
import { MapPin, Globe, Shield, LogOut } from 'lucide-react';
import { UserProfile } from '@/services/auth';

interface CustomerProfileViewProps {
  user: UserProfile;
  onLogout: () => void;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({ user, onLogout }) => {
  return (
    <div className="space-y-6 pb-20 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight font-display">
          My profile
        </h1>
        <p className="text-xs font-medium text-[#6F6A63]">
          Account &amp; preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#EFE2D2] shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EFE2D2] text-[#9A5B3A] flex items-center justify-center font-bold text-xl">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <h2 className="font-extrabold text-base text-[#171717]">{user.full_name}</h2>
            <p className="text-xs text-[#6F6A63] font-mono">{user.phone_number}</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-[#527A62] bg-[#527A62]/10 px-2 py-0.5 rounded-full uppercase">
              Verified Patron
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#EFE2D2] space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 text-[#171717]">
            <span className="text-[#6F6A63] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#9A5B3A]" />
              <span>Primary Address</span>
            </span>
            <span className="font-medium text-right truncate max-w-[180px]">
              {user.profile_details?.default_address || 'Indiranagar, Bangalore'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 text-[#171717]">
            <span className="text-[#6F6A63] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#9A5B3A]" />
              <span>Language</span>
            </span>
            <span className="font-medium uppercase">{user.preferred_language || 'EN'}</span>
          </div>

          <div className="flex items-center justify-between py-1 text-[#171717]">
            <span className="text-[#6F6A63] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#527A62]" />
              <span>Protection</span>
            </span>
            <span className="font-semibold text-[#527A62]">Active</span>
          </div>
        </div>
      </div>

      {/* Large Logout Button */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full min-h-[52px] rounded-2xl bg-[#FFFFFF] border border-[#A94A43]/30 text-[#A94A43] hover:bg-[#A94A43]/10 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        <span>Log out</span>
      </button>
    </div>
  );
};
export default CustomerProfileView;
