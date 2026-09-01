import React, { useState, useEffect } from 'react';
import { Mic, X, Check, Volume2, Sparkles } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryName: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  const [statusText, setStatusText] = useState('Listening...');
  const [detectedService, setDetectedService] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStatusText('Listening...');
      setDetectedService(null);
      return;
    }

    const timer1 = setTimeout(() => {
      setStatusText('"I need an electrician for my kitchen wiring"');
      setDetectedService('Electrician');
    }, 1800);

    return () => clearTimeout(timer1);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#FFFFFF] rounded-3xl p-6 shadow-2xl border border-[#EFE2D2] text-[#171717] space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-[#EFE2D2] text-[#9A5B3A]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6F6A63]">Voice AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EFE2D2] text-[#6F6A63] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Waveform / Mic Circle */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[#EFE2D2] animate-ping absolute opacity-60"></div>
            <div className="w-20 h-20 rounded-full bg-[#9A5B3A] text-white flex items-center justify-center shadow-xl shadow-[#9A5B3A]/30 relative z-10">
              <Mic className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-base text-[#171717]">Say what you need</h3>
            <p className="text-xs text-[#6F6A63] mt-1 font-medium italic">
              {statusText}
            </p>
          </div>
        </div>

        {/* Detected Action Button */}
        {detectedService ? (
          <button
            onClick={() => {
              onSelectCategory(detectedService);
              onClose();
            }}
            className="w-full py-4 rounded-2xl bg-[#9A5B3A] hover:bg-[#C9684A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#9A5B3A]/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Book {detectedService}</span>
          </button>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6F6A63] bg-[#F7F3EC] py-2.5 rounded-xl">
            <Volume2 className="w-3.5 h-3.5 text-[#9A5B3A]" />
            <span>Google Cloud Speech Engine active</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default VoiceSearchModal;
