import React, { useEffect } from 'react';
import {
  X,
  Zap,
  Home,
  Briefcase,
  Users,
  ShieldCheck,
  Activity,
  LogOut,
  MapPin,
  Mic,
  TrendingUp,
  CreditCard,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile } from '@/services/auth';
import { HealthResponse } from '@/services/api';
import { ApiStatusBadge } from './ApiStatusBadge';
import { TechFeatureType } from './TechArchitectureModal';

export interface NavItemDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  onClick: () => void;
  active?: boolean;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPortal: 'overview' | 'worker' | 'customer' | 'admin' | 'health';
  onNavigatePortal: (portal: 'overview' | 'worker' | 'customer' | 'admin' | 'health') => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  healthData: HealthResponse | null;
  serverStatus: string;
  onOpenTechFeature: (feature: TechFeatureType) => void;
  portalNavItems?: NavItemDef[];
  onOpenSOS?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentPortal,
  onNavigatePortal,
  currentUser,
  onLogout,
  healthData,
  serverStatus,
  onOpenTechFeature,
  portalNavItems = [],
  onOpenSOS,
}) => {
  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#171717]/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 max-w-[320px] w-4/5 bg-[#FFFFFF] shadow-2xl z-50 flex flex-col justify-between border-r border-[#E0D5C8] animate-in slide-in-from-left duration-200 overflow-y-auto">
        <div className="space-y-6 p-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E0D5C8]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#9A5B3A] text-white flex items-center justify-center font-black shadow-md shadow-[#9A5B3A]/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-[#171717] font-display">
                  Cooperative<span className="text-[#C9684A]">Gig</span>
                </h1>
                <p className="text-[10px] text-[#6F6A63] font-medium">Worker-Owned Platform</p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-[#F7F3EC] text-[#6F6A63] transition-colors flex items-center justify-center"
              aria-label="Close Navigation Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          {currentUser && (
            <div className="p-3.5 rounded-2xl bg-[#F7F3EC] border border-[#E0D5C8] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      currentUser.role === 'worker'
                        ? 'bg-[#EFE2D2] text-[#9A5B3A] border border-[#C9A07A]'
                        : currentUser.role === 'customer'
                        ? 'bg-[#F3E4D4] text-[#C9684A] border border-[#C9A07A]'
                        : 'bg-[#171717] text-white'
                    }`}
                  >
                    {currentUser.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171717] truncate max-w-[130px]">
                      {currentUser.full_name}
                    </p>
                    <span className="text-[10px] font-mono text-[#6F6A63] uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {currentUser.role === 'worker' && onOpenSOS && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSOS();
                    }}
                    className="flex items-center gap-1 bg-[#A94A43] hover:bg-[#8a3830] text-white px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide transition-all shadow-sm"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>SOS</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Current Portal Active Navigation Links */}
          {portalNavItems.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#6F6A63] uppercase tracking-wider px-2 mb-1">
                {currentPortal === 'worker'
                  ? 'Worker Navigation'
                  : currentPortal === 'customer'
                  ? 'Customer Navigation'
                  : currentPortal === 'admin'
                  ? 'Admin Management'
                  : 'Platform Navigation'}
              </p>
              {portalNavItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick();
                      onClose();
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      item.active
                        ? 'bg-[#9A5B3A] text-white shadow-sm'
                        : 'text-[#171717] hover:bg-[#F7F3EC]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ItemIcon
                        className={`w-4 h-4 ${item.active ? 'text-white' : 'text-[#9A5B3A]'}`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
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
              })}
            </div>
          )}

          {/* Switch Portals Section */}
          <div className="space-y-1 pt-2 border-t border-[#E0D5C8]">
            <p className="text-[10px] font-bold text-[#6F6A63] uppercase tracking-wider px-2 mb-1">
              Portals
            </p>
            <button
              onClick={() => {
                onNavigatePortal('overview');
                onClose();
              }}
              className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                currentPortal === 'overview'
                  ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                  : 'text-[#171717] hover:bg-[#F7F3EC]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-[#9A5B3A]" />
                <span>Platform Overview</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6F6A63]" />
            </button>

            <button
              onClick={() => {
                onNavigatePortal('worker');
                onClose();
              }}
              className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                currentPortal === 'worker'
                  ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                  : 'text-[#171717] hover:bg-[#F7F3EC]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-[#9A5B3A]" />
                <span>Worker Portal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6F6A63]" />
            </button>

            <button
              onClick={() => {
                onNavigatePortal('customer');
                onClose();
              }}
              className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                currentPortal === 'customer'
                  ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                  : 'text-[#171717] hover:bg-[#F7F3EC]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#C9684A]" />
                <span>Customer Portal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6F6A63]" />
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  onNavigatePortal('admin');
                  onClose();
                }}
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  currentPortal === 'admin'
                    ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                    : 'text-[#171717] hover:bg-[#F7F3EC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#527A62]" />
                  <span>Admin Governance</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6F6A63]" />
              </button>
            )}

            <button
              onClick={() => {
                onNavigatePortal('health');
                onClose();
              }}
              className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                currentPortal === 'health'
                  ? 'bg-[#EFE2D2] text-[#9A5B3A] font-bold'
                  : 'text-[#171717] hover:bg-[#F7F3EC]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-[#527A62]" />
                <span>System Diagnostic & Health</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6F6A63]" />
            </button>
          </div>

          {/* Architecture Features Drawer Accordion */}
          <div className="space-y-1.5 pt-2 border-t border-[#E0D5C8]">
            <p className="text-[10px] font-bold text-[#6F6A63] uppercase tracking-wider px-2 mb-1">
              Technology & Architecture
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenTechFeature('postgis');
                }}
                className="p-2.5 rounded-xl bg-[#F7F3EC] hover:bg-[#EFE2D2] border border-[#E0D5C8] text-left space-y-1 transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#527A62]" />
                <p className="text-[11px] font-bold text-[#171717]">PostGIS</p>
                <p className="text-[9px] text-[#6F6A63]">Spatial Dispatch</p>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenTechFeature('voice');
                }}
                className="p-2.5 rounded-xl bg-[#F7F3EC] hover:bg-[#EFE2D2] border border-[#E0D5C8] text-left space-y-1 transition-colors"
              >
                <Mic className="w-4 h-4 text-[#C9684A]" />
                <p className="text-[11px] font-bold text-[#171717]">Voice AI</p>
                <p className="text-[9px] text-[#6F6A63]">Multilingual</p>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenTechFeature('forecast');
                }}
                className="p-2.5 rounded-xl bg-[#F7F3EC] hover:bg-[#EFE2D2] border border-[#E0D5C8] text-left space-y-1 transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-[#9A5B3A]" />
                <p className="text-[11px] font-bold text-[#171717]">Forecast</p>
                <p className="text-[9px] text-[#6F6A63]">1.75x Surge Cap</p>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenTechFeature('escrow');
                }}
                className="p-2.5 rounded-xl bg-[#F7F3EC] hover:bg-[#EFE2D2] border border-[#E0D5C8] text-left space-y-1 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-[#527A62]" />
                <p className="text-[11px] font-bold text-[#171717]">UPI Escrow</p>
                <p className="text-[9px] text-[#6F6A63]">85/10/5 Split</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Area with API Status & Logout */}
        <div className="p-4 border-t border-[#E0D5C8] bg-[#F7F3EC] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#6F6A63] font-medium">FastAPI Status:</span>
            <ApiStatusBadge healthData={healthData} serverStatus={serverStatus} compact />
          </div>

          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            type="button"
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#A94A43]/10 hover:bg-[#A94A43]/20 text-[#A94A43] text-xs font-bold border border-[#A94A43]/30 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default MobileDrawer;
