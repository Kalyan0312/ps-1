import React from 'react';
import {
  CreditCard,
  Database,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Users,
  Sparkles
} from 'lucide-react';
import { HealthResponse } from '@/services/api';

interface DashboardProps {
  healthData: HealthResponse | null;
  serverStatus: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ healthData, serverStatus }) => {
  return (
    <div className="space-y-10 pb-12">
      {/* ─── 1. HERO SECTION (EDITORIAL REFERENCE STYLE) ────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#171717] text-[#FFFFFF] p-8 sm:p-12 shadow-xl border border-[#2A2A2A]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 text-[#EFE2D2] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#C9684A]" />
              <span>Verified Worker-Owned Cooperative</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-[#FFFFFF]">
              Fair Work.<br />
              Trusted Service.<br />
              <span className="text-[#C9684A]">Shared Prosperity.</span>
            </h1>

            <p className="text-[#EFE2D2] text-sm sm:text-base leading-relaxed max-w-xl font-normal opacity-90">
              Verified local services powered by worker cooperatives. Direct wage guarantees, zero extortionate middleman fees, and democratic community dividends.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button className="btn-primary py-3.5 px-6 text-sm font-bold shadow-lg shadow-[#9A5B3A]/30 flex items-center gap-2">
                <span>Book a Service</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="btn-secondary py-3.5 px-6 text-sm font-bold bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-[#FFFFFF] border-[#FFFFFF]/30">
                Join as Worker
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#2A221B] to-[#1F1915] p-6 border border-[#9A5B3A]/30 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#9A5B3A] text-white flex items-center justify-center font-bold font-display text-base">
                    85%
                  </div>
                  <div>
                    <p className="text-xs text-[#EFE2D2] font-semibold">Direct Wage Share</p>
                    <p className="text-[11px] text-[#9A8A7A]">To verified skilled workers</p>
                  </div>
                </div>
                <span className="badge-success bg-[#527A62]/20 text-[#527A62] border-[#527A62]/40 text-[10px]">
                  Guaranteed
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#171717] border border-[#3A3028] space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9A8A7A]">Worker Payout</span>
                  <span className="font-bold text-[#527A62]">85.0%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9A8A7A]">Cooperative Reserve</span>
                  <span className="font-bold text-[#C9684A]">10.0%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9A8A7A]">Welfare & Healthcare</span>
                  <span className="font-bold text-[#527A62]">5.0%</span>
                </div>
                <div className="w-full h-2 bg-[#2A221B] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#527A62]" style={{ width: '85%' }}></div>
                  <div className="h-full bg-[#C9684A]" style={{ width: '10%' }}></div>
                  <div className="h-full bg-[#9A5B3A]" style={{ width: '5%' }}></div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#EFE2D2]/80">
                <ShieldCheck className="w-4 h-4 text-[#527A62]" />
                <span>Democratic pricing with surge multipliers capped at 1.75x</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. POPULAR SERVICES CAROUSEL/GRID ──────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-[#171717]">Popular Services</h2>
            <p className="text-xs text-[#6F6A63]">Cooperative-verified craftspeople ready near you</p>
          </div>
          <span className="text-xs font-bold text-[#9A5B3A] hover:text-[#C9684A] cursor-pointer flex items-center gap-1">
            View all services <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { name: 'Electrician', icon: '⚡', base: '₹250' },
            { name: 'Plumber', icon: '🚰', base: '₹250' },
            { name: 'Carpenter', icon: '🪚', base: '₹300' },
            { name: 'Painter', icon: '🎨', base: '₹220' },
            { name: 'Cleaning', icon: '🧹', base: '₹200' },
            { name: 'Driver', icon: '🚗', base: '₹240' },
            { name: 'Gardening', icon: '🌿', base: '₹200' },
            { name: 'Technician', icon: '🔧', base: '₹350' },
          ].map((srv) => (
            <div
              key={srv.name}
              className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E0D5C8] hover:border-[#9A5B3A] hover:shadow-md transition-all text-center space-y-2 cursor-pointer group"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#F7F3EC] group-hover:bg-[#EFE2D2] flex items-center justify-center text-2xl transition-colors border border-[#E0D5C8]">
                {srv.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-[#171717]">{srv.name}</p>
                <p className="text-[10px] text-[#6F6A63] mt-0.5">from {srv.base}/hr</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. HOW IT WORKS ─────────────────────────────────────────────────── */}
      <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E0D5C8] space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold font-display text-[#171717]">How It Works</h2>
          <p className="text-xs text-[#6F6A63]">Transparent, direct, and powered by collective ownership</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            { step: '01', title: 'Tell us', desc: 'Speak or type what you need in your language' },
            { step: '02', title: 'Get matched', desc: 'PostGIS spatial engine dispatches nearest verified worker' },
            { step: '03', title: 'Track', desc: 'Real-time WebSocket GPS routing and status updates' },
            { step: '04', title: 'Pay fairly', desc: 'UPI escrow with transparent breakdown & welfare fund' },
          ].map((item) => (
            <div key={item.step} className="p-5 rounded-xl bg-[#F7F3EC] border border-[#E0D5C8] space-y-2 relative">
              <span className="text-2xl font-black text-[#9A5B3A]/30 font-display">
                {item.step}
              </span>
              <h3 className="font-bold text-sm text-[#171717]">{item.title}</h3>
              <p className="text-xs text-[#6F6A63] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. JOIN AS WORKER BANNER ────────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#9A5B3A] text-white p-8 sm:p-10 border border-[#7A4628] shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#F3E4D4]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#F3E4D4]">Worker Guild Membership</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display">
            Your skill. Your livelihood. Your cooperative.
          </h2>
          <p className="text-xs sm:text-sm text-[#F7F3EC]/90 max-w-xl">
            Join thousands of independent craftspeople building financial security, healthcare protection, and collective voting rights.
          </p>
        </div>
        <button className="btn-secondary py-3.5 px-8 text-sm font-bold bg-[#FFFFFF] hover:bg-[#F7F3EC] text-[#171717] border-transparent shrink-0 shadow-lg">
          Join as Worker
        </button>
      </div>

      {/* ─── 5. FOUR PILLARS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E0D5C8] space-y-2">
          <ShieldCheck className="w-6 h-6 text-[#527A62]" />
          <h3 className="font-bold text-sm text-[#171717]">Verified Workers</h3>
          <p className="text-xs text-[#6F6A63]">Background verified, skill tested, and voting cooperative members.</p>
        </div>
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E0D5C8] space-y-2">
          <CreditCard className="w-6 h-6 text-[#9A5B3A]" />
          <h3 className="font-bold text-sm text-[#171717]">Transparent Pricing</h3>
          <p className="text-xs text-[#6F6A63]">Clear price breakdown shown before booking with strict 1.75x surge caps.</p>
        </div>
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E0D5C8] space-y-2">
          <HeartHandshake className="w-6 h-6 text-[#527A62]" />
          <h3 className="font-bold text-sm text-[#171717]">Worker Welfare</h3>
          <p className="text-xs text-[#6F6A63]">5% of every transaction funds medical, accident, and emergency pools.</p>
        </div>
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E0D5C8] space-y-2">
          <Zap className="w-6 h-6 text-[#C9684A]" />
          <h3 className="font-bold text-sm text-[#171717]">Secure Payments</h3>
          <p className="text-xs text-[#6F6A63]">100% safe UPI escrow with direct worker bank account settlements.</p>
        </div>
      </div>

      {/* ─── 6. PLATFORM TELEMETRY & DIAGNOSTICS (COLLAPSIBLE / CLEAN) ───────── */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E0D5C8] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-[#9A5B3A]" />
            <div>
              <h2 className="text-base font-bold text-[#171717]">Platform Telemetry & Live Heartbeat</h2>
              <p className="text-xs text-[#6F6A63]">FastAPI backend, PostGIS spatial driver, and database diagnostics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${serverStatus === 'healthy' ? 'bg-[#527A62]' : 'bg-[#A94A43]'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${serverStatus === 'healthy' ? 'bg-[#527A62]' : 'bg-[#A94A43]'}`}></span>
            </span>
            <span className="text-xs font-semibold capitalize text-[#171717]">
              API: {serverStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#F7F3EC] p-4 rounded-xl border border-[#E0D5C8]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#6F6A63] font-medium">FastAPI Endpoint</span>
              <span className="font-mono text-[#9A5B3A] bg-[#EFE2D2] px-2 py-0.5 rounded text-[11px]">GET /api/v1/health</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {serverStatus === 'healthy' ? (
                <CheckCircle2 className="w-4 h-4 text-[#527A62]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#A94A43]" />
              )}
              <span className="text-xs font-semibold text-[#171717]">
                {serverStatus === 'healthy' ? '200 OK — Ready' : 'Backend Offline / Starting'}
              </span>
            </div>
          </div>

          <div className="bg-[#F7F3EC] p-4 rounded-xl border border-[#E0D5C8]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#6F6A63] font-medium">Database</span>
              <span className="font-mono text-[#171717] text-[11px]">{healthData?.database.database_name || 'cooperative_gig'}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {healthData?.database.connected ? (
                <CheckCircle2 className="w-4 h-4 text-[#527A62]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#A94A43]" />
              )}
              <span className="text-xs font-semibold text-[#171717]">
                {healthData
                  ? (healthData.database.connected
                    ? `Connected (${healthData.database.latency_ms}ms)`
                    : 'Disconnected')
                  : 'Checking...'}
              </span>
            </div>
          </div>

          <div className="bg-[#F7F3EC] p-4 rounded-xl border border-[#E0D5C8]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#6F6A63] font-medium">PostGIS Spatial Engine</span>
              <span className="font-mono text-[#9A5B3A] text-[11px]">EPSG:4326</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {healthData?.database.postgis_available ? (
                <CheckCircle2 className="w-4 h-4 text-[#527A62]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#A94A43]" />
              )}
              <span className="text-xs font-semibold text-[#171717] truncate">
                {healthData
                  ? (healthData.database.postgis_available
                    ? `PostGIS ${healthData.database.postgis_version?.split(' ')[0] || 'Connected'}`
                    : 'PostGIS Unavailable')
                  : 'Checking...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
