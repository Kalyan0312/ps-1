import React, { useState } from 'react';
import { Home, Calendar, HelpCircle, User as UserIcon, Sparkles, Radio } from 'lucide-react';
import { UserProfile } from '@/services/auth';
import { CustomerHome } from '@/pages/customer/CustomerHome';
import { CustomerBookings } from '@/pages/customer/CustomerBookings';
import { CustomerSupport } from '@/pages/customer/CustomerSupport';
import { CustomerProfileView } from '@/pages/customer/CustomerProfileView';
import { RealtimeProvider, useRealtime, Channels } from '@/contexts/RealtimeContext';
import { RealtimeToast } from '@/components/realtime/RealtimeToast';

export type CustomerTab = 'home' | 'bookings' | 'support' | 'profile';

interface CustomerPortalProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

function CustomerPortalInner({ currentUser, onLogout }: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<CustomerTab>('home');
  const { isConnected } = useRealtime();

  const navItems: { id: CustomerTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#171717] selection:bg-[#9A5B3A] selection:text-white flex flex-col justify-between overflow-x-hidden w-full max-w-full">
      {/* Real-time event toasts */}
      <RealtimeToast role="customer" />

      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-40 bg-[#F7F3EC]/90 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#EFE2D2] flex items-center justify-between w-full max-w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#9A5B3A] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#9A5B3A]/20">
            CG
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-[#171717] tracking-tight font-display">Cooperative Gig</h1>
            <p className="text-[10px] text-[#6F6A63] font-medium">Customer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Real-time connection badge */}
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
            isConnected
              ? 'text-[#527A62] bg-[#527A62]/10'
              : 'text-[#6F6A63] bg-[#EFE2D2]'
          }`}>
            <Radio className={`w-2.5 h-2.5 ${isConnected ? 'animate-pulse' : ''}`} />
            <span>{isConnected ? 'Live' : 'Connecting'}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#527A62] bg-[#527A62]/10 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>Fair Direct</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 overflow-y-auto w-full max-w-xl mx-auto">
        {activeTab === 'home' && <CustomerHome onGoToBookings={() => setActiveTab('bookings')} />}
        {activeTab === 'bookings' && <CustomerBookings />}
        {activeTab === 'support' && <CustomerSupport />}
        {activeTab === 'profile' && <CustomerProfileView user={currentUser} onLogout={onLogout} />}
      </main>

      {/* Bottom Navigation Bar with Min 48px Touch Targets */}
      <nav className="sticky bottom-0 z-40 bg-[#FFFFFF] border-t border-[#EFE2D2] px-2 py-1.5 shadow-lg flex items-center justify-around w-full max-w-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 min-h-[48px] py-1.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive
                  ? 'text-[#9A5B3A] font-extrabold'
                  : 'text-[#6F6A63] hover:text-[#171717] font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-[#EFE2D2]' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#9A5B3A]' : 'text-[#6F6A63]'}`} />
              </div>
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ currentUser, onLogout }) => {
  const channels = [
    Channels.customer(currentUser.id ?? 'cust-demo'),
    Channels.broadcast(),
  ];
  return (
    <RealtimeProvider channels={channels}>
      <CustomerPortalInner currentUser={currentUser} onLogout={onLogout} />
    </RealtimeProvider>
  );
};
export default CustomerPortal;

