import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  Briefcase,
  Layers,
  IndianRupee,
  HeartHandshake,
  AlertOctagon,
  TrendingUp,
  Sliders,
  CheckCircle2,
  RefreshCw,
  FileText,
  Check,
  X,
  ChevronRight,
  BarChart3,
  Award
} from 'lucide-react';

import {
  fetchAdminOverview,
  fetchPendingWorkers,
  approveWorker,
  rejectWorker,
  fetchGrievances,
  updateGrievanceStatus,
  AdminOverviewMetrics,
  PendingWorkerItem,
  GrievanceItem
} from '@/services/admin';

import { fetchBookings, BookingDetail } from '@/services/bookings';
import { AdminPricingManager } from '@/components/admin/AdminPricingManager';
import { AdminWelfarePanel } from '@/components/welfare/AdminWelfarePanel';
import { AdminSOSQueue } from '@/components/admin/AdminSOSQueue';
import { AdminAnalyticsCharts } from '@/components/admin/AdminAnalyticsCharts';
import { AdminDemandForecastView } from '@/components/admin/AdminDemandForecastView';
import { AdminAuditLogsView } from '@/components/admin/AdminAuditLogsView';
import { InvoiceModal } from '@/components/invoice/InvoiceModal';
import { useRealtimeEvent } from '@/contexts/RealtimeContext';

export type AdminSubTab =
  | 'overview'
  | 'workers'
  | 'bookings'
  | 'pricing'
  | 'welfare'
  | 'grievances'
  | 'analytics'
  | 'forecast'
  | 'audit';

interface AdminDesktopDashboardProps {
  currentUser: {
    full_name: string;
    role: string;
  };
}

