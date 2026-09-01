import React, { useState, useEffect, useCallback } from 'react';
import {
  HeartHandshake,
  TrendingUp,
  RefreshCw,
  FileText
} from 'lucide-react';
import { fetchAdminWelfare, AdminWelfareDashboard as IAdminWelfare } from '@/services/community';

export const AdminWelfarePanel: React.FC = () => {
  const [welfare, setWelfare] = useState<IAdminWelfare | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWelfare = useCallback(async () => {
    try {
      const data = await fetchAdminWelfare();
      setWelfare(data);
    } catch (err) {
      console.error('Failed to load admin welfare:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWelfare();
  }, [loadWelfare]);

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-8 text-center space-y-2 border border-[#E0D5C8] shadow-sm">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9A5B3A]" />
        <p className="text-xs text-[#6F6A63]">Loading welfare dashboard...</p>
      </div>
    );
  }

  const fund = welfare?.total_welfare_fund ?? 0;
  const inflows = welfare?.total_inflows ?? 0;
  const claimsPaid = welfare?.total_claims_paid ?? 0;
  const pendingCount = welfare?.pending_claims_count ?? 0;
  const pendingAmount = welfare?.pending_claims_amount ?? 0;
  const inflowHistory = welfare?.inflows ?? [];
  const claims = welfare?.claims ?? [];

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E0D5C8] space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#527A62]/10 text-[#527A62] border border-[#527A62]/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#171717] font-display">Worker Welfare & Safety Fund</h2>
            <p className="text-xs text-[#6F6A63]">Healthcare, insurance, emergency claims — auto-funded by 5% of each booking</p>
          </div>
        </div>
        <button
          onClick={loadWelfare}
          className="p-2 rounded-xl bg-[#EFE2D2] text-[#6F6A63] hover:text-[#171717] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Welfare Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#F7F3EC] p-4 rounded-xl border border-[#E0D5C8]">
          <p className="text-[11px] text-[#6F6A63] uppercase font-semibold">Total Welfare Pool</p>
          <p className="text-xl font-bold text-[#527A62] mt-1 font-mono">₹{fund.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-[#6F6A63] mt-0.5">Liquid reserve balance</p>
        </div>
        <div className="bg-[#F7F3EC] p-4 rounded-xl border border-[#E0D5C8]">
          <p className="text-[11px] text-[#6F6A63] uppercase font-semibold">Total Inflows (5%)</p>
          <p className="text-xl font-bold text-[#9A5B3A] mt-1 font-mono">₹{inflows.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-[#6F6A63] mt-0.5">Cumulative dividend cut</p>
        </div>
        <div className="bg-[#F7F3EC] p-4 rounded-xl border border-[#E0D5C8]">
          <p className="text-[11px] text-[#6F6A63] uppercase font-semibold">Claims Paid</p>
          <p className="text-xl font-bold text-[#171717] mt-1 font-mono">₹{claimsPaid.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-[#527A62] mt-0.5">100% verified disbursed</p>
        </div>
        <div className="bg-[#F7F3EC] p-4 rounded-xl border border-[#E0D5C8]">
          <p className="text-[11px] text-[#6F6A63] uppercase font-semibold">Pending Claims</p>
          <p className="text-xl font-bold text-[#A94A43] mt-1 font-mono">{pendingCount} (₹{pendingAmount.toLocaleString('en-IN')})</p>
          <p className="text-[10px] text-[#A94A43] mt-0.5 font-medium">Requires council sign-off</p>
        </div>
      </div>

      {/* Two columns: Inflow History & Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
        {/* Inflow History */}
        <div className="bg-[#F7F3EC] rounded-xl p-4 border border-[#E0D5C8] space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#527A62]" />
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider font-display">Recent 5% Inflows</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {inflowHistory.map((inf) => (
              <div key={inf.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E0D5C8] text-xs">
                <div>
                  <p className="font-semibold text-[#171717]">{inf.description || inf.worker_name}</p>
                  <p className="text-[10px] text-[#6F6A63] font-mono">Ref: {inf.booking_reference}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#527A62] font-mono">+₹{inf.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-[#6F6A63]">{inf.created_at}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Claims Ledger */}
        <div className="bg-[#F7F3EC] rounded-xl p-4 border border-[#E0D5C8] space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#9A5B3A]" />
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider font-display">Welfare Claims Ledger</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {claims.map((cl) => (
              <div key={cl.id} className="p-2.5 rounded-lg bg-white border border-[#E0D5C8] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#171717]">{cl.worker_name} — <span className="text-[#9A5B3A]">{cl.claim_type}</span></p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    cl.status === 'approved' ? 'badge-success'
                    : cl.status === 'pending' ? 'badge-warning'
                    : 'badge-error'
                  }`}>
                    {cl.status}
                  </span>
                </div>
                <p className="text-[#6F6A63] text-[11px]">{cl.description}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-[#6F6A63]">
                  <span>Claim Amount: <strong className="text-[#171717] font-mono">₹{cl.amount.toLocaleString('en-IN')}</strong></span>
                  <span>{cl.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminWelfarePanel;
