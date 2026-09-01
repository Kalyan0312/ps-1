import React, { useState } from 'react';
import {
  Home,
  Briefcase,
  TrendingUp,
  User,
  ShieldAlert,
  Radio
} from 'lucide-react';

import { UserProfile } from '@/services/auth';
import { WorkerHome } from '@/pages/worker/WorkerHome';
import { WorkerJobs } from '@/pages/worker/WorkerJobs';
import { WorkerEarnings } from '@/pages/worker/WorkerEarnings';
import { WorkerProfileView } from '@/pages/worker/WorkerProfileView';
import { WorkerSOSModal } from '@/components/worker/WorkerSOSModal';
import { RealtimeProvider, useRealtime, Channels } from '@/contexts/RealtimeContext';
import { RealtimeToast } from '@/components/realtime/RealtimeToast';

export type WorkerTab = 'home' | 'jobs' | 'earnings' | 'profile';

interface WorkerPortalProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

function WorkerPortalInner({ currentUser, onLogout }: WorkerPortalProps) {
  const [activeTab, setActiveTab] = useState<WorkerTab>('home');
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const { isConnected } = useRealtime();

  const navItems: { id: WorkerTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#171717] selection:bg-[#9A5B3A]/20 selection:text-[#171717] flex flex-col justify-between">
      {/* Real-time event toasts */}
      <RealtimeToast role="worker" />

      {/* Top Header Bar with Cooperative Guild Branding & Prominent SOS Button */}
      <header className="sticky top-0 z-40 bg-[#F7F3EC]/90 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#E0D5C8] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#9A5B3A] text-white flex items-center justify-center font-black text-sm shadow-md shadow-[#9A5B3A]/20">
            CG
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-[#171717]">Worker Dashboard</h1>
            <p className="text-[10px] text-[#6F6A63] font-medium">Cooperative Guild Member</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time connection badge */}
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
            isConnected
              ? 'text-[#527A62] bg-[#527A62]/10 border border-[#527A62]/20'
              : 'text-[#6F6A63] bg-[#EFE2D2]'
          }`}>
            <Radio className={`w-3 h-3 ${isConnected ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{isConnected ? 'Live' : 'Connecting...'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsSOSOpen(true)}
            className="flex items-center gap-1.5 bg-[#A94A43] hover:bg-[#8a3830] text-white px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide transition-all shadow-md shadow-[#A94A43]/20"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto p-4 sm:p-6 pb-20">
        {activeTab === 'home' && <WorkerHome onGoToJobs={() => setActiveTab('jobs')} />}
        {activeTab === 'jobs' && <WorkerJobs />}
        {activeTab === 'earnings' && <WorkerEarnings />}
        {activeTab === 'profile' && <WorkerProfileView currentUser={currentUser} onLogout={onLogout} />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="sticky bottom-0 z-40 bg-[#FFFFFF] border-t border-[#E0D5C8] px-3 py-2 shadow-lg flex items-center justify-around max-w-2xl w-full mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-1.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'text-[#9A5B3A] font-black'
                  : 'text-[#6F6A63] hover:text-[#171717] font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-[#EFE2D2]' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#9A5B3A]' : 'text-[#6F6A63]'}`} />
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

export const WorkerPortal: React.FC<WorkerPortalProps> = ({ currentUser, onLogout }) => {
  const channels = [
    Channels.worker(currentUser.id ?? 'wrk-demo'),
    Channels.broadcast(),
  ];

  return (
    <RealtimeProvider channels={channels}>
      <WorkerPortalInner currentUser={currentUser} onLogout={onLogout} />
    </RealtimeProvider>
  );
};
export default WorkerPortal;
