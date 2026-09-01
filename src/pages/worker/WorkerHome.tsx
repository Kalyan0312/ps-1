import React, { useState, useEffect, useCallback } from 'react';
import {
  Power,
  TrendingUp,
  Briefcase,
  Star,
  MapPin,
  Check,
  X,
  IndianRupee,
  ShieldCheck,
  Radio,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  fetchWorkerStatus,
  toggleWorkerAvailability,
  fetchIncomingJobRequest,
  acceptJobRequest,
  declineJobRequest,
  WorkerStatus,
  WorkerJobRequest
} from '@/services/workers';
import { useRealtimeEvent } from '@/contexts/RealtimeContext';

interface WorkerHomeProps {
  onGoToJobs: () => void;
}

export const WorkerHome: React.FC<WorkerHomeProps> = ({ onGoToJobs }) => {
  const [status, setStatus] = useState<WorkerStatus | null>(null);
  const [jobRequest, setJobRequest] = useState<WorkerJobRequest | null>(null);
  const [, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [s, req] = await Promise.all([
        fetchWorkerStatus(),
        fetchIncomingJobRequest().catch(() => null)
      ]);
      setStatus(s);
      setJobRequest(req);
    } catch (err) {
      console.error('Error loading worker home data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-Time Job Dispatch
  useRealtimeEvent('booking.created', () => {
    loadData();
  });

  const handleToggle = async () => {
    if (!status || toggling) return;
    setToggling(true);
    try {
      const updated = await toggleWorkerAvailability(!status.is_available);
      setStatus(updated);
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleAccept = async () => {
    if (!jobRequest) return;
    setActionLoading(true);
    try {
      await acceptJobRequest(jobRequest.id);
      setJobRequest(null);
      setActionMessage('Job accepted! Routing to Active Jobs view...');
      setTimeout(() => {
        setActionMessage(null);
        onGoToJobs();
      }, 1000);
    } catch (err: any) {
      console.error('Accept error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!jobRequest) return;
    setActionLoading(true);
    try {
      await declineJobRequest(jobRequest.id);
      setJobRequest(null);
      setActionMessage('Request declined. Zero penalties applied.');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      console.error('Decline error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const isAvailable = status?.is_available ?? true;

  return (
    <div className="space-y-5 pb-6">
      {/* Toast Alert message */}
      {actionMessage && (
        <div className="p-3.5 bg-[#527A62]/10 border border-[#527A62]/30 rounded-2xl text-[#527A62] text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#527A62]" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO: "AVAILABLE FOR WORK" (Large ON/OFF Toggle) */}
      {/* ========================================================================= */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 border shadow-sm ${
          isAvailable
            ? 'bg-[#171717] text-white border-[#2A2A2A]'
            : 'bg-[#FFFFFF] text-[#171717] border-[#E0D5C8]'
        }`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1.5">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isAvailable
                ? 'bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 text-[#527A62]'
                : 'bg-[#EFE2D2] border border-[#E0D5C8] text-[#6F6A63]'
            }`}>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAvailable ? 'bg-[#527A62] animate-pulse' : 'bg-[#6F6A63]'
                }`}
              />
              <span className={isAvailable ? 'text-[#527A62]' : 'text-[#6F6A63]'}>
                {isAvailable ? 'Online' : 'Offline'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-display">
              {isAvailable ? 'Available' : 'Go online'}
            </h2>
            <p className={`text-xs max-w-xs ${isAvailable ? 'text-[#EFE2D2]/80' : 'text-[#6F6A63]'}`}>
              {isAvailable
                ? 'You will receive job requests in your area.'
                : 'Turn on to receive jobs with 85%+ direct pay.'}
            </p>
          </div>

          {/* Large Tactile ON/OFF Toggle Button */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            aria-label="Toggle Available for Work"
            className={`group relative flex items-center justify-between p-2 rounded-full w-48 h-20 transition-all duration-300 shadow-inner focus:outline-none select-none ${
              isAvailable
                ? 'bg-[#9A5B3A] border-2 border-[#C9684A] shadow-[#9A5B3A]/30'
                : 'bg-[#EFE2D2] border-2 border-[#C9A07A]'
            }`}
          >
            {/* Left Status Label */}
            <span
              className={`text-xs font-black uppercase tracking-wider pl-4 transition-colors ${
                isAvailable ? 'text-white' : 'text-[#6F6A63]'
              }`}
            >
              {isAvailable ? 'READY' : 'OFF'}
            </span>

            {/* Sliding Giant Thumb Switch */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 shadow-lg transform ${
                isAvailable
                  ? 'translate-x-0 bg-[#FFFFFF] text-[#9A5B3A] scale-105'
                  : '-translate-x-24 bg-[#6F6A63] text-white'
              }`}
            >
              <Power
                className={`w-7 h-7 transition-transform ${
                  isAvailable ? 'rotate-0 text-[#9A5B3A] font-bold' : 'rotate-180 text-white'
                }`}
              />
            </div>

            {/* Right Status Label */}
            <span
              className={`text-xs font-black uppercase tracking-wider pr-4 transition-colors ${
                !isAvailable ? 'text-[#6F6A63]' : 'text-white/60'
              }`}
            >
              {isAvailable ? 'ON' : 'IDLE'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY METRICS: TODAY'S EARNINGS | JOBS TODAY | RATING */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-3 gap-3">
        {/* Today's Earnings */}
        <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">
              Today's Earnings
            </span>
            <div className="p-1.5 rounded-lg bg-[#527A62]/10 text-[#527A62]">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              ₹{status?.today_earnings.toLocaleString('en-IN') ?? '1,260'}
            </p>
            <p className="text-[10px] font-semibold text-[#527A62] mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>85% direct wage</span>
            </p>
          </div>
        </div>

        {/* Jobs Today */}
        <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">
              Jobs Today
            </span>
            <div className="p-1.5 rounded-lg bg-[#9A5B3A]/10 text-[#9A5B3A]">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              {status?.jobs_today ?? 3}
            </p>
            <p className="text-[10px] font-semibold text-[#9A5B3A] mt-0.5">
              0 penalties
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6F6A63] uppercase tracking-wider">
              Rating
            </span>
            <div className="p-1.5 rounded-lg bg-[#9A5B3A]/10 text-[#9A5B3A]">
              <Star className="w-3.5 h-3.5 fill-[#9A5B3A]" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-[#9A5B3A] tracking-tight">
              {status?.rating ?? 4.92} ★
            </p>
            <p className="text-[10px] font-semibold text-[#6F6A63] mt-0.5">
              Verified 136 reviews
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. JOB REQUEST CARD */}
      {/* ========================================================================= */}
      {jobRequest && isAvailable ? (
        <div className="bg-[#FFFFFF] border-2 border-[#9A5B3A] rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          {/* Header of Request */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E0D5C8]">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#9A5B3A] animate-ping" />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A5B3A]">
                  New job request
                </span>
                <h3 className="text-lg font-black text-[#171717] font-display">
                  {jobRequest.service}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-[#527A62]">
                ₹{jobRequest.fare}
              </span>
              <p className="text-[10px] text-[#6F6A63] font-semibold">Guaranteed Payout</p>
            </div>
          </div>

          {/* Details Row */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-[#F7F3EC] rounded-xl border border-[#E0D5C8]">
              <div className="flex items-center gap-2 text-[#6F6A63] font-medium">
                <MapPin className="w-4 h-4 text-[#9A5B3A] shrink-0" />
                <span>Distance to Customer</span>
              </div>
              <span className="font-extrabold text-[#171717] text-sm font-mono">
                {jobRequest.distance_km} km
              </span>
            </div>

            <div className="p-3 bg-[#F7F3EC] rounded-xl border border-[#E0D5C8] space-y-1">
              <p className="text-[11px] text-[#6F6A63] font-semibold">Service Location</p>
              <p className="text-[#171717] font-medium">{jobRequest.customer_address}</p>
              {jobRequest.notes && (
                <p className="text-[11px] text-[#9A5B3A] pt-1 italic">
                  "{jobRequest.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: ACCEPT / DECLINE — min 48px */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleDecline}
              className="btn-danger min-h-[52px] text-sm font-bold flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              <span>Decline</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={handleAccept}
              className="btn-primary min-h-[52px] text-sm font-bold flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Accept (₹{jobRequest.fare})</span>
            </button>
          </div>
        </div>
      ) : isAvailable ? (
        /* Standby Searching State */
        <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-3xl p-6 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#EFE2D2] text-[#9A5B3A] flex items-center justify-center mx-auto animate-pulse">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#171717] text-sm font-display">Looking for jobs</h3>
            <p className="text-xs text-[#6F6A63] mt-0.5">
              Waiting for job requests in your area.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="btn-secondary text-xs py-2.5 px-4 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      ) : null}

      {/* Cooperative Safety & Fair Direct Guarantee */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E0D5C8] flex items-center justify-between text-xs text-[#6F6A63] shadow-sm">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#527A62] shrink-0" />
          <span>85% pay floor • No penalties for declining</span>
        </div>
        <button
          type="button"
          onClick={onGoToJobs}
          className="text-[#9A5B3A] hover:underline font-bold flex items-center gap-1 shrink-0 min-h-[48px] px-2"
        >
          <span>Active job</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
export default WorkerHome;
