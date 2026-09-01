import React from 'react';
import {
  Layers,
  Users,
  Briefcase,
  Activity,
  ShieldCheck,
  MapPin,
  TrendingUp,
  CreditCard,
  Mic,
  Server,
  Zap
} from 'lucide-react';

export type TabType = 'overview' | 'worker' | 'customer' | 'admin' | 'health';

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDbConnected: boolean | null;
  serverStatus: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isDbConnected,
  serverStatus,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'Platform Overview', icon: Layers },
    { id: 'worker',   label: 'Worker Portal',    icon: Briefcase },
    { id: 'customer', label: 'Customer Portal',  icon: Users },
    { id: 'admin',    label: 'Admin Governance', icon: ShieldCheck },
    { id: 'health',   label: 'System Health',    icon: Activity },
  ];

  return (
    <aside
      className="w-64 h-screen flex flex-col justify-between p-4 select-none shrink-0 border-r"
      style={{
        backgroundColor: 'var(--color-navigation)',
        borderColor: 'rgba(154,91,58,0.25)',
      }}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0"
            style={{ backgroundColor: '#9A5B3A' }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Cooperative<span style={{ color: '#C9684A' }}>Gig</span>
            </h1>
            <p className="text-[10px] font-medium" style={{ color: '#9A8A7A' }}>Worker-Owned Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: '#9A8A7A' }}>
            Modules
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group"
                style={{
                  backgroundColor: isActive ? 'rgba(154,91,58,0.18)' : 'transparent',
                  color: isActive ? '#C9684A' : '#9A8A7A',
                  border: isActive ? '1px solid rgba(154,91,58,0.4)' : '1px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = '#9A8A7A';
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#C9684A]' : 'text-inherit'}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Feature Highlights */}
        <div className="pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: '#9A8A7A' }}>
            Architecture
          </p>
          <div className="space-y-1.5 px-1">
            {[
              { icon: MapPin,    color: 'text-[#527A62]', label: 'PostGIS Dispatch' },
              { icon: Mic,       color: 'text-[#C9684A]', label: 'Voice Booking' },
              { icon: TrendingUp,color: 'text-[#9A5B3A]', label: 'Demand Forecast' },
              { icon: CreditCard,color: 'text-[#527A62]', label: 'UPI Escrow' },
            ].map(({ icon: Icon, color, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-[11px] p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#9A8A7A', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className={color}><Icon className="w-3.5 h-3.5 shrink-0" /></span>
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="pt-4" style={{ borderTop: '1px solid rgba(154,91,58,0.25)' }}>
        <div className="p-3 rounded-xl space-y-2" style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(154,91,58,0.15)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium flex items-center gap-1.5" style={{ color: '#9A8A7A' }}>
              <Server className="w-3.5 h-3.5" style={{ color: '#9A8A7A' }} />
              FastAPI
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium">
              <span className={`w-2 h-2 rounded-full ${serverStatus === 'healthy' ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: serverStatus === 'healthy' ? '#527A62' : serverStatus === 'checking' ? '#9A5B3A' : '#A94A43' }}
              />
              <span style={{ color: serverStatus === 'healthy' ? '#527A62' : '#9A8A7A' }}>{serverStatus}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium flex items-center gap-1.5" style={{ color: '#9A8A7A' }}>
              <span className="text-[10px] font-bold font-mono" style={{ color: '#C9684A' }}>GIS</span>
              PostgreSQL
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium">
              <span className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isDbConnected ? '#527A62' : isDbConnected === false ? '#9A5B3A' : '#6F6A63' }}
              />
              <span style={{ color: isDbConnected ? '#527A62' : '#9A8A7A' }}>
                {isDbConnected ? 'connected' : isDbConnected === false ? 'standby' : 'checking'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
