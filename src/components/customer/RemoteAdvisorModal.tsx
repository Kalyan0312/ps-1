import React, { useState, useEffect } from 'react';
import { 
  X, 
  PhoneCall, 
  MessageSquare, 
  AlertTriangle, 
  Zap, 
  Mic, 
  PhoneOff, 
  CheckCircle2, 
  Volume2
} from 'lucide-react';
import { ServiceCategory } from '@/services/customer';
import { requestRemoteAdvisor, RemoteAdvisorSession } from '@/services/workers';

interface RemoteAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ServiceCategory | null;
}

export const RemoteAdvisorModal: React.FC<RemoteAdvisorModalProps> = ({ isOpen, onClose, category }) => {
  const [activeView, setActiveView] = useState<'initial' | 'chat' | 'voice'>('initial');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [advisorSession, setAdvisorSession] = useState<RemoteAdvisorSession | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveView('initial');
      setIsCalling(false);
      setCallDuration(0);
      setAdvisorSession(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: number;
    if (activeView === 'voice' && isCalling) {
      interval = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeView, isCalling]);

  if (!isOpen) return null;

  const isHighRisk = category?.id === 'cat-electrician' || category?.slug === 'electrician';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    setActiveView('voice');
    try {
      const session = await requestRemoteAdvisor(
        category?.name || 'General Maintenance',
        `Remote guidance requested for ${category?.name || 'service'}`
      );
      setAdvisorSession(session);
    } catch (e) {
      console.warn('Could not register remote advisor on server, continuing fallback session', e);
    }
    setTimeout(() => {
      setIsCalling(true);
    }, 1500);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#171717]/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#F7F3EC] w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] border border-[#EFE2D2] relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EFE2D2] bg-[#FFFFFF] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#9A5B3A] text-white flex items-center justify-center shadow-md shadow-[#9A5B3A]/20">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-[#171717] text-lg tracking-tight">Remote Advisor</h2>
              <p className="text-[#6F6A63] text-xs font-medium">Cooperative Verified Experts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F7F3EC] text-[#6F6A63] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1">
          {isHighRisk ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#A94A43]/10 text-[#A94A43] flex items-center justify-center mx-auto border-4 border-[#A94A43]/20">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#171717] text-lg font-display">High-Risk Service</h3>
                <p className="text-sm text-[#6F6A63] mt-2 leading-relaxed">
                  Remote guidance is strictly disabled for live electrical work to ensure your safety. 
                  Please wait for an in-person worker or contact local emergency services if urgent.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-full mt-4 bg-[#171717] text-white p-4 rounded-2xl font-bold hover:bg-[#333333] transition-all"
              >
                Understood
              </button>
            </div>
          ) : activeView === 'initial' ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-[#9A5B3A]/10 text-[#9A5B3A] mb-2">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-[#171717] text-xl font-display">No workers nearby</h3>
                <p className="text-sm text-[#6F6A63] leading-relaxed max-w-[280px] mx-auto">
                  We couldn't find an available worker near your location right now.
                </p>
              </div>

              <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E0D5C8] shadow-sm space-y-3">
                <h4 className="font-bold text-[#171717] text-sm text-center font-display">Talk to a verified expert instead?</h4>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setActiveView('chat')}
                    className="p-4 rounded-2xl border-2 border-[#E0D5C8] hover:border-[#9A5B3A]/50 bg-[#F7F3EC] flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <MessageSquare className="w-5 h-5 text-[#9A5B3A]" />
                    <span className="font-bold text-[#171717] text-xs">Text Chat</span>
                  </button>
                  <button 
                    onClick={handleStartCall}
                    className="p-4 rounded-2xl border-2 border-[#9A5B3A] bg-[#9A5B3A] hover:bg-[#C9684A] hover:border-[#C9684A] text-white flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-[#9A5B3A]/20"
                  >
                    <PhoneCall className="w-5 h-5" />
                    <span className="font-bold text-xs">Voice Call</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#EFE2D2]/60 p-4 rounded-2xl border border-[#E0D5C8]">
                <AlertTriangle className="w-4 h-4 text-[#9A5B3A] shrink-0 mt-0.5" />
                <p className="text-xs text-[#6F6A63] font-medium leading-relaxed">
                  Disclaimer: Remote guidance only, not a substitute for in-person inspection. Do not attempt dangerous repairs yourself.
                </p>
              </div>
            </div>
          ) : activeView === 'voice' ? (
            <div className="space-y-8 py-6 flex flex-col items-center justify-center h-full">
              {/* Voice Call UI (Simulated Managed SDK) */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full bg-[#9A5B3A] flex items-center justify-center mx-auto text-white shadow-xl ${isCalling ? 'animate-pulse shadow-[#9A5B3A]/30' : ''}`}>
                    {isCalling ? <Volume2 className="w-10 h-10" /> : <Mic className="w-10 h-10 opacity-50" />}
                  </div>
                  {isCalling && (
                    <div className="absolute inset-0 rounded-full border-4 border-[#9A5B3A] animate-ping opacity-20"></div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-extrabold text-[#171717] text-xl font-display">
                    {isCalling ? (advisorSession?.advisor_name || 'Verified Cooperative Advisor') : 'Connecting...'}
                  </h3>
                  <p className="text-[#6F6A63] font-medium text-sm mt-1">
                    {isCalling ? `${advisorSession?.advisor_specialty || 'Master Craftsman'} • ${formatTime(callDuration)}` : 'Establishing secure voice link via SDK'}
                  </p>
                </div>
              </div>

              {isCalling && (
                <div className="flex items-center gap-2 bg-[#F7F3EC] px-4 py-2 rounded-full border border-[#E0D5C8]">
                  <div className="w-2 h-2 rounded-full bg-[#527A62] animate-pulse"></div>
                  <span className="text-xs font-bold text-[#527A62]">Secure Audio Channel</span>
                </div>
              )}

              <button 
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-[#A94A43] hover:bg-[#8a3830] text-white flex items-center justify-center shadow-lg shadow-[#A94A43]/20 active:scale-95 transition-all mt-4"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-[400px]">
              {/* Simple Chat UI */}
              <div className="flex-1 bg-[#FFFFFF] rounded-2xl border border-[#EFE2D2] p-4 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#9A5B3A] text-white flex items-center justify-center shrink-0">
                      E
                    </div>
                    <div className="bg-[#F7F3EC] p-3 rounded-2xl rounded-tl-none border border-[#EFE2D2]">
                      <p className="text-sm text-[#171717]">Hi there, I'm a verified expert. I see you couldn't find a worker nearby. How can I guide you?</p>
                      <p className="text-[10px] text-[#6F6A63] mt-1 text-right">Just now</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#EFE2D2] flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-1 bg-[#F7F3EC] border border-[#EFE2D2] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#9A5B3A]"
                  />
                  <button className="p-2.5 rounded-full bg-[#9A5B3A] text-white shadow-md active:scale-95">
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
