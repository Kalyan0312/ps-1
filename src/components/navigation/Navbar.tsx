import React from 'react';
import {
  Zap,
  Menu,
  Home,
  Briefcase,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  MapPin,
  Mic,
  TrendingUp,
  CreditCard,
  ShieldAlert,
  HelpCircle,
  Search,
} from 'lucide-react';
import { UserProfile } from '@/services/auth';
import { HealthResponse } from '@/services/api';
import { ApiStatusBadge } from './ApiStatusBadge';
import { UserMenu } from './UserMenu';
import { NavDropdown, NavDropdownItem } from './NavDropdown';
import { TechFeatureType } from './TechArchitectureModal';
import { NavItemDef } from './MobileDrawer';

interface NavbarProps {
  currentPortal: 'overview' | 'worker' | 'customer' | 'admin' | 'health';
  onNavigatePortal: (portal: 'overview' | 'worker' | 'customer' | 'admin' | 'health') => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  healthData: HealthResponse | null;
  isLoadingHealth?: boolean;
  onRefreshHealth?: () => void;
  serverStatus: string;
  onToggleMobileDrawer: () => void;
  onOpenTechFeature: (feature: TechFeatureType) => void;
  portalNavItems?: NavItemDef[];
  onOpenSOS?: () => void;
  onQuickBook?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPortal,
  onNavigatePortal,
  currentUser,
  onLogout,
  healthData,
  isLoadingHealth = false,
  onRefreshHealth,
  serverStatus,
  onToggleMobileDrawer,
  onOpenTechFeature,
  portalNavItems = [],
  onOpenSOS,
  onQuickBook,
}) => {
  // Technology dropdown items
  const techDropdownItems: NavDropdownItem[] = [
    {
      id: 'postgis',
      label: 'PostGIS Spatial Dispatch',
      description: 'Sub-millisecond spherical nearest-worker routing',
      icon: MapPin,
      onClick: () => onOpenTechFeature('postgis'),
    },
    {
      id: 'voice',
      label: 'Multilingual Voice AI',
      description: 'Speech-to-Text in 12+ Indian languages',
      icon: Mic,
      onClick: () => onOpenTechFeature('voice'),
    },
    {
      id: 'forecast',
      label: 'Demand Forecasting',
      description: 'Predictive surge limiter (Capped at 1.75x)',
      icon: TrendingUp,
      onClick: () => onOpenTechFeature('forecast'),
    },
    {
      id: 'escrow',
      label: 'UPI Milestone Escrow',
      description: '85% worker wage, 10% reserve, 5% welfare',
      icon: CreditCard,
      onClick: () => onOpenTechFeature('escrow'),
    },
  ];

  // Portals dropdown items (for quick switching on overview or general pages)
  const portalsDropdownItems: NavDropdownItem[] = [
    {
      id: 'overview',
      label: 'Platform Overview',
      description: 'Public portal, services & cooperative model',
      icon: Home,
      onClick: () => onNavigatePortal('overview'),
      active: currentPortal === 'overview',
    },
    {
      id: 'worker',
      label: 'Worker Guild Portal',
      description: 'Available jobs, earnings, verification & SOS',
      icon: Briefcase,
      onClick: () => onNavigatePortal('worker'),
      active: currentPortal === 'worker',
    },
    {
      id: 'customer',
      label: 'Customer Booking Portal',
      description: 'Direct booking, voice search, live tracking',
      icon: Users,
      onClick: () => onNavigatePortal('customer'),
      active: currentPortal === 'customer',
    },
    ...(currentUser?.role === 'admin'
      ? [
          {
            id: 'admin',
            label: 'Admin Governance Portal',
            description: 'Council treasury, approvals, pricing & audit',
            icon: ShieldCheck,
            onClick: () => onNavigatePortal('admin'),
            active: currentPortal === 'admin',
          },
        ]
      : []),
    {
      id: 'health',
      label: 'System Diagnostic & Health',
      description: 'FastAPI, PostgreSQL & PostGIS telemetry',
      icon: Activity,
      onClick: () => onNavigatePortal('health'),
      active: currentPortal === 'health',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7F3EC]/95 backdrop-blur-md border-b border-[#E0D5C8] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Hamburger (mobile/tablet) + Logo & Branding */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Drawer Hamburger Button */}
          <button
            onClick={onToggleMobileDrawer}
            type="button"
            className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-[#EFE2D2] text-[#171717] transition-colors flex items-center justify-center focus:outline-none"
            aria-label="Open Mobile Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#171717]" />
          </button>

          {/* Logo */}
          <div
            onClick={() => onNavigatePortal('overview')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#9A5B3A] group-hover:bg-[#C9684A] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#9A5B3A]/20 transition-colors shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[#171717] font-display">
                  Cooperative<span className="text-[#C9684A]">Gig</span>
                </span>
                <span className="hidden xl:inline-block px-2 py-0.5 rounded-full bg-[#EFE2D2] text-[#9A5B3A] text-[9px] font-bold uppercase tracking-wider font-mono">
                  Democratic
                </span>
              </div>
              <p className="text-[10px] text-[#6F6A63] font-medium leading-none hidden sm:block">
                Worker-Owned Cooperative
              </p>
            </div>
          </div>
        </div>

        {/* Center: Desktop Horizontal Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 min-w-0">
          {/* If there are active portal sub-items (e.g. Worker jobs/earnings, Customer bookings, Admin tabs) */}
          {portalNavItems.length > 0 ? (
            portalNavItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    item.active
                      ? 'bg-[#9A5B3A] text-white shadow-sm'
                      : 'text-[#171717] hover:bg-[#EFE2D2]/60 hover:text-[#9A5B3A]'
                  }`}
                >
                  <ItemIcon
                    className={`w-3.5 h-3.5 ${item.active ? 'text-white' : 'text-[#9A5B3A]'}`}
                  />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        item.active
                          ? 'bg-white text-[#9A5B3A]'
                          : 'bg-[#9A5B3A]/15 text-[#9A5B3A]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            /* Main Platform default items */
            <>
              <button
                onClick={() => onNavigatePortal('overview')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentPortal === 'overview'
                    ? 'bg-[#9A5B3A] text-white shadow-sm'
                    : 'text-[#171717] hover:bg-[#EFE2D2]/60 hover:text-[#9A5B3A]'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => {
                  onNavigatePortal('overview');
                  setTimeout(() => {
                    const el = document.getElementById('services-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#171717] hover:bg-[#EFE2D2]/60 hover:text-[#9A5B3A] transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-[#9A5B3A]" />
                <span>Services</span>
              </button>

              <button
                onClick={() => {
                  onNavigatePortal('overview');
                  setTimeout(() => {
                    const el = document.getElementById('how-it-works-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#171717] hover:bg-[#EFE2D2]/60 hover:text-[#9A5B3A] transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#9A5B3A]" />
                <span>How It Works</span>
              </button>
            </>
          )}

          {/* Technology & Architecture Dropdown */}
          <NavDropdown
            label="Technology"
            icon={Zap}
            items={techDropdownItems}
          />

          {/* Portals Dropdown */}
          <NavDropdown
            label="Portals"
            icon={Briefcase}
            items={portalsDropdownItems}
            active={currentPortal !== 'overview'}
          />

          {/* System Health Link */}
          <button
            onClick={() => onNavigatePortal('health')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentPortal === 'health'
                ? 'bg-[#9A5B3A] text-white shadow-sm'
                : 'text-[#171717] hover:bg-[#EFE2D2]/60 hover:text-[#9A5B3A]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#527A62]" />
            <span>Health</span>
          </button>
        </nav>

        {/* Right: Quick actions, API Status & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Worker Emergency SOS Button (Pinned on Navbar) */}
          {currentUser?.role === 'worker' && onOpenSOS && (
            <button
              onClick={onOpenSOS}
              type="button"
              className="flex items-center gap-1.5 bg-[#A94A43] hover:bg-[#8a3830] text-white px-3 py-1.5 rounded-full text-xs font-black tracking-wide transition-all shadow-md shadow-[#A94A43]/20"
              title="Emergency SOS Alert"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
          )}

          {/* Customer Quick Book CTA (if customer) */}
          {currentUser?.role === 'customer' && onQuickBook && currentPortal !== 'customer' && (
            <button
              onClick={onQuickBook}
              type="button"
              className="hidden sm:flex items-center gap-1.5 bg-[#9A5B3A] hover:bg-[#C9684A] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Book Service</span>
            </button>
          )}

          {/* Compact API Status Badge with Ping */}
          <ApiStatusBadge
            healthData={healthData}
            serverStatus={serverStatus}
            isLoading={isLoadingHealth}
            onRefresh={onRefreshHealth}
            showPingButton
          />

          {/* User Profile & Portal Switch Dropdown */}
          <UserMenu
            currentUser={currentUser}
            onLogout={onLogout}
            onNavigatePortal={onNavigatePortal}
            currentPortal={currentPortal}
          />
        </div>
      </div>
    </header>
  );
};
export default Navbar;
