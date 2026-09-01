import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TabType } from '@/components/ui/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { HealthStatus } from '@/pages/HealthStatus';
import { fetchHealth, HealthResponse } from '@/services/api';
import { UserProfile, authStorage, logoutUser } from '@/services/auth';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { CustomerPortal } from '@/pages/CustomerPortal';
import { WorkerPortal } from '@/pages/WorkerPortal';
import { AdminDesktopDashboard } from '@/components/admin/AdminDesktopDashboard';
import { ShieldAlert } from 'lucide-react';
import { RealtimeProvider, Channels } from '@/contexts/RealtimeContext';
import { RealtimeToast } from '@/components/realtime/RealtimeToast';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authStorage.getUser());
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<string>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkServerHealth = useCallback(async () => {
    setIsLoadingHealth(true);
    setErrorMessage(null);
    try {
      const data = await fetchHealth();
      setHealthData(data);
      setServerStatus(data.status);
    } catch (err: any) {
      setServerStatus('offline');
      setErrorMessage(err.message || 'Unable to connect to backend server');
    } finally {
      setIsLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 15000);
    return () => clearInterval(interval);
  }, [checkServerHealth]);

  const handleAuthenticated = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'worker') setCurrentTab('worker');
    else if (user.role === 'customer') setCurrentTab('customer');
    else if (user.role === 'admin') setCurrentTab('admin');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCurrentTab('overview');
  };

  // If no user is authenticated, render the Role Selector
  if (!currentUser) {
    return <RoleSelector onAuthenticated={handleAuthenticated} />;
  }

  // If logged in as Customer and in Customer tab, render the dedicated Customer Portal
  if (currentUser.role === 'customer' && currentTab === 'customer') {
    return <CustomerPortal currentUser={currentUser} onLogout={handleLogout} />;
  }

  // If logged in as Worker and in Worker tab, render the dedicated Worker Portal
  if (currentUser.role === 'worker' && currentTab === 'worker') {
    return <WorkerPortal currentUser={currentUser} onLogout={handleLogout} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <Dashboard healthData={healthData} serverStatus={serverStatus} />;
      case 'health':
        return <HealthStatus healthData={healthData} serverStatus={serverStatus} error={errorMessage} />;
      
      // WORKER PORTAL
      case 'worker':
        return <WorkerPortal currentUser={currentUser} onLogout={handleLogout} />;

      // CUSTOMER PORTAL
      case 'customer':
        return <CustomerPortal currentUser={currentUser} onLogout={handleLogout} />;

      // ADMIN PORTAL
      case 'admin':
        if (currentUser.role !== 'admin') {
          return (
            <div className="bg-[#FFFFFF] rounded-2xl p-12 text-center space-y-3 border border-[#A94A43]/30 shadow-sm">
              <ShieldAlert className="w-12 h-12 text-[#A94A43] mx-auto" />
              <h2 className="text-lg font-bold text-[#A94A43] font-display">Access Denied: Admin Governance Portal</h2>
              <p className="text-xs text-[#6F6A63]">
                You must have the ADMIN role to access Cooperative Treasury and Governance settings.
              </p>
            </div>
          );
        }
        return <AdminDesktopDashboard currentUser={currentUser} />;

      default:
        return <Dashboard healthData={healthData} serverStatus={serverStatus} />;
    }
  };

  const adminChannels = currentUser?.role === 'admin' 
    ? [Channels.admin(), Channels.broadcast()] 
    : [Channels.broadcast()];

  return (
    <RealtimeProvider channels={adminChannels}>
      {currentUser?.role === 'admin' && <RealtimeToast role="admin" />}
      <AppLayout
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        healthData={healthData}
        isLoadingHealth={isLoadingHealth}
        onRefreshHealth={checkServerHealth}
        serverStatus={serverStatus}
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        {renderContent()}
      </AppLayout>
    </RealtimeProvider>
  );
}
export default App;
