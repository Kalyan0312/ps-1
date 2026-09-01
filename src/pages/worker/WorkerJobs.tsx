import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Wrench
} from 'lucide-react';
import {
  fetchActiveJob,
  advanceJobStatus,
  WorkerActiveJob,
  JobStage
} from '@/services/workers';

export const WorkerJobs: React.FC = () => {
  const [activeJob, setActiveJob] = useState<WorkerActiveJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadJob = useCallback(async () => {
    try {
      const job = await fetchActiveJob();
      setActiveJob(job);
    } catch (err) {
      console.error('Error fetching active job:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleAdvanceStage = async () => {
    if (!activeJob || advancing) return;
    setAdvancing(true);
    try {
      const updated = await advanceJobStatus(activeJob.id);
      setActiveJob(updated);
      if (updated.status === 'done') {
        setSuccessMessage(`Job completed! ₹${updated.worker_payout} added to today's earnings.`);
      } else {
        setSuccessMessage(`Status updated to: ${updated.status.replace('_', ' ').toUpperCase()}`);
      }
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Error advancing job stage:', err);
    } finally {
      setAdvancing(false);
    }
  };

  const stages: { key: JobStage; label: string; step: number }[] = [
    { key: 'assigned', label: 'Assigned', step: 1 },
    { key: 'on_the_way', label: 'On the way', step: 2 },
    { key: 'working', label: 'Working', step: 3 },
    { key: 'done', label: 'Done', step: 4 },
  ];

  const getStageIndex = (stage: JobStage) => {
    switch (stage) {
      case 'assigned':
        return 0;
      case 'on_the_way':
        return 1;
      case 'working':
        return 2;
      case 'done':
        return 3;
      default:
        return 0;
    }
  };

  const currentStageIndex = activeJob ? getStageIndex(activeJob.status) : 0;

  const getActionLabel = (stage: JobStage) => {
    switch (stage) {
      case 'assigned':
        return 'Start travel';
      case 'on_the_way':
        return 'Start work';
      case 'working':
        return 'Finish job';
      case 'done':
        return 'Done';
      default:
        return 'Next';
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#9A5B3A] mx-auto" />
        <p className="text-xs text-[#6F6A63]">Loading active dispatch...</p>
      </div>
    );
  }

  if (!activeJob) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-3xl p-10 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#EFE2D2] text-[#9A5B3A] flex items-center justify-center mx-auto">
          <Wrench className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#171717] font-display">No Active Jobs Right Now</h3>
          <p className="text-xs text-[#6F6A63] mt-1 max-w-sm mx-auto">
            Turn ON your availability on the Home tab to start receiving local service dispatches.
          </p>
        </div>
        <button
          onClick={loadJob}
          className="btn-primary mt-2 text-xs py-2 px-4 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Toast Alert */}
      {successMessage && (
        <div className="p-3.5 bg-[#527A62]/10 border border-[#527A62]/30 rounded-2xl text-[#527A62] text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-[#527A62]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ACTIVE JOB HEADER & STAGE PROGRESS TRACKER */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
        {/* Header Card */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E0D5C8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFE2D2] text-[#9A5B3A] font-mono text-[10px] font-bold uppercase">
                {activeJob.booking_reference}
              </span>
              <span className="text-xs text-[#6F6A63] font-medium">
                {activeJob.scheduled_time}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#171717] mt-1 font-display">
              {activeJob.service} Service
            </h2>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black text-[#527A62]">
              ₹{activeJob.fare}
            </p>
            <p className="text-[10px] text-[#6F6A63] font-semibold">Gross Fare</p>
          </div>
        </div>

        {/* 4 STAGE TRACKER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#6F6A63] px-1">
            <span>Job Lifecycle</span>
            <span className="text-[#9A5B3A] font-mono">
              Stage {currentStageIndex + 1} of 4
            </span>
          </div>

          {/* Visual Step Bar */}
          <div className="grid grid-cols-4 gap-2">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage.key} className="space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isPast
                        ? 'bg-[#527A62]'
                        : isCurrent
                        ? 'bg-[#9A5B3A]'
                        : 'bg-[#EFE2D2]'
                    }`}
                  />
                  <p
                    className={`text-[10px] font-extrabold text-center transition-colors ${
                      isCurrent
                        ? 'text-[#9A5B3A]'
                        : isPast
                        ? 'text-[#527A62]'
                        : 'text-[#6F6A63]'
                    }`}
                  >
                    {stage.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Location & Contact details */}
        <div className="p-4 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-[#EFE2D2] text-[#9A5B3A] mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-[#6F6A63]">Customer & Location</p>
                <p className="font-bold text-[#171717] text-sm">{activeJob.customer_name}</p>
                <p className="text-[#6F6A63] mt-0.5">{activeJob.customer_address}</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-[#9A5B3A] px-2 py-1 bg-[#EFE2D2] rounded-lg shrink-0">
              {activeJob.distance_km} km away
            </span>
          </div>

          {activeJob.notes && (
            <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E0D5C8] text-xs text-[#171717]">
              <span className="font-bold text-[#9A5B3A]">Notes: </span>
              <span>{activeJob.notes}</span>
            </div>
          )}

          {/* Quick Call & Directions Row */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={`tel:${activeJob.customer_phone}`}
              className="btn-secondary flex-1 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#527A62]" />
              <span>Call</span>
            </a>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(activeJob.customer_address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex-1 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5 text-[#9A5B3A]" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>

        {/* Cooperative Transparent Wage Split Card */}
        <div className="p-4 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8] space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#6F6A63]">
            <span>Direct Worker Wage (85%):</span>
            <span className="font-bold text-[#527A62] font-mono">₹{activeJob.worker_payout}</span>
          </div>
          <div className="flex items-center justify-between text-[#6F6A63]">
            <span>Cooperative Dividend Pool (15%):</span>
            <span className="font-bold text-[#9A5B3A] font-mono">₹{activeJob.coop_dividend}</span>
          </div>
        </div>

        {/* Primary CTA: Stage Advancement Button — min 48px */}
        {activeJob.status !== 'done' ? (
          <button
            type="button"
            disabled={advancing}
            onClick={handleAdvanceStage}
            className="btn-primary w-full text-sm font-extrabold shadow-md"
          >
            <span>{advancing ? 'Updating...' : getActionLabel(activeJob.status)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-[#527A62]/10 border border-[#527A62]/30 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-[#527A62] mx-auto" />
            <p className="font-bold text-sm text-[#527A62]">Job complete</p>
            <p className="text-[11px] text-[#6F6A63]">Wage added to your earnings.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default WorkerJobs;
