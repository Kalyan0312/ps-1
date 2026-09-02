import React, { useState } from 'react';
import {
  Home,
  Briefcase,
  TrendingUp,
  User,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import { UserProfile } from '@/services/auth';
import { WorkerHome } from '@/pages/worker/WorkerHome';
import { WorkerJobs } from '@/pages/worker/WorkerJobs';
import { WorkerEarnings } from '@/pages/worker/WorkerEarnings';
import { WorkerProfileView } from '@/pages/worker/WorkerProfileView';
import { WorkerSOSModal } from '@/components/worker/WorkerSOSModal';
import { RealtimeProvider, useRealtime, Channels } from '@/contexts/RealtimeContext';
import { RealtimeToast } from '@/components/realtime/RealtimeToast';
import { NavItemDef } from '@/components/navigation';

export type WorkerTab = 'home' | 'jobs' | 'earnings' | 'profile';

interface WorkerPortalProps {
  currentUser: UserProfile;
  onLogout: () => void;
  activeTab?: WorkerTab;
  onTabChange?: (tab: WorkerTab) => void;
  hideTopHeader?: boolean;
}

function WorkerPortalInner({
  currentUser,
  onLogout,
  activeTab: controlledTab,
  onTabChange: controlledTabChange,
  hideTopHeader = false,
}: WorkerPortalProps) {
  const [localTab, setLocalTab] = useState<WorkerTab>('home');
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const activeTab = controlledTab !== undefined ? controlledTab : localTab;
  const setActiveTab = controlledTabChange || setLocalTab;

  const { isConnected } = useRealtime();

  const navItems: { id: WorkerTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-full w-full flex flex-col justify-between">
      {/* Real-time event toasts */}
      <RealtimeToast role="worker" />

      {/* Top Mobile Bar (shown only when rendered standalone without AppLayout) */}
      {!hideTopHeader && (
        <div className="md:hidden bg-[#F7F3EC]/90 backdrop-blur-md px-4 py-2.5 border-b border-[#E0D5C8] flex items-center justify-between mb-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-[#171717]">Worker Dashboard</span>
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

            <button
              type="button"
              onClick={() => setIsSOSOpen(true)}
              className="flex items-center gap-1 bg-[#A94A43] hover:bg-[#8a3830] text-white px-2.5 py-1 rounded-full text-xs font-black tracking-wide transition-all shadow-md shadow-[#A94A43]/20"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-2xl mx-auto pb-16 sm:pb-6">
        {activeTab === 'home' && <WorkerHome onGoToJobs={() => setActiveTab('jobs')} />}
        {activeTab === 'jobs' && <WorkerJobs />}
        {activeTab === 'earnings' && <WorkerEarnings />}
        {activeTab === 'profile' && <WorkerProfileView currentUser={currentUser} onLogout={onLogout} />}
      </div>

      {/* Bottom Navigation Bar on Mobile with 48px touch targets */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E0D5C8] px-2 py-1 shadow-lg flex items-center justify-around">
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
                  ? 'text-[#9A5B3A] font-black'
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

      {/* SOS Emergency Modal */}
      {isSOSOpen && (
        <WorkerSOSModal
          isOpen={isSOSOpen}
          onClose={() => setIsSOSOpen(false)}
        />
      )}
    </div>
  );
}

export const WorkerPortal: React.FC<WorkerPortalProps> = (props) => {
  const channels = [
    Channels.worker(props.currentUser.id ?? 'wrk-demo'),
    Channels.broadcast(),
  ];

  return (
    <RealtimeProvider channels={channels}>
      <WorkerPortalInner {...props} />
    </RealtimeProvider>
  );
};

export function getWorkerNavItems(
  activeTab: WorkerTab,
  onTabChange: (tab: WorkerTab) => void
): NavItemDef[] {
  return [
    {
      id: 'home',
      label: 'Dashboard',
      icon: Home,
      onClick: () => onTabChange('home'),
      active: activeTab === 'home',
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      onClick: () => onTabChange('jobs'),
      active: activeTab === 'jobs',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: TrendingUp,
      onClick: () => onTabChange('earnings'),
      active: activeTab === 'earnings',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      onClick: () => onTabChange('profile'),
      active: activeTab === 'profile',
    },
  ];
}

export default WorkerPortal;
