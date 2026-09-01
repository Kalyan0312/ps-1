import React, { useState } from 'react';
import { MessageSquare, PhoneCall, HelpCircle, AlertOctagon, CheckCircle2, RefreshCw } from 'lucide-react';
import { submitGrievance } from '@/services/community';

export const CustomerSupport: React.FC = () => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await submitGrievance({
        subject: ticketSubject.trim(),
        description: ticketDescription.trim() || ticketSubject.trim(),
        reporter_role: 'customer',
        reporter_name: 'Verified Patron'
      });
      setTicketRef(res.ticket_reference);
      setTicketSubject('');
      setTicketDescription('');
      setTimeout(() => setTicketRef(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight font-display">
          Help &amp; support
        </h1>
        <p className="text-xs font-medium text-[#6F6A63]">
          We are here for you 24/7.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="p-4 min-h-[80px] bg-[#FFFFFF] border border-[#EFE2D2] rounded-3xl shadow-sm hover:border-[#9A5B3A]/40 transition-all flex flex-col items-center justify-center gap-2 group active:scale-95">
          <div className="p-3 bg-[#F7F3EC] rounded-2xl group-hover:bg-[#EFE2D2] transition-colors text-[#9A5B3A]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-[#171717]">Chat</span>
        </button>

        <button className="p-4 min-h-[80px] bg-[#FFFFFF] border border-[#EFE2D2] rounded-3xl shadow-sm hover:border-[#9A5B3A]/40 transition-all flex flex-col items-center justify-center gap-2 group active:scale-95">
          <div className="p-3 bg-[#F7F3EC] rounded-2xl group-hover:bg-[#EFE2D2] transition-colors text-[#9A5B3A]">
            <PhoneCall className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-[#171717]">Call us</span>
        </button>
      </div>

      <div className="bg-[#FFFFFF] rounded-3xl border border-[#EFE2D2] overflow-hidden shadow-sm">
        <button className="w-full flex items-center gap-4 p-4 hover:bg-[#F7F3EC]/50 transition-colors border-b border-[#EFE2D2]">
          <div className="p-2 bg-[#F7F3EC] rounded-xl text-[#9A5B3A]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm text-[#171717]">Help Center & FAQs</h3>
            <p className="text-xs text-[#6F6A63]">Browse guides and community rules</p>
          </div>
        </button>
        
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-[#A94A43]/10 rounded-xl text-[#A94A43]">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#171717]">Report problem</h3>
              <p className="text-xs text-[#6F6A63]">Tell us what went wrong.</p>
            </div>
          </div>
          
          <form onSubmit={handleTicketSubmit} className="space-y-3 mt-3">
            <input
              type="text"
              className="w-full bg-[#F7F3EC] border border-[#EFE2D2] rounded-xl p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#9A5B3A] focus:ring-1 focus:ring-[#9A5B3A] placeholder-[#6F6A63]"
              placeholder="Subject (e.g. Fare dispute, Delayed arrival)..."
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              required
            />
            <textarea
              className="w-full bg-[#F7F3EC] border border-[#EFE2D2] rounded-2xl p-3 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#9A5B3A] focus:ring-1 focus:ring-[#9A5B3A] resize-none placeholder-[#6F6A63]"
              rows={3}
              placeholder="Describe your issue or grievance details..."
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
            />
            {errorMessage && (
              <p className="text-xs text-[#A94A43] font-medium">{errorMessage}</p>
            )}
            {ticketRef ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#527A62]/10 border border-[#527A62]/30 text-[#527A62] text-xs font-bold font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket Logged: {ticketRef}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#527A62]">Under Review</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!ticketSubject.trim() || isSubmitting}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send report</span>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
