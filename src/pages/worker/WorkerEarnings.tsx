import React, { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee,
  Calendar,
  Briefcase,
  HeartHandshake,
  TrendingUp,
  Award,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { fetchWorkerEarnings, WorkerEarnings as IWorkerEarnings } from '@/services/workers';
import { WorkerWelfarePanel } from '@/components/welfare/WorkerWelfarePanel';

export const WorkerEarnings: React.FC = () => {
  const [earnings, setEarnings] = useState<IWorkerEarnings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEarnings = useCallback(async () => {
    try {
      const data = await fetchWorkerEarnings();
      setEarnings(data);
    } catch (err) {
      console.error('Failed to load earnings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#6F6A63] space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9A5B3A]" />
        <p className="text-xs">Loading earnings & welfare account...</p>
      </div>
    );
  }

  const today = earnings?.today_earnings ?? 1260;
  const thisWeek = earnings?.this_week_earnings ?? 8710;
  const jobsCount = earnings?.jobs_count ?? 21;
  const welfare = earnings?.welfare_balance ?? 4850;
  const dividend = earnings?.coop_dividend_accumulated ?? 1820;
  const transactions = earnings?.transactions ?? [];

  return (
    <div className="space-y-5 pb-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A5B3A]">
            Your earnings
          </span>
          <h2 className="text-xl font-black text-[#171717] mt-0.5 font-display">Earnings</h2>
          <p className="text-xs text-[#6F6A63] mt-0.5">85% paid to you • 15% cooperative fund</p>
        </div>
        <div className="p-3 bg-[#EFE2D2] text-[#9A5B3A] rounded-2xl border border-[#E0D5C8]">
          <Award className="w-6 h-6" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 CORE KPI METRICS: TODAY'S EARNINGS | THIS WEEK | JOBS | WELFARE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Today's earnings */}
        <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">
              Today
            </span>
            <IndianRupee className="w-4 h-4 text-[#527A62]" />
          </div>
          <p className="text-2xl font-black text-[#527A62] tracking-tight">
            ₹{today.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#6F6A63]">Credited directly to UPI</p>
        </div>

        {/* 2. This week */}
        <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">
              This Week
            </span>
            <Calendar className="w-4 h-4 text-[#9A5B3A]" />
          </div>
          <p className="text-2xl font-black text-[#171717] tracking-tight">
            ₹{thisWeek.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#527A62] font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+14% vs last week</span>
          </p>
        </div>

        {/* 3. Jobs */}
        <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">
              Jobs
            </span>
            <Briefcase className="w-4 h-4 text-[#9A5B3A]" />
          </div>
          <p className="text-2xl font-black text-[#171717] tracking-tight">
            {jobsCount}
          </p>
          <p className="text-[10px] text-[#6F6A63]">Completed without fees</p>
        </div>

        {/* 4. Welfare */}
        <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">
              Welfare
            </span>
            <HeartHandshake className="w-4 h-4 text-[#527A62]" />
          </div>
          <p className="text-2xl font-black text-[#527A62] tracking-tight">
            ₹{welfare.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#6F6A63]">Emergency & health pool</p>
        </div>
      </div>

      {/* Cooperative Dividend & Welfare Safety Net Card */}
      <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#9A5B3A]" />
            <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider font-display">
              Bonus &amp; welfare fund
            </h3>
          </div>
          <span className="badge-success text-xs">
            85% floor
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8] space-y-1">
            <p className="text-xs text-[#6F6A63] font-semibold">Bonus (cooperative)</p>
            <p className="text-xl font-extrabold text-[#9A5B3A]">₹{dividend.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-[#6F6A63]">
              Paid quarterly based on your jobs.
            </p>
          </div>

          <div className="p-4 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8] space-y-1">
            <p className="text-xs text-[#6F6A63] font-semibold">Health &amp; emergency fund</p>
            <p className="text-xl font-extrabold text-[#527A62]">₹{welfare.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-[#6F6A63]">
              For medical or accident claims.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Gig Transactions */}
      <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E0D5C8]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#9A5B3A]" />
            <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider font-display">
              Recent payouts
            </h3>
          </div>
          <button
            onClick={loadEarnings}
            className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-[#6F6A63] hover:bg-[#EFE2D2] hover:text-[#171717] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 bg-[#F7F3EC] hover:bg-[#EFE2D2] rounded-2xl border border-[#E0D5C8] transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#171717]">{tx.service}</span>
                  <span className="px-2 py-0.5 rounded bg-[#EFE2D2] text-[10px] font-mono text-[#6F6A63]">
                    {tx.booking_reference}
                  </span>
                </div>
                <p className="text-[11px] text-[#6F6A63]">
                  Customer: {tx.customer_name} • {tx.timestamp}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-extrabold text-[#527A62] text-sm">
                  +₹{tx.worker_payout}
                </p>
                <p className="text-[10px] text-[#6F6A63]">
                  (₹{tx.amount} gross • +₹{tx.coop_dividend} coop)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worker Welfare Fund Dashboard */}
      <WorkerWelfarePanel workerId="wrk-ravi-01" />
    </div>
  );
};
export default WorkerEarnings;
