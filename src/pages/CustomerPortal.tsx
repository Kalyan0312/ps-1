import React, { useState } from 'react';
import { Home, Calendar, HelpCircle, User as UserIcon, Sparkles, Radio } from 'lucide-react';
import { UserProfile } from '@/services/auth';
import { CustomerHome } from '@/pages/customer/CustomerHome';
import { CustomerBookings } from '@/pages/customer/CustomerBookings';
import { CustomerSupport } from '@/pages/customer/CustomerSupport';
import { CustomerProfileView } from '@/pages/customer/CustomerProfileView';
import { RealtimeProvider, useRealtime, Channels } from '@/contexts/RealtimeContext';
import { RealtimeToast } from '@/components/realtime/RealtimeToast';
import { NavItemDef } from '@/components/navigation';

export type CustomerTab = 'home' | 'bookings' | 'support' | 'profile';

interface CustomerPortalProps {
  currentUser: UserProfile;
  onLogout: () => void;
  activeTab?: CustomerTab;
  onTabChange?: (tab: CustomerTab) => void;
  hideTopHeader?: boolean;
}

function CustomerPortalInner({
  currentUser,
  onLogout,
  activeTab: controlledTab,
  onTabChange: controlledTabChange,
  hideTopHeader = false,
}: CustomerPortalProps) {
  const [localTab, setLocalTab] = useState<CustomerTab>('home');
  const activeTab = controlledTab !== undefined ? controlledTab : localTab;
  const setActiveTab = controlledTabChange || setLocalTab;

  const { isConnected } = useRealtime();

  const navItems: { id: CustomerTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-full w-full flex flex-col justify-between">
      {/* Real-time event toasts */}
      <RealtimeToast role="customer" />

      {/* Top Mobile Bar (shown only when rendered standalone without AppLayout) */}
      {!hideTopHeader && (
        <div className="md:hidden bg-[#F7F3EC]/90 backdrop-blur-md px-4 py-2.5 border-b border-[#EFE2D2] flex items-center justify-between w-full mb-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#171717] font-display">Customer Portal</span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isConnected ? 'text-[#527A62] bg-[#527A62]/10' : 'text-[#6F6A63] bg-[#EFE2D2]'
              }`}
            >
              <Radio className={`w-2.5 h-2.5 ${isConnected ? 'animate-pulse' : ''}`} />
              <span>{isConnected ? 'Live' : 'Connecting'}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#527A62] bg-[#527A62]/10 px-2 py-0.5 rounded-full">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Fair Direct</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-2xl mx-auto">
        {activeTab === 'home' && <CustomerHome onGoToBookings={() => setActiveTab('bookings')} />}
        {activeTab === 'bookings' && <CustomerBookings />}
        {activeTab === 'support' && <CustomerSupport />}
        {activeTab === 'profile' && <CustomerProfileView user={currentUser} onLogout={onLogout} />}
      </div>

      {/* Bottom Navigation Bar on Mobile with 48px touch targets */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#EFE2D2] px-2 py-1 shadow-lg flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 min-h-[48px] py-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive
                  ? 'text-[#9A5B3A] font-extrabold'
                  : 'text-[#6F6A63] hover:text-[#171717] font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-[#EFE2D2]' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#9A5B3A]' : 'text-[#6F6A63]'}`} />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export const CustomerPortal: React.FC<CustomerPortalProps> = (props) => {
  const channels = [
    Channels.customer(props.currentUser.id ?? 'cust-demo'),
    Channels.broadcast(),
  ];
  return (
    <RealtimeProvider channels={channels}>
      <CustomerPortalInner {...props} />
    </RealtimeProvider>
  );
};

export function getCustomerNavItems(
  activeTab: CustomerTab,
  onTabChange: (tab: CustomerTab) => void
): NavItemDef[] {
  return [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: () => onTabChange('home'),
      active: activeTab === 'home',
    },
    {
      id: 'bookings',
      label: 'My Bookings',
      icon: Calendar,
      onClick: () => onTabChange('bookings'),
      active: activeTab === 'bookings',
    },
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      onClick: () => onTabChange('support'),
      active: activeTab === 'support',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      onClick: () => onTabChange('profile'),
      active: activeTab === 'profile',
    },
  ];
}

export default CustomerPortal;
