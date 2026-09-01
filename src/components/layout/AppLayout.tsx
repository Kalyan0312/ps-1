import React from 'react';
import { Sidebar, TabType } from '@/components/ui/Sidebar';
import { Header } from '@/components/layout/Header';
import { HealthResponse } from '@/services/api';
import { UserProfile } from '@/services/auth';

interface AppLayoutProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  healthData: HealthResponse | null;
  isLoadingHealth: boolean;
  onRefreshHealth: () => void;
  serverStatus: string;
  currentUser: UserProfile | null;
  onLogout: () => void;
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
  children,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      <Sidebar
        currentTab={currentTab}
        onTabChange={onTabChange}
        isDbConnected={healthData?.database.connected ?? null}
        serverStatus={serverStatus}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          healthData={healthData}
          isLoading={isLoadingHealth}
          onRefresh={onRefreshHealth}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default AppLayout;
