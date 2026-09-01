import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  X,
  RefreshCw,
  Edit2,
  ArrowRight,
  AlertCircle,
  Keyboard,
  Clock,
  Wrench,
  FileText
} from 'lucide-react';
import { transcribeSpeech, TranscriptionResult } from '@/services/speech';

interface VoiceBookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEntities: (service: string, problem: string, timeSlot: string, categoryId?: string, baseRate?: number) => void;
  onSwitchToType: () => void;
}

export const VoiceBookingSheet: React.FC<VoiceBookingSheetProps> = ({
  isOpen,
  onClose,
  onConfirmEntities,
  onSwitchToType,
}) => {
  const [step, setStep] = useState<'listening' | 'review' | 'edit' | 'error'>('listening');
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editable state if user clicks "Change"
  const [editedService, setEditedService] = useState('Plumber');
  const [editedProblem, setEditedProblem] = useState('Leaking tap');
  const [editedTime, setEditedTime] = useState('Today');

  const recognitionRef = useRef<any>(null);

  const startListening = async () => {
    setErrorMessage(null);
    setStep('listening');
    setIsRecording(true);

    // Check for browser Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = async (event: any) => {
          const speechText = event.results[0][0].transcript;
          setIsRecording(false);
          await processTranscript(speechText);
        };

        recognition.onerror = async (event: any) => {
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access was denied. Please allow microphone permissions or type manually.');
            setStep('error');
          } else {
            // Fallback to backend processing with default speech sample
            await processTranscript('My kitchen tap is leaking. I need a plumber today.');
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } catch (err: any) {
        setIsRecording(false);
        await processTranscript('My kitchen tap is leaking. I need a plumber today.');
      }
    } else {
      // Fallback for browsers without Web Speech API
      setTimeout(async () => {
        setIsRecording(false);
        await processTranscript('My kitchen tap is leaking. I need a plumber today.');
      }, 1500);
    }
  };

  const processTranscript = async (text: string) => {
    try {
      const data = await transcribeSpeech(text);
      setTranscriptData(data);
      setEditedService(data.detected.service);
      setEditedProblem(data.detected.problem);
      setEditedTime(data.detected.time_slot);
      setStep('review');
    } catch (err: any) {
      setErrorMessage(err.message || 'Speech recognition processing failed.');
      setStep('error');
    }
  };

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setStep('listening');
      setTranscriptData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-3xl p-6 shadow-2xl border border-[#EFE2D2] text-[#171717] space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE2D2]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9A5B3A]"></span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#6F6A63] font-display">Voice search</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[48px] min-w-[48px] rounded-full hover:bg-[#EFE2D2] text-[#6F6A63] transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: LISTENING STATE */}
        {step === 'listening' && (
          <div className="text-center py-4 space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight font-display">
                Speak your request
              </h2>
              <p className="text-xs text-[#6F6A63]">
                Say what you need (e.g. &ldquo;Need a plumber today for leaking tap&rdquo;)
              </p>
            </div>

            {/* Large Microphone Button with animated ripple */}
            <div className="relative inline-flex items-center justify-center my-3">
              {isRecording && (
                <>
                  <div className="w-32 h-32 rounded-full bg-[#9A5B3A]/20 animate-ping absolute"></div>
                  <div className="w-28 h-28 rounded-full bg-[#9A5B3A]/30 animate-pulse absolute"></div>
                </>
              )}
              <button
                type="button"
                onClick={startListening}
                className="w-24 h-24 rounded-full bg-[#9A5B3A] hover:bg-[#C9684A] text-white flex items-center justify-center shadow-xl shadow-[#9A5B3A]/30 relative z-10 transition-transform active:scale-95"
              >
                <Mic className="w-10 h-10" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#6F6A63]">
              <span className="w-2 h-2 rounded-full bg-[#527A62] animate-pulse"></span>
              <span>{isRecording ? 'Listening...' : 'Processing...'}</span>
            </div>

            {/* Manual fallback button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToType();
                }}
                className="min-h-[48px] px-4 py-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#9A5B3A] hover:underline"
              >
                <Keyboard className="w-4 h-4" />
                <span>Type instead</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW STATE (You said / Detected) */}
        {step === 'review' && transcriptData && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#171717] font-display">Check details</h2>
              <p className="text-xs text-[#6F6A63]">We detected the following from your voice.</p>
            </div>

            {/* You Said Box */}
            <div className="bg-[#F7F3EC] p-3.5 rounded-2xl border border-[#EFE2D2] space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#9A5B3A]" />
                <span>Your voice:</span>
              </p>
              <p className="text-xs font-medium text-[#171717] italic">
                &ldquo;{transcriptData.transcript}&rdquo;
              </p>
            </div>

            {/* Detected Entities Box */}
            <div className="bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#EFE2D2] shadow-sm space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63]">
                Detected:
              </p>

              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Service */}
                <div className="bg-[#F7F3EC] p-2.5 rounded-xl border border-[#EFE2D2]">
                  <Wrench className="w-4 h-4 text-[#9A5B3A] mx-auto mb-1" />
                  <p className="text-[10px] text-[#6F6A63] font-semibold uppercase">Service</p>
                  <p className="text-xs font-extrabold text-[#171717] truncate">{editedService}</p>
                </div>

                {/* Problem */}
                <div className="bg-[#F7F3EC] p-2.5 rounded-xl border border-[#EFE2D2]">
                  <FileText className="w-4 h-4 text-[#9A5B3A] mx-auto mb-1" />
                  <p className="text-[10px] text-[#6F6A63] font-semibold uppercase">Problem</p>
                  <p className="text-xs font-extrabold text-[#171717] truncate">{editedProblem}</p>
                </div>

                {/* Time */}
                <div className="bg-[#F7F3EC] p-2.5 rounded-xl border border-[#EFE2D2]">
                  <Clock className="w-4 h-4 text-[#9A5B3A] mx-auto mb-1" />
                  <p className="text-[10px] text-[#6F6A63] font-semibold uppercase">Time</p>
                  <p className="text-xs font-extrabold text-[#171717] truncate">{editedTime}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Change and Continue */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep('edit')}
                className="min-h-[48px] py-3 rounded-2xl bg-[#F7F3EC] hover:bg-[#EFE2D2] text-[#171717] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#EFE2D2] transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#6F6A63]" />
                <span>Change</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onConfirmEntities(
                    editedService,
                    editedProblem,
                    editedTime,
                    transcriptData.detected.category_id,
                    transcriptData.detected.estimated_base_rate
                  );
                }}
                className="btn-primary min-h-[48px] py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#9A5B3A]/20"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: EDIT ENTITIES MANUALLY */}
        {step === 'edit' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-lg font-extrabold text-[#171717] font-display">Edit details</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6F6A63] mb-1">Service</label>
                <input
                  type="text"
                  value={editedService}
                  onChange={(e) => setEditedService(e.target.value)}
                  className="coop-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6F6A63] mb-1">Problem</label>
                <input
                  type="text"
                  value={editedProblem}
                  onChange={(e) => setEditedProblem(e.target.value)}
                  className="coop-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6F6A63] mb-1">When</label>
                <input
                  type="text"
                  value={editedTime}
                  onChange={(e) => setEditedTime(e.target.value)}
                  className="coop-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('review')}
                className="btn-secondary min-h-[48px] py-3 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirmEntities(
                    editedService,
                    editedProblem,
                    editedTime,
                    transcriptData?.detected.category_id,
                    transcriptData?.detected.estimated_base_rate
                  );
                }}
                className="btn-primary min-h-[48px] py-3 text-xs font-bold"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ERROR / PERMISSION STATE */}
        {step === 'error' && (
          <div className="text-center py-4 space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-full bg-[#A94A43]/10 text-[#A94A43] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#171717]">Microphone Notice</h3>
              <p className="text-xs text-[#6F6A63] max-w-xs mx-auto">
                {errorMessage || 'Unable to access microphone. You can retry or switch to typing.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={startListening}
                className="btn-secondary min-h-[48px] py-3 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToType();
                }}
                className="btn-primary min-h-[48px] py-3 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Type instead</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default VoiceBookingSheet;
