import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  ShieldAlert,
  RefreshCw,
  Sparkles,
  PieChart,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  fetchAdminChartsData,
  AdminChartsDataResponse,
  DailyRequestPoint
} from '@/services/admin';

export const AdminAnalyticsCharts: React.FC = () => {
  const [data, setData] = useState<AdminChartsDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<DailyRequestPoint | null>(null);

  const loadCharts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminChartsData();
      setData(res);
      if (res.daily_work_requests.length > 0) {
        setHoveredDay(res.daily_work_requests[res.daily_work_requests.length - 1]);
      }
    } catch (err: any) {
      console.error('Failed to load admin analytics charts:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-[#6F6A63] space-y-3 bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#9A5B3A]" />
        <p className="text-sm font-medium">Aggregating live platform database analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-[#A94A43]/10 border border-[#A94A43]/30 text-[#A94A43] space-y-3">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-[#A94A43]" />
          <h4 className="font-bold text-sm">Error Loading Analytics</h4>
        </div>
        <p className="text-xs">{error || 'Unknown error occurred'}</p>
        <button
          onClick={loadCharts}
          className="btn-danger py-1.5 px-4 text-xs font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { provenance, daily_work_requests, revenue_split, grievance_sos_volume, worker_verification_status } = data;
  const maxRequests = Math.max(...daily_work_requests.map((d) => d.total_requests), 1);
  const totalCompleted = daily_work_requests.reduce((acc, curr) => acc + curr.completed, 0);
  const totalRequests = daily_work_requests.reduce((acc, curr) => acc + curr.total_requests, 0);
  const completionRate = Math.round((totalCompleted / Math.max(1, totalRequests)) * 100);

  return (
    <div className="space-y-6">
      {/* ─── DATA PROVENANCE BANNER ────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl border border-[#E0D5C8] bg-[#FFFFFF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#EFE2D2] text-[#9A5B3A]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#171717] font-display">{provenance.label}</h4>
              <span className="badge-warning text-[10px]">
                {provenance.source}
              </span>
            </div>
            <p className="text-xs text-[#6F6A63] mt-0.5">{provenance.note}</p>
          </div>
        </div>
        <button
          onClick={loadCharts}
          className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold self-end sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      {/* ─── ROW 1: REVENUE SPLIT (85 / 10 / 5) ─────────────────────────────── */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E0D5C8]">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#527A62]" />
              <h3 className="font-bold text-base text-[#171717] font-display">Cooperative Revenue Split (Rule 85 / 10 / 5)</h3>
            </div>
            <p className="text-xs text-[#6F6A63] mt-0.5">
              100% Transparent algorithmic distribution of every rupee generated across the platform
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#6F6A63] font-medium">Total Platform Volume (7-Day)</span>
            <p className="text-2xl font-black text-[#171717] font-mono">
              ₹{revenue_split.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Multi-segment Split Bar */}
        <div className="space-y-2">
          <div className="h-7 rounded-xl bg-[#F7F3EC] p-1 flex gap-1 font-mono text-[11px] font-bold text-white shadow-inner border border-[#E0D5C8]">
            <div
              style={{ width: '85%' }}
              className="bg-[#527A62] rounded-lg flex items-center justify-center transition-all"
              title="85% Worker Direct Wage Share"
            >
              85% Worker Payouts
            </div>
            <div
              style={{ width: '10%' }}
              className="bg-[#9A5B3A] rounded-lg flex items-center justify-center transition-all"
              title="10% Cooperative Operating Fee"
            >
              10% Coop
            </div>
            <div
              style={{ width: '5%' }}
              className="bg-[#C9684A] rounded-lg flex items-center justify-center transition-all"
              title="5% Welfare & Insurance Pool"
            >
              5%
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#527A62]/10 border border-[#527A62]/30 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#527A62]">Worker Wage Share (85%)</span>
              <span className="badge-success text-[10px]">Direct Payout</span>
            </div>
            <p className="text-xl font-black text-[#527A62] mt-2 font-mono">
              ₹{revenue_split.worker_earnings_85.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-[#6F6A63] mt-1">Disbursed instantly via UPI escrow to verified workers</p>
          </div>

          <div className="p-4 rounded-xl bg-[#9A5B3A]/10 border border-[#9A5B3A]/30 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#9A5B3A]">Cooperative Fee (10%)</span>
              <span className="badge-warning text-[10px]">Guild Treasury</span>
            </div>
            <p className="text-xl font-black text-[#9A5B3A] mt-2 font-mono">
              ₹{revenue_split.cooperative_fee_10.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-[#6F6A63] mt-1">Server infra, spatial dispatch, and annual dividend pool</p>
          </div>

          <div className="p-4 rounded-xl bg-[#527A62]/10 border border-[#527A62]/30 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#527A62]">Welfare Fund (5%)</span>
              <span className="badge-success text-[10px]">Safety Net</span>
            </div>
            <p className="text-xl font-black text-[#527A62] mt-2 font-mono">
              ₹{revenue_split.welfare_contribution_5.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-[#6F6A63] mt-1">Accident micro-insurance, emergency grants & healthcare</p>
          </div>
        </div>
      </div>

      {/* ─── ROW 2: DAILY WORK REQUESTS & JOBS COMPLETED CHART ──────────────── */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#9A5B3A]" />
              <h3 className="font-bold text-base text-[#171717] font-display">Daily Work Requests & Completed Jobs</h3>
            </div>
            <p className="text-xs text-[#6F6A63] mt-0.5">7-Day incoming request volume vs. completed gig execution</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#C9684A]" />
              <span className="text-[#6F6A63]">Requests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#527A62]" />
              <span className="text-[#6F6A63]">Completed</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[#527A62]/10 border border-[#527A62]/30 text-[#527A62] font-mono">
              {completionRate}% Completion Rate
            </div>
          </div>
        </div>

        {/* Interactive SVG Bar & Trend Chart */}
        <div className="space-y-4">
          <div className="h-56 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-[#E0D5C8]">
            {daily_work_requests.map((point) => {
              const reqHeight = Math.round((point.total_requests / maxRequests) * 100);
              const compHeight = Math.round((point.completed / maxRequests) * 100);
              const isHovered = hoveredDay?.date === point.date;

              return (
                <div
                  key={point.date}
                  onMouseEnter={() => setHoveredDay(point)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  <div className="w-full flex justify-center items-end gap-1 h-full">
                    {/* Requests Bar */}
                    <div
                      style={{ height: `${reqHeight}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                        isHovered ? 'bg-[#9A5B3A]' : 'bg-[#C9684A]/70 group-hover:bg-[#9A5B3A]'
                      }`}
                    />
                    {/* Completed Bar */}
                    <div
                      style={{ height: `${compHeight}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                        isHovered ? 'bg-[#527A62]' : 'bg-[#527A62]/80 group-hover:bg-[#527A62]'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`text-[11px] font-bold mt-2 transition-colors ${
                    isHovered ? 'text-[#171717]' : 'text-[#6F6A63]'
                  }`}>
                    {point.day_name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hover Inspection Inspector Bar */}
          {hoveredDay && (
            <div className="p-3.5 rounded-xl bg-[#F7F3EC] border border-[#E0D5C8] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#6F6A63]" />
                <span className="font-bold text-[#171717]">{hoveredDay.day_name} ({hoveredDay.date})</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[#6F6A63]">Total Requests:</span>{' '}
                  <span className="font-bold text-[#C9684A]">{hoveredDay.total_requests}</span>
                </div>
                <div>
                  <span className="text-[#6F6A63]">Completed:</span>{' '}
                  <span className="font-bold text-[#527A62]">{hoveredDay.completed}</span>
                </div>
                <div>
                  <span className="text-[#6F6A63]">Cancelled:</span>{' '}
                  <span className="font-bold text-[#A94A43]">{hoveredDay.cancelled}</span>
                </div>
                <div>
                  <span className="text-[#6F6A63]">Fulfillment:</span>{' '}
                  <span className="font-bold text-[#9A5B3A]">
                    {Math.round((hoveredDay.completed / hoveredDay.total_requests) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── ROW 3: TWO COLUMNS (GRIEVANCES/SOS & WORKER VERIFICATION) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grievance & SOS Volume */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0D5C8]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#9A5B3A]" />
              <h3 className="font-bold text-base text-[#171717] font-display">Grievance & SOS Volume</h3>
            </div>
            <span className="badge-success text-[10px]">
              {grievance_sos_volume.resolution_rate_percent}% Resolved
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#F7F3EC] border border-[#E0D5C8] text-center">
              <span className="text-[10px] font-bold text-[#6F6A63] uppercase">Open Disputes</span>
              <p className="text-xl font-black text-[#A94A43] mt-1 font-mono">
                {grievance_sos_volume.open_grievances}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F3EC] border border-[#E0D5C8] text-center">
              <span className="text-[10px] font-bold text-[#6F6A63] uppercase">Under Review</span>
              <p className="text-xl font-black text-[#9A5B3A] mt-1 font-mono">
                {grievance_sos_volume.under_review_grievances}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F3EC] border border-[#E0D5C8] text-center">
              <span className="text-[10px] font-bold text-[#6F6A63] uppercase">Resolved</span>
              <p className="text-xl font-black text-[#527A62] mt-1 font-mono">
                {grievance_sos_volume.resolved_grievances}
              </p>
            </div>
          </div>

          {/* SOS Indicator */}
          <div className="p-3 rounded-xl bg-[#A94A43]/10 border border-[#A94A43]/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertOctagon className="w-4 h-4 text-[#A94A43]" />
              <span className="text-xs font-semibold text-[#A94A43]">Active Emergency SOS Alerts:</span>
            </div>
            <span className="text-sm font-black text-[#A94A43] font-mono">
              {grievance_sos_volume.active_sos_alerts} Active ({grievance_sos_volume.resolved_sos_alerts} Resolved)
            </span>
          </div>

          {/* Event Stream */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#6F6A63]">Recent Incident Log</span>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {grievance_sos_volume.recent_events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-xl bg-[#F7F3EC] border border-[#E0D5C8] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#171717] line-clamp-1">{evt.title}</p>
                    <span className="text-[10px] text-[#6F6A63] font-mono">
                      {evt.reference || evt.id} • {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    evt.status === 'resolved' ? 'badge-success'
                    : evt.status === 'under_review' ? 'badge-warning'
                    : 'badge-error'
                  }`}>
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Worker Verification Status */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0D5C8]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#527A62]" />
              <h3 className="font-bold text-base text-[#171717] font-display">Worker Verification & Guild Roster</h3>
            </div>
            <span className="badge-success text-[10px] font-mono">
              {worker_verification_status.verification_rate_percent}% Verified
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#527A62]/10 border border-[#527A62]/30 text-center">
              <span className="text-[10px] font-bold text-[#527A62] uppercase">Active Verified</span>
              <p className="text-xl font-black text-[#527A62] mt-1 font-mono">
                {worker_verification_status.verified_active_count}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#9A5B3A]/10 border border-[#9A5B3A]/30 text-center">
              <span className="text-[10px] font-bold text-[#9A5B3A] uppercase">Pending Review</span>
              <p className="text-xl font-black text-[#9A5B3A] mt-1 font-mono">
                {worker_verification_status.pending_review_count}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#A94A43]/10 border border-[#A94A43]/30 text-center">
              <span className="text-[10px] font-bold text-[#A94A43] uppercase">Rejected</span>
              <p className="text-xl font-black text-[#A94A43] mt-1 font-mono">
                {worker_verification_status.rejected_count}
              </p>
            </div>
          </div>

          {/* Skill Distribution Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#6F6A63]">Trade & Skill Distribution</span>
            <div className="space-y-2">
              {worker_verification_status.skills_distribution.map((item) => (
                <div key={item.skill_name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#171717] font-medium">{item.skill_name}</span>
                    <span className="text-[#6F6A63] font-mono">{item.worker_count} members ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EFE2D2] overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="h-full bg-[#9A5B3A] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminAnalyticsCharts;
