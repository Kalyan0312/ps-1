import React, { useState, useEffect, useCallback } from 'react';
import {
  HeartHandshake,
  RefreshCw
} from 'lucide-react';
import { fetchWorkerWelfare, WorkerWelfareDashboard as IWorkerWelfare } from '@/services/community';

interface WorkerWelfarePanelProps {
  workerId: string;
}

export const WorkerWelfarePanel: React.FC<WorkerWelfarePanelProps> = ({ workerId }) => {
  const [welfare, setWelfare] = useState<IWorkerWelfare | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWelfare = useCallback(async () => {
    try {
      const data = await fetchWorkerWelfare(workerId);
      setWelfare(data);
    } catch (err) {
      console.error('Failed to load welfare:', err);
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    loadWelfare();
  }, [loadWelfare]);

  if (loading) {
    return (
      <div className="p-6 text-center text-[#6F6A63] space-y-2">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#9A5B3A]" />
        <p className="text-xs">Loading welfare fund...</p>
      </div>
    );
  }

  const total = welfare?.total_welfare_balance ?? 0;
  const thisMonth = welfare?.this_month_contributions ?? 0;
  const history = welfare?.history ?? [];

  return (
    <div className="space-y-4">
      {/* Welfare Header */}
      <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-[#527A62]/10 text-[#527A62] border border-[#527A62]/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#171717] font-display">Welfare & Safety Fund</h3>
            <p className="text-[10px] text-[#6F6A63]">Healthcare, insurance, emergency claims</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F7F3EC] p-3 rounded-xl border border-[#E0D5C8]">
            <p className="text-[10px] text-[#6F6A63] uppercase font-semibold">Total Welfare Share</p>
            <p className="text-lg font-bold text-[#527A62] font-mono">₹{total.toLocaleString('en-IN')}</p>
            <p className="text-[9px] text-[#6F6A63]">Covered for healthcare & claims</p>
          </div>
          <div className="bg-[#F7F3EC] p-3 rounded-xl border border-[#E0D5C8]">
            <p className="text-[10px] text-[#6F6A63] uppercase font-semibold">This Month (5%)</p>
            <p className="text-lg font-bold text-[#9A5B3A] font-mono">₹{thisMonth.toLocaleString('en-IN')}</p>
            <p className="text-[9px] text-[#527A62] font-semibold">Auto-credited per booking</p>
          </div>
        </div>
      </div>

      {/* Welfare Contribution History */}
      {history.length > 0 && (
        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E0D5C8] space-y-2 shadow-sm">
          <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider font-display">Recent 5% Allocations</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-[#F7F3EC] text-xs">
                <div>
                  <p className="font-semibold text-[#171717]">{h.description || h.worker_name}</p>
                  <p className="text-[10px] text-[#6F6A63] font-mono">{h.booking_reference}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#527A62] font-mono">+₹{h.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-[#6F6A63]">{h.created_at}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default WorkerWelfarePanel;
