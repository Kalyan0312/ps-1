import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TabType } from '@/components/ui/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { HealthStatus } from '@/pages/HealthStatus';
import { fetchHealth, HealthResponse } from '@/services/api';
import { UserProfile, authStorage, logoutUser } from '@/services/auth';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { CustomerPortal, CustomerTab, getCustomerNavItems } from '@/pages/CustomerPortal';
import { WorkerPortal, WorkerTab, getWorkerNavItems } from '@/pages/WorkerPortal';
import { AdminDesktopDashboard, AdminSubTab } from '@/components/admin/AdminDesktopDashboard';
import {
  ShieldAlert,
  Layers,
  Users,
  Briefcase,
  Sliders,
  HeartHandshake,
  AlertOctagon,
  BarChart3,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { RealtimeProvider, Channels } from '@/contexts/RealtimeContext';
import { RealtimeToast } from '@/components/realtime/RealtimeToast';
import { WorkerSOSModal } from '@/components/worker/WorkerSOSModal';
import { NavItemDef } from '@/components/navigation';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authStorage.getUser());
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [workerSubTab, setWorkerSubTab] = useState<WorkerTab>('home');
  const [customerSubTab, setCustomerSubTab] = useState<CustomerTab>('home');
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('overview');
  const [isSOSOpen, setIsSOSOpen] = useState(false);

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
    if (user.role === 'worker') {
      setCurrentTab('worker');
      setWorkerSubTab('home');
    } else if (user.role === 'customer') {
      setCurrentTab('customer');
      setCustomerSubTab('home');
    } else if (user.role === 'admin') {
      setCurrentTab('admin');
      setAdminSubTab('overview');
    }
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

  // Compute portal-specific navigation items for the Top Navbar and Mobile Drawer
  const getPortalNavItems = (): NavItemDef[] => {
    if (currentTab === 'worker') {
      return getWorkerNavItems(workerSubTab, setWorkerSubTab);
    }
    if (currentTab === 'customer') {
      return getCustomerNavItems(customerSubTab, setCustomerSubTab);
    }
    if (currentTab === 'admin' && currentUser.role === 'admin') {
      return [
        {
          id: 'overview',
          label: 'Overview',
          icon: Layers,
          onClick: () => setAdminSubTab('overview'),
          active: adminSubTab === 'overview',
        },
        {
          id: 'workers',
          label: 'Workers',
          icon: Users,
          onClick: () => setAdminSubTab('workers'),
          active: adminSubTab === 'workers',
        },
        {
          id: 'bookings',
          label: 'Bookings',
          icon: Briefcase,
          onClick: () => setAdminSubTab('bookings'),
          active: adminSubTab === 'bookings',
        },
        {
          id: 'pricing',
          label: 'Pricing',
          icon: Sliders,
          onClick: () => setAdminSubTab('pricing'),
          active: adminSubTab === 'pricing',
        },
        {
          id: 'welfare',
          label: 'Welfare',
          icon: HeartHandshake,
          onClick: () => setAdminSubTab('welfare'),
          active: adminSubTab === 'welfare',
        },
        {
          id: 'grievances',
          label: 'Grievances',
          icon: AlertOctagon,
          onClick: () => setAdminSubTab('grievances'),
          active: adminSubTab === 'grievances',
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          onClick: () => setAdminSubTab('analytics'),
          active: adminSubTab === 'analytics',
        },
        {
          id: 'forecast',
          label: 'Forecast',
          icon: TrendingUp,
          onClick: () => setAdminSubTab('forecast'),
          active: adminSubTab === 'forecast',
        },
        {
          id: 'audit',
          label: 'Audit Logs',
          icon: ShieldCheck,
          onClick: () => setAdminSubTab('audit'),
          active: adminSubTab === 'audit',
        },
      ];
    }
    return [];
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <Dashboard
            healthData={healthData}
            serverStatus={serverStatus}
            onNavigatePortal={(portal) => {
              setCurrentTab(portal);
            }}
          />
        );

      case 'health':
        return (
          <HealthStatus
            healthData={healthData}
            serverStatus={serverStatus}
            error={errorMessage}
          />
        );

      // WORKER PORTAL
      case 'worker':
        return (
          <WorkerPortal
            currentUser={currentUser}
            onLogout={handleLogout}
            activeTab={workerSubTab}
            onTabChange={setWorkerSubTab}
            hideTopHeader
          />
        );

      // CUSTOMER PORTAL
      case 'customer':
        return (
          <CustomerPortal
            currentUser={currentUser}
            onLogout={handleLogout}
            activeTab={customerSubTab}
            onTabChange={setCustomerSubTab}
            hideTopHeader
          />
        );

      // ADMIN PORTAL
      case 'admin':
        if (currentUser.role !== 'admin') {
          return (
            <div className="bg-[#FFFFFF] rounded-2xl p-12 text-center space-y-3 border border-[#A94A43]/30 shadow-sm max-w-xl mx-auto">
              <ShieldAlert className="w-12 h-12 text-[#A94A43] mx-auto" />
              <h2 className="text-lg font-bold text-[#A94A43] font-display">
                Access Denied: Admin Governance Portal
              </h2>
              <p className="text-xs text-[#6F6A63]">
                You must have the ADMIN role to access Cooperative Treasury and Governance settings.
              </p>
            </div>
          );
        }
        return (
          <AdminDesktopDashboard
            currentUser={currentUser}
            activeTab={adminSubTab}
            onTabChange={setAdminSubTab}
          />
        );

      default:
        return (
          <Dashboard
            healthData={healthData}
            serverStatus={serverStatus}
            onNavigatePortal={(portal) => setCurrentTab(portal)}
          />
        );
    }
  };

  const activeChannels = [
    Channels.broadcast(),
    ...(currentUser.role === 'admin' ? [Channels.admin()] : []),
    ...(currentUser.role === 'worker' ? [Channels.worker(currentUser.id ?? 'wrk-demo')] : []),
    ...(currentUser.role === 'customer' ? [Channels.customer(currentUser.id ?? 'cust-demo')] : []),
  ];

  return (
    <RealtimeProvider channels={activeChannels}>
      {currentUser.role === 'admin' && <RealtimeToast role="admin" />}
      <AppLayout
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        healthData={healthData}
        isLoadingHealth={isLoadingHealth}
        onRefreshHealth={checkServerHealth}
        serverStatus={serverStatus}
        currentUser={currentUser}
        onLogout={handleLogout}
        portalNavItems={getPortalNavItems()}
        onOpenSOS={() => setIsSOSOpen(true)}
        onQuickBook={() => {
          setCurrentTab('customer');
          setCustomerSubTab('home');
        }}
      >
        {renderContent()}
      </AppLayout>

      {/* Global Emergency SOS Modal for Workers */}
      {isSOSOpen && (
        <WorkerSOSModal
          isOpen={isSOSOpen}
          onClose={() => setIsSOSOpen(false)}
        />
      )}
    </RealtimeProvider>
  );
}

export default App;