export const AdminDesktopDashboard: React.FC<AdminDesktopDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('overview');

  // Overview metrics state
  const [overview, setOverview] = useState<AdminOverviewMetrics | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Pending Workers state
  const [pendingWorkers, setPendingWorkers] = useState<PendingWorkerItem[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [actionWorkerId, setActionWorkerId] = useState<string | null>(null);

  // Bookings state
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Grievances state
  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [grievanceFilter, setGrievanceFilter] = useState<string>('all');
  const [loadingGrievances, setLoadingGrievances] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const loadOverview = useCallback(async () => {
    try {
      const data = await fetchAdminOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const loadPendingWorkers = useCallback(async () => {
    setLoadingWorkers(true);
    try {
      const data = await fetchPendingWorkers('all');
      setPendingWorkers(data);
    } catch (err) {
      console.error('Failed to load pending workers:', err);
    } finally {
      setLoadingWorkers(false);
    }
  }, []);

  const loadBookingsData = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const loadGrievancesData = useCallback(async () => {
    setLoadingGrievances(true);
    try {
      const data = await fetchGrievances();
      setGrievances(data);
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoadingGrievances(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (activeTab === 'workers') loadPendingWorkers();
    if (activeTab === 'bookings') loadBookingsData();
    if (activeTab === 'grievances') loadGrievancesData();
  }, [activeTab, loadPendingWorkers, loadBookingsData, loadGrievancesData]);

  // Real-Time Events
  useRealtimeEvent('booking.created', () => {
    loadOverview();
    if (activeTab === 'bookings') loadBookingsData();
  });
  useRealtimeEvent('booking.status_updated', () => {
    loadOverview();
    if (activeTab === 'bookings') loadBookingsData();
  });
  useRealtimeEvent('payment.succeeded', () => {
    loadOverview();
    if (activeTab === 'bookings') loadBookingsData();
  });

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleApproveWorker = async (workerId: string) => {
    setActionWorkerId(workerId);
    try {
      await approveWorker(workerId);
      setPendingWorkers((prev) => prev.filter((w) => w.id !== workerId));
      await loadOverview();
    } catch (err) {
      console.error('Failed to approve worker:', err);
    } finally {
      setActionWorkerId(null);
    }
  };

  const handleRejectWorker = async (workerId: string) => {
    setActionWorkerId(workerId);
    try {
      await rejectWorker(workerId);
      setPendingWorkers((prev) => prev.filter((w) => w.id !== workerId));
      await loadOverview();
    } catch (err) {
      console.error('Failed to reject worker:', err);
    } finally {
      setActionWorkerId(null);
    }
  };

  const handleGrievanceStatusChange = async (
    grievanceId: string,
    newStatus: 'open' | 'under_review' | 'resolved'
  ) => {
    setResolvingId(grievanceId);
    try {
      const updated = await updateGrievanceStatus(
        grievanceId,
        newStatus,
        newStatus === 'resolved' ? 'Resolved by cooperative governance council.' : undefined
      );
      setGrievances((prev) => prev.map((g) => (g.id === grievanceId ? updated : g)));
      await loadOverview();
    } catch (err) {
      console.error('Failed to update grievance:', err);
    } finally {
      setResolvingId(null);
    }
  };

  // ─── Navigation Items ──────────────────────────────────────────────────────

  const subNavItems: { id: AdminSubTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: Layers },
    {
      id: 'workers',
      label: 'Workers',
      icon: Users,
      badge: overview?.pending_verifications_count || undefined
    },
    { id: 'bookings', label: 'Bookings', icon: Briefcase },
    { id: 'pricing', label: 'Pricing', icon: Sliders },
    { id: 'welfare', label: 'Welfare', icon: HeartHandshake },
    {
      id: 'grievances',
      label: 'Grievances',
      icon: AlertOctagon,
      badge: overview?.open_grievances_count || undefined
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
  ];

  const filteredBookings = bookingFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === bookingFilter);

  const filteredGrievances = grievanceFilter === 'all'
    ? grievances
    : grievances.filter((g) => g.status === grievanceFilter);

  return (
    <div className="space-y-6">
      {/* 🔴 HIGHEST PRIORITY SOS EMERGENCY QUEUE (ALWAYS PINNED AT TOP) */}
      <AdminSOSQueue />

      {/* Hero Governance Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#171717] text-white border border-[#2A2A2A] p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-[#9A5B3A] text-white shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight font-display">Cooperative Governance Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFFFFF]/10 text-[#EFE2D2] border border-[#FFFFFF]/20 text-[10px] font-bold uppercase tracking-wider">
                  Democratic Guild
                </span>
              </div>
              <p className="text-xs text-[#EFE2D2]/80 mt-0.5">
                Logged in as <strong className="text-white">{currentUser.full_name}</strong> • 100% Democratic Dividend Control • 85/10/5 Revenue Rule Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadOverview();
                if (activeTab === 'workers') loadPendingWorkers();
                if (activeTab === 'bookings') loadBookingsData();
                if (activeTab === 'grievances') loadGrievancesData();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-[#FFFFFF]/20"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#C9684A]" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tab Bar */}
        <div className="flex items-center gap-1.5 pt-6 mt-4 border-t border-[#333333] overflow-x-auto">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-[#9A5B3A] text-white shadow-md'
                    : 'bg-[#262626] text-[#EFE2D2]/70 hover:text-white hover:bg-[#333333] border border-[#333333]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#EFE2D2]/70'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-[#9A5B3A]' : 'bg-[#A94A43] text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E0D5C8] shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">Workers Online</span>
                <Users className="w-4 h-4 text-[#527A62]" />
              </div>
              <p className="text-2xl font-black text-[#171717] mt-2 font-mono">
                {loadingOverview ? '...' : overview?.workers_online}
              </p>
              <p className="text-[10px] text-[#527A62] mt-1 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#527A62] animate-pulse"></span>
                <span>{overview?.total_workers || 15} registered members</span>
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E0D5C8] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">Bookings Today</span>
                <Briefcase className="w-4 h-4 text-[#9A5B3A]" />
              </div>
              <p className="text-2xl font-black text-[#171717] mt-2 font-mono">
                {loadingOverview ? '...' : overview?.bookings_today}
              </p>
              <p className="text-[10px] text-[#6F6A63] mt-1">Live dispatch queue</p>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E0D5C8] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">Jobs Completed</span>
                <CheckCircle2 className="w-4 h-4 text-[#527A62]" />
              </div>
              <p className="text-2xl font-black text-[#171717] mt-2 font-mono">
                {loadingOverview ? '...' : overview?.jobs_completed}
              </p>
              <p className="text-[10px] text-[#527A62] mt-1 font-semibold">100% Escrow Payouts</p>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E0D5C8] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">Revenue</span>
                <IndianRupee className="w-4 h-4 text-[#9A5B3A]" />
              </div>
              <p className="text-2xl font-black text-[#9A5B3A] mt-2 font-mono">
                ₹{loadingOverview ? '...' : overview?.total_revenue.toFixed(2)}
              </p>
              <p className="text-[10px] text-[#6F6A63] mt-1">
                Direct: <span className="text-[#527A62] font-bold">₹{overview?.worker_payouts_total.toFixed(2)}</span> (85%)
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E0D5C8] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">Welfare Fund</span>
                <HeartHandshake className="w-4 h-4 text-[#527A62]" />
              </div>
              <p className="text-2xl font-black text-[#527A62] mt-2 font-mono">
                ₹{loadingOverview ? '...' : overview?.welfare_fund_total.toFixed(2)}
              </p>
              <p className="text-[10px] text-[#527A62] mt-1 font-semibold">5% Auto-Allocation</p>
            </div>
          </div>

          {/* Quick Action Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E0D5C8] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#171717] flex items-center gap-2 font-display">
                  <Users className="w-4 h-4 text-[#9A5B3A]" />
                  <span>Pending Worker Verifications</span>
                </h3>
                <span className="badge-warning text-xs">
                  {overview?.pending_verifications_count || 0} Pending
                </span>
              </div>
              <p className="text-xs text-[#6F6A63]">
                Review credential certifications and approve cooperative voting memberships.
              </p>
              <button
                onClick={() => setActiveTab('workers')}
                className="btn-secondary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Go to Worker Verification Queue</span>
                <ChevronRight className="w-4 h-4 text-[#9A5B3A]" />
              </button>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E0D5C8] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#171717] flex items-center gap-2 font-display">
                  <AlertOctagon className="w-4 h-4 text-[#A94A43]" />
                  <span>Open Dispute Tickets</span>
                </h3>
                <span className="badge-error text-xs">
                  {overview?.open_grievances_count || 0} Open
                </span>
              </div>
              <p className="text-xs text-[#6F6A63]">
                Arbitrate customer and worker grievances fairly with guild records.
              </p>
              <button
                onClick={() => setActiveTab('grievances')}
                className="btn-secondary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Go to Grievances Desk</span>
                <ChevronRight className="w-4 h-4 text-[#A94A43]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: WORKER VERIFICATION ────────────────────────────────────── */}
      {activeTab === 'workers' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#171717] font-display">Worker Verification & Membership Queue</h2>
              <p className="text-xs text-[#6F6A63]">Review skill certificates, guild memberships, and approve worker accounts</p>
            </div>
            <button
              onClick={loadPendingWorkers}
              className="p-2 rounded-xl bg-[#EFE2D2] hover:bg-[#E0D5C8] text-[#171717] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loadingWorkers ? (
            <div className="p-12 text-center text-[#6F6A63] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9A5B3A]" />
              <p className="text-xs">Loading pending worker applications...</p>
            </div>
          ) : pendingWorkers.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl p-8 text-center space-y-2 border border-[#E0D5C8] shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#527A62] mx-auto" />
              <h3 className="text-base font-bold text-[#171717] font-display">Queue Empty</h3>
              <p className="text-xs text-[#6F6A63]">All submitted worker verification applications have been processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingWorkers.map((pw) => (
                <div key={pw.id} className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E0D5C8] space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E0D5C8]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EFE2D2] text-[#9A5B3A] font-extrabold text-lg flex items-center justify-center border border-[#E0D5C8]">
                        {pw.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#171717] font-display">{pw.name}</h3>
                          <span className="badge-warning text-[10px] uppercase">
                            {pw.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#6F6A63]">
                          {pw.phone_number} • UPI: <span className="font-mono text-[#171717]">{pw.upi_id}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRejectWorker(pw.id)}
                        disabled={actionWorkerId === pw.id}
                        className="btn-danger py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApproveWorker(pw.id)}
                        disabled={actionWorkerId === pw.id}
                        className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Verify</span>
                      </button>
                    </div>
                  </div>

                  {/* Skills & Guild info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#6F6A63] font-medium">Cooperative Guild:</span>
                      <p className="font-bold text-[#9A5B3A] mt-0.5">{pw.cooperative_membership}</p>
                    </div>

                    <div>
                      <span className="text-[#6F6A63] font-medium">Skills ({pw.skills.length}):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pw.skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-[#F7F3EC] text-[#171717] text-[11px] border border-[#E0D5C8]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[#6F6A63] font-medium">Certifications ({pw.certificates.length}):</span>
                      {pw.certificates.map((c) => (
                        <div key={c.id} className="mt-1 flex items-center gap-1.5 text-[#527A62] font-semibold">
                          <Award className="w-3.5 h-3.5" />
                          <span>{c.title} ({c.issued_year})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: BOOKINGS ────────────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#171717] font-display">Live Booking Management</h2>
              <p className="text-xs text-[#6F6A63]">Monitor dispatch, status progression, and itemised invoices</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['all', 'requested', 'confirmed', 'in_progress', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    bookingFilter === st
                      ? 'bg-[#9A5B3A] text-white'
                      : 'bg-[#FFFFFF] text-[#6F6A63] hover:text-[#171717] border border-[#E0D5C8]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loadingBookings ? (
            <div className="p-12 text-center text-[#6F6A63] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9A5B3A]" />
              <p className="text-xs">Loading live bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl p-8 text-center text-[#6F6A63] border border-[#E0D5C8] shadow-sm">
              No bookings found matching status filter "{bookingFilter}".
            </div>
          ) : (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F3EC] text-[#6F6A63] uppercase font-semibold border-b border-[#E0D5C8]">
                    <tr>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Assigned Worker</th>
                      <th className="p-4">Total Rate</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0D5C8] text-[#171717]">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F7F3EC]/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#9A5B3A]">{b.booking_reference}</td>
                        <td className="p-4 font-bold text-[#171717]">{b.service.name}</td>
                        <td className="p-4">{b.customer.full_name}</td>
                        <td className="p-4 font-medium text-[#6F6A63]">
                          {b.worker ? b.worker.full_name : 'Auto-matching...'}
                        </td>
                        <td className="p-4 font-mono font-bold text-[#527A62]">
                          ₹{b.price.final_price.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            b.status === 'completed' ? 'badge-success'
                            : b.status === 'in_progress' ? 'badge-warning'
                            : 'badge-neutral'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedInvoiceId(b.id)}
                            className="btn-secondary px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#9A5B3A]" />
                            <span>Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: PRICING ─────────────────────────────────────────────────── */}
      {activeTab === 'pricing' && <AdminPricingManager />}

      {/* ─── TAB 5: WELFARE ─────────────────────────────────────────────────── */}
      {activeTab === 'welfare' && <AdminWelfarePanel />}

      {/* ─── TAB 6: GRIEVANCES ──────────────────────────────────────────────── */}
      {activeTab === 'grievances' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#171717] font-display">Dispute & Grievances Desk</h2>
              <p className="text-xs text-[#6F6A63]">Arbitrate customer and worker dispute tickets</p>
            </div>

            <div className="flex items-center gap-1.5">
              {['all', 'open', 'under_review', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setGrievanceFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    grievanceFilter === st
                      ? 'bg-[#A94A43] text-white'
                      : 'bg-[#FFFFFF] text-[#6F6A63] hover:text-[#171717] border border-[#E0D5C8]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loadingGrievances ? (
            <div className="p-12 text-center text-[#6F6A63] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#A94A43]" />
              <p className="text-xs">Loading grievances...</p>
            </div>
          ) : filteredGrievances.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl p-8 text-center text-[#6F6A63] border border-[#E0D5C8] shadow-sm">
              No grievances found for status "{grievanceFilter}".
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGrievances.map((g) => (
                <div key={g.id} className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E0D5C8] space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#9A5B3A]">{g.ticket_reference}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EFE2D2] text-[#9A5B3A]">
                        Reporter: {g.reporter_role} ({g.reporter_name})
                      </span>
                      {g.booking_reference && (
                        <span className="text-xs text-[#6F6A63] font-mono">Ref: {g.booking_reference}</span>
                      )}
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      g.status === 'resolved' ? 'badge-success'
                      : g.status === 'under_review' ? 'badge-warning'
                      : 'badge-error'
                    }`}>
                      {g.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#171717] font-display">{g.subject}</h3>
                    <p className="text-xs text-[#6F6A63] mt-1">{g.description}</p>
                    {g.resolution_notes && (
                      <p className="text-xs text-[#527A62] mt-2 p-2 bg-[#527A62]/10 rounded-lg border border-[#527A62]/30 font-medium">
                        Resolution: {g.resolution_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E0D5C8]">
                    {g.status !== 'under_review' && g.status !== 'resolved' && (
                      <button
                        onClick={() => handleGrievanceStatusChange(g.id, 'under_review')}
                        disabled={resolvingId === g.id}
                        className="btn-secondary px-3 py-1.5 text-xs font-bold"
                      >
                        Mark Under Review
                      </button>
                    )}
                    {g.status !== 'resolved' && (
                      <button
                        onClick={() => handleGrievanceStatusChange(g.id, 'resolved')}
                        disabled={resolvingId === g.id}
                        className="btn-success px-4 py-1.5 text-xs font-bold"
                      >
                        Resolve Dispute
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 7: ANALYTICS ───────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in">
          <AdminAnalyticsCharts />
        </div>
      )}

      {/* ─── TAB 8: DEMAND FORECASTING (PHASE 15) ───────────────────────────── */}
      {activeTab === 'forecast' && (
        <div className="space-y-6 animate-in fade-in">
          <AdminDemandForecastView />
        </div>
      )}

      {/* ─── TAB 9: SECURITY AUDIT LOGS (PHASE 17) ─────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in">
          <AdminAuditLogsView />
        </div>
      )}

      {/* Invoice Inspector Modal */}
      {selectedInvoiceId && (
        <InvoiceModal
          isOpen={Boolean(selectedInvoiceId)}
          bookingId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
};
export default AdminDesktopDashboard;
