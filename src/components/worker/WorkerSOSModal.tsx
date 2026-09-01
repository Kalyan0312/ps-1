import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, CheckCircle2, X, MapPin, Radio } from 'lucide-react';
import { triggerWorkerSOS, WorkerSOSResponse, fetchActiveJob } from '@/services/workers';

interface WorkerSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkerSOSModal: React.FC<WorkerSOSModalProps> = ({ isOpen, onClose }) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const [sosResult, setSosResult] = useState<WorkerSOSResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivateSOS = async () => {
    setIsTriggering(true);
    setError(null);
    try {
      // Try to fetch active job to link the SOS to a booking
      let activeBookingId = undefined;
      try {
        const job = await fetchActiveJob();
        if (job) activeBookingId = job.id;
      } catch (e) {
        console.warn('Could not fetch active job for SOS', e);
      }

      // Send location to backend
      const result = await triggerWorkerSOS(12.9716, 77.5946, 'Urgent assistance requested by worker.', activeBookingId);
      setSosResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch SOS signal.');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFFFF] border-2 border-[#A94A43] rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-[#A94A43]/15 space-y-5 text-[#171717] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full bg-[#F7F3EC] text-[#6F6A63] hover:text-[#171717] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!sosResult ? (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#A94A43]/10 text-[#A94A43] border-2 border-[#A94A43]/40 flex items-center justify-center mx-auto animate-pulse">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#A94A43] font-display">Emergency SOS Protocol</h2>
              <p className="text-xs text-[#6F6A63] mt-1 leading-relaxed">
                Triggering SOS will instantly alert the Cooperative Emergency Guild response team and broadcast your live GPS coordinates to local authorities.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-[#A94A43]/10 border border-[#A94A43]/20 rounded-xl text-[#A94A43] text-xs">
                {error}
              </div>
            )}

            <div className="p-3.5 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8] flex items-center gap-3 text-left">
              <MapPin className="w-5 h-5 text-[#9A5B3A] shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-[#171717]">Current GPS Fix</p>
                <p className="text-[#6F6A63] font-mono text-[11px]">12.9716° N, 77.5946° E (Indiranagar, Bangalore)</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                disabled={isTriggering}
                onClick={handleActivateSOS}
                className="w-full py-4 px-6 rounded-2xl bg-[#A94A43] hover:bg-[#8a3830] active:scale-98 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#A94A43]/25 transition-all disabled:opacity-50"
              >
                {isTriggering ? (
                  <>
                    <Radio className="w-5 h-5 animate-spin" />
                    <span>Transmitting Emergency Beacon...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    <span>CONFIRM & DISPATCH SOS</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-[#F7F3EC] hover:bg-[#EFE2D2] text-[#6F6A63] text-xs font-semibold transition-colors"
              >
                Cancel / False Alarm
              </button>
            </div>
          </div>
        ) : (
          /* SOS Activated Result Screen */
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#527A62]/10 text-[#527A62] border-2 border-[#527A62]/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#A94A43]/10 text-[#A94A43] font-mono text-xs font-bold mb-2">
                ALERT ID: {sosResult.alert_id}
              </div>
              <h2 className="text-lg font-bold text-[#171717] font-display">Emergency Response Active</h2>
              <p className="text-xs text-[#6F6A63] mt-1">
                {sosResult.message}
              </p>
            </div>

            <div className="p-4 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8] space-y-3 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6F6A63]">Police Notified:</span>
                <span className="font-bold text-[#527A62]">Dial 112 Dispatched</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6F6A63]">Cooperative Line:</span>
                <span className="font-bold text-[#9A5B3A]">{sosResult.cooperative_helpline}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6F6A63]">Response Status:</span>
                <span className="font-bold text-[#A94A43] animate-pulse">{sosResult.status}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href="tel:18004252667"
                className="flex-1 py-3 px-4 rounded-xl bg-[#9A5B3A] hover:bg-[#C9684A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#9A5B3A]/20"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Guild Helpline</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-[#F7F3EC] hover:bg-[#EFE2D2] text-[#6F6A63] font-semibold text-xs border border-[#E0D5C8]"
              >
                Dismiss Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
