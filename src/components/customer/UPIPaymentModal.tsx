import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  ArrowRight,
  Smartphone,
  QrCode,
  RefreshCw
} from 'lucide-react';
import {
  initiatePayment,
  verifyPayment,
  PaymentVerificationResult
} from '@/services/bookings';


interface UPIPaymentModalProps {
  isOpen: boolean;
  bookingId: string;
  amount: number;
  serviceName: string;
  onClose: () => void;
  onPaymentSuccess: (result: PaymentVerificationResult) => void;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  bookingId,
  amount,
  serviceName,
  onClose,
  onPaymentSuccess
}) => {
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'qr'>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  if (!isOpen) return null;

  const upiApps = [
    { id: 'gpay', name: 'Google Pay', color: 'text-[#9A5B3A]', bg: 'bg-[#F7F3EC] border-[#E0D5C8]' },
    { id: 'phonepe', name: 'PhonePe', color: 'text-[#9A5B3A]', bg: 'bg-[#F7F3EC] border-[#E0D5C8]' },
    { id: 'paytm', name: 'Paytm UPI', color: 'text-[#527A62]', bg: 'bg-[#F7F3EC] border-[#E0D5C8]' },
    { id: 'bhim', name: 'BHIM UPI', color: 'text-[#527A62]', bg: 'bg-[#F7F3EC] border-[#E0D5C8]' },
    { id: 'qr', name: 'Show UPI QR', color: 'text-[#171717]', bg: 'bg-[#F7F3EC] border-[#E0D5C8]' },
  ];

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // 1. Initiate Payment Order on Backend
      const order = await initiatePayment(bookingId, selectedApp);

      // 2. In Safe Local Development Demo Mode, verify transaction signature

      const demoPaymentId = `pay_demo_${Date.now()}`;
      const verifyRes = await verifyPayment(
        bookingId,
        demoPaymentId,
        order.order_id,
        'demo_signature_verified'
      );

      onPaymentSuccess(verifyRes);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-3xl p-6 shadow-2xl border border-[#EFE2D2] text-[#171717] space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE2D2]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#527A62]/10 text-[#527A62]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#171717] font-display">UPI Escrow Payment</h2>
              <p className="text-[10px] text-[#6F6A63]">100% Cooperative Protected</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#EFE2D2] text-[#6F6A63] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Service Card */}
        <div className="bg-[#F7F3EC] p-4 rounded-2xl border border-[#EFE2D2] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6F6A63] tracking-wider">
              {serviceName} Service
            </span>
            <p className="text-xs font-semibold text-[#171717] mt-0.5 font-mono">Booking Ref: CG-PAY</p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-[#171717] font-mono">
              ₹{amount.toFixed(2)}
            </span>
            <p className="text-[10px] text-[#527A62] font-semibold flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Escrow Protected</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#A94A43]/10 border border-[#A94A43]/20 rounded-xl text-[#A94A43] text-xs">
            {error}
          </div>
        )}

        {/* UPI Apps Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63] flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#9A5B3A]" />
            <span>Select UPI Payment Method</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {upiApps.map((app) => {
              const isSelected = selectedApp === app.id;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedApp(app.id as any)}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-[#FFFFFF] border-[#9A5B3A] shadow-md shadow-[#9A5B3A]/10 ring-2 ring-[#9A5B3A]/20'
                      : 'bg-[#F7F3EC] border-[#EFE2D2] hover:border-[#9A5B3A]'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl ${app.bg} flex items-center justify-center font-bold text-xs ${app.color}`}>
                    {app.id === 'qr' ? <QrCode className="w-4 h-4" /> : app.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-[#171717]">{app.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* QR Code view if selected */}
        {selectedApp === 'qr' && (
          <div className="p-4 bg-[#F7F3EC] rounded-2xl border border-[#EFE2D2] text-center space-y-2 animate-fade-in">
            <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto border border-[#EFE2D2] flex items-center justify-center shadow-inner">
              <QrCode className="w-28 h-28 text-[#171717]" />
            </div>
            <p className="text-[11px] font-semibold text-[#6F6A63]">
              Scan using any UPI App (GPay / PhonePe / Paytm / BHIM)
            </p>
          </div>
        )}

        {/* Cooperative Escrow Safety Guarantee Note */}
        <div className="p-3 bg-[#527A62]/10 rounded-2xl border border-[#527A62]/20 flex items-start gap-2.5 text-xs text-[#527A62]">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Your payment is held safely in <strong>Cooperative Escrow</strong>. Funds are only transferred to the worker after you confirm the job is satisfactorily completed.
          </p>
        </div>

        {/* Primary Pay Action */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={handlePay}
          className="w-full py-4 rounded-2xl bg-[#9A5B3A] hover:bg-[#C9684A] active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#9A5B3A]/25 transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying UPI Escrow...</span>
            </>
          ) : (
            <>
              <span>Authorize UPI Payment (₹{amount.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
export default UPIPaymentModal;
