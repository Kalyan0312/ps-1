import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  Video,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { NearbyWorker, fetchNearbyWorkers, requestRemoteAdvisor, RemoteAdvisorSession } from '@/services/workers';

interface WorkerMapViewProps {
  serviceName: string;
  onSelectWorker: (worker: NearbyWorker) => void;
  onCancel: () => void;
}

export const WorkerMapView: React.FC<WorkerMapViewProps> = ({
  serviceName,
  onSelectWorker,
  onCancel,
}) => {
  const [workers, setWorkers] = useState<NearbyWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [advisorSession, setAdvisorSession] = useState<RemoteAdvisorSession | null>(null);
  const [connectingAdvisor, setConnectingAdvisor] = useState(false);
  const [radius, setRadius] = useState<number>(5.0);

  const loadWorkers = (rad = radius) => {
    setLoading(true);
    fetchNearbyWorkers(serviceName, 12.9716, 77.5946, rad)
      .then((data) => {
        setWorkers(data.workers);
        if (data.workers.length > 0) {
          setSelectedWorkerId(data.workers[0].worker_id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadWorkers();
  }, [serviceName]);

  const handleRemoteAdvisor = async () => {
    setConnectingAdvisor(true);
    try {
      const session = await requestRemoteAdvisor(serviceName, `Need remote assistance for ${serviceName}`);
      setAdvisorSession(session);
    } catch (e) {
      alert('Could not initiate Remote Advisor session.');
    } finally {
      setConnectingAdvisor(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#171717] tracking-tight font-display">
            Nearby {serviceName}s
          </h2>
          <p className="text-xs text-[#6F6A63]">
            PostGIS spatial radar within {radius} km
          </p>
        </div>

        {/* Radius Toggle */}
        <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-xl border border-[#EFE2D2] text-[11px] font-bold">
          {[3.0, 5.0, 10.0].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRadius(r);
                loadWorkers(r);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                radius === r
                  ? 'bg-[#9A5B3A] text-white'
                  : 'text-[#6F6A63] hover:text-[#171717]'
              }`}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      {/* Visual Interactive Map Canvas */}
      <div className="relative w-full h-56 rounded-3xl overflow-hidden bg-[#EFE2D2] border border-[#EFE2D2] shadow-inner flex items-center justify-center">
        {/* Map Grid Pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(#9A5B3A 1px, transparent 1px), radial-gradient(#9A5B3A 1px, #EFE2D2 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        ></div>

        {/* Radius Circle */}
        <div className="w-44 h-44 rounded-full border-2 border-dashed border-[#9A5B3A]/40 animate-spin-slow absolute pointer-events-none"></div>

        {/* Center Customer Location Pin */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shadow-xl shadow-black/20 ring-4 ring-white">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-[10px] font-extrabold bg-[#171717] text-white px-2 py-0.5 rounded-full mt-1 shadow-md">
            You (Indiranagar)
          </span>
        </div>

        {/* Dynamic Worker Markers */}
        {workers.map((w, index) => {
          const isSelected = selectedWorkerId === w.worker_id;
          // Calculate visual offsets based on distance and index
          const angle = (index * 360) / Math.max(1, workers.length);
          const radDist = Math.min(75, 25 + w.distance_km * 18);
          const x = Math.cos((angle * Math.PI) / 180) * radDist;
          const y = Math.sin((angle * Math.PI) / 180) * radDist;

          return (
            <button
              key={w.worker_id}
              onClick={() => setSelectedWorkerId(w.worker_id)}
              style={{
                transform: `translate(${x}px, ${y}px)`
              }}
              className={`absolute z-20 transition-all duration-300 flex flex-col items-center ${
                isSelected ? 'scale-115 z-30' : 'hover:scale-110 opacity-90'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shadow-lg transition-all ${
                  isSelected
                    ? 'bg-[#9A5B3A] text-white ring-4 ring-white shadow-[#9A5B3A]/50'
                    : 'bg-[#FFFFFF] text-[#171717] border border-[#EFE2D2]'
                }`}
              >
                {w.name.charAt(0)}
              </div>
              <span className="text-[9px] font-bold bg-[#FFFFFF] text-[#171717] px-1.5 py-0.2 rounded-md shadow-sm border border-[#EFE2D2] mt-0.5">
                {w.distance_km}km
              </span>
            </button>
          );
        })}
      </div>

      {/* WORKERS LIST OR EMPTY STATE */}
      {loading ? (
        <div className="py-8 text-center text-xs text-[#6F6A63] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#9A5B3A]" />
          <span>Searching PostGIS geographic index...</span>
        </div>
      ) : workers.length === 0 ? (
        /* "NO WORKERS NEARBY RIGHT NOW" & REMOTE ADVISOR FALLBACK */
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#EFE2D2] shadow-sm space-y-4 text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-[#A94A43]/10 text-[#A94A43] flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-[#171717] font-display">
              No workers nearby right now
            </h3>
            <p className="text-xs text-[#6F6A63] max-w-xs mx-auto">
              All physical {serviceName}s in your radius are currently on active gigs.
            </p>
          </div>

          {/* Remote Advisor Fallback Card */}
          <div className="bg-[#F7F3EC] rounded-2xl p-4 border border-[#EFE2D2] text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A5B3A] bg-[#EFE2D2] px-2 py-0.5 rounded-full">
                Instant Video/Audio Solution
              </span>
              <span className="text-xs font-bold text-[#527A62]">Free Live Guide</span>
            </div>

            <div>
              <h4 className="font-bold text-xs text-[#171717]">Connect with a Remote Master Advisor</h4>
              <p className="text-[11px] text-[#6F6A63] mt-0.5">
                A senior cooperative master will inspect your issue via live video and provide emergency step-by-step guidance.
              </p>
            </div>

            {advisorSession ? (
              <div className="p-3 bg-white rounded-xl border border-[#527A62]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#527A62]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{advisorSession.advisor_name}</span>
                </div>
                <p className="text-[11px] text-[#6F6A63]">{advisorSession.message}</p>
                <button
                  type="button"
                  onClick={() => alert(`Starting WebRTC Video Session: ${advisorSession.session_id}`)}
                  className="w-full py-2.5 rounded-xl bg-[#527A62] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Live Video Assistance</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRemoteAdvisor}
                disabled={connectingAdvisor}
                className="w-full py-3.5 rounded-xl bg-[#9A5B3A] hover:bg-[#C9684A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
                <span>{connectingAdvisor ? 'Connecting to Master Advisor...' : 'Request Remote Advisor'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-[#6F6A63] hover:underline pt-1"
          >
            Change search or go back
          </button>
        </div>
      ) : (
        /* SIMPLE WORKER CARDS LIST */
        <div className="space-y-3">
          {workers.map((w) => {
            const isSelected = selectedWorkerId === w.worker_id;
            return (
              <div
                key={w.worker_id}
                onClick={() => setSelectedWorkerId(w.worker_id)}
                className={`bg-[#FFFFFF] rounded-2xl p-4 border transition-all flex items-center justify-between shadow-sm cursor-pointer ${
                  isSelected
                    ? 'border-[#9A5B3A] ring-2 ring-[#9A5B3A]/20 bg-[#FFFFFF]'
                    : 'border-[#EFE2D2] hover:border-[#9A5B3A]'
                }`}
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EFE2D2] text-[#9A5B3A] font-extrabold text-base flex items-center justify-center shrink-0">
                    {w.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#171717]">{w.name}</h3>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span className="font-bold text-[#9A5B3A] flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-[#9A5B3A] text-[#9A5B3A]" />
                        <span>{w.rating}</span>
                      </span>
                      <span className="text-[#6F6A63]">•</span>
                      <span className="font-semibold text-[#171717]">{w.distance_km} km</span>
                      <span className="text-[#6F6A63]">•</span>
                      <span className="text-[#6F6A63]">{w.service}</span>
                    </div>
                  </div>
                </div>

                {/* Right: [Choose] Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWorker(w);
                  }}
                  className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-[#9A5B3A] hover:bg-[#C9684A] text-white shadow-md shadow-[#9A5B3A]/20'
                      : 'bg-[#F7F3EC] hover:bg-[#9A5B3A] text-[#171717] hover:text-white border border-[#EFE2D2]'
                  }`}
                >
                  <span>Choose</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default WorkerMapView;
