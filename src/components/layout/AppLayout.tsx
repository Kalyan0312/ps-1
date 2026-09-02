import React, { useState } from 'react';
import { Navbar, MobileDrawer, TechArchitectureModal, TechFeatureType, NavItemDef } from '@/components/navigation';
import { HealthResponse } from '@/services/api';
import { UserProfile } from '@/services/auth';
import { TabType } from '@/components/ui/Sidebar';
import { ShieldCheck, HeartHandshake } from 'lucide-react';

interface AppLayoutProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  healthData: HealthResponse | null;
  isLoadingHealth: boolean;
  onRefreshHealth: () => void;
  serverStatus: string;
  currentUser: UserProfile | null;
  onLogout: () => void;
  portalNavItems?: NavItemDef[];
  onOpenSOS?: () => void;
  onQuickBook?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onTabChange,
  healthData,
  isLoadingHealth,
  onRefreshHealth,
  serverStatus,
  currentUser,
  onLogout,
  portalNavItems,
  onOpenSOS,
  onQuickBook,
  children,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [activeTechFeature, setActiveTechFeature] = useState<TechFeatureType | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC] text-[#171717] w-full max-w-full overflow-x-hidden selection:bg-[#9A5B3A]/20">
      {/* Top Responsive Navigation Bar (Desktop horizontal links + Mobile Hamburger) */}
      <Navbar
        currentPortal={currentTab}
        onNavigatePortal={onTabChange}
        currentUser={currentUser}
        onLogout={onLogout}
        healthData={healthData}
        isLoadingHealth={isLoadingHealth}
        onRefreshHealth={onRefreshHealth}
        serverStatus={serverStatus}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
        onOpenTechFeature={setActiveTechFeature}
        portalNavItems={portalNavItems}
        onOpenSOS={onOpenSOS}
        onQuickBook={onQuickBook}
      />

      {/* Slide-out Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentPortal={currentTab}
        onNavigatePortal={onTabChange}
        currentUser={currentUser}
        onLogout={onLogout}
        healthData={healthData}
        serverStatus={serverStatus}
        onOpenTechFeature={setActiveTechFeature}
        portalNavItems={portalNavItems}
        onOpenSOS={onOpenSOS}
      />

      {/* Architecture / Technology Feature Details Modal */}
      <TechArchitectureModal
        feature={activeTechFeature}
        onClose={() => setActiveTechFeature(null)}
        healthData={healthData}
      />

      {/* Main Page Content (Full horizontal width, fluid responsiveness) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 min-w-0">
        {children}
      </main>

      {/* Modern Platform Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#E0D5C8] py-6 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F6A63]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#171717] font-display">Cooperative Gig</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#527A62] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              85/10/5 Revenue Rule Active
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-[#9A5B3A]" />
              Worker Welfare & Healthcare Pool
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Zero Extortionate Middleman Fees</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default AppLayout;
