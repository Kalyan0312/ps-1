import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  RefreshCw,
  FileText
} from 'lucide-react';
import { fetchBookingInvoice, InvoiceData } from '@/services/bookings';


interface InvoiceModalProps {
  isOpen: boolean;
  bookingId: string;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  bookingId,
  onClose
}) => {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !bookingId) return;
    setLoading(true);
    setError(null);
    fetchBookingInvoice(bookingId)
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load invoice');
        setLoading(false);
      });
  }, [isOpen, bookingId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in print:p-0 print:bg-white">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EFE2D2] text-[#171717] space-y-6 max-h-[92vh] overflow-y-auto print:shadow-none print:border-none print:max-h-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE2D2] print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#9A5B3A]" />
            <h2 className="font-extrabold text-base text-[#171717] font-display">Itemised Cooperative Invoice</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-[#F7F3EC] hover:bg-[#EFE2D2] text-xs font-bold text-[#171717] flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#9A5B3A]" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#EFE2D2] text-[#6F6A63] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#6F6A63] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9A5B3A]" />
            <p className="text-xs">Generating verified cooperative invoice...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-[#A94A43]/10 border border-[#A94A43]/20 rounded-2xl text-[#A94A43] text-xs text-center">
            {error}
          </div>
        ) : invoice ? (
          <div className="space-y-6" id="printable-invoice">
            {/* Invoice Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#9A5B3A] text-white flex items-center justify-center font-black text-xs">
                    CG
                  </div>
                  <div>
                    <h1 className="font-black text-base tracking-tight text-[#171717] font-display">
                      Cooperative Gig Guild
                    </h1>
                    <p className="text-[10px] text-[#6F6A63]">Member-Owned Democratic Federation</p>
                  </div>
                </div>
                <p className="text-[10px] text-[#6F6A63] mt-2">
                  Registration: <span className="font-mono text-[#171717]">KA-BLR-COOP-2026/881</span>
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="px-2.5 py-1 rounded-full bg-[#527A62]/10 text-[#527A62] text-[10px] font-extrabold uppercase font-mono">
                  {invoice.payment_status === 'paid' ? 'PAID & SETTLED' : 'ESCROW SECURED'}
                </span>
                <p className="font-mono text-xs font-black text-[#171717]">
                  {invoice.invoice_number}
                </p>
                <p className="text-[10px] text-[#6F6A63]">
                  Date: {new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Customer & Worker Party Info Box */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#F7F3EC] rounded-2xl border border-[#EFE2D2] text-xs">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-[#6F6A63] tracking-wider">
                  Billed To (Customer)
                </p>
                <p className="font-extrabold text-[#171717]">{invoice.customer.full_name}</p>
                <p className="text-[#6F6A63] text-[11px]">{invoice.customer.address}</p>
                <p className="text-[#6F6A63] font-mono text-[10px]">{invoice.customer.phone_number}</p>
              </div>

              <div className="space-y-1 border-l border-[#EFE2D2] pl-3">
                <p className="text-[10px] uppercase font-bold text-[#6F6A63] tracking-wider">
                  Service Partner (Worker)
                </p>
                <p className="font-extrabold text-[#171717]">
                  {invoice.worker?.full_name || 'Assigned Guild Member'}
                </p>
                <p className="text-[#527A62] text-[11px] font-bold">
                  ★ {invoice.worker?.rating || 4.9} Certified Craftsman
                </p>
                <p className="text-[#6F6A63] font-mono text-[10px]">
                  Settlement UPI: {invoice.worker?.upi_id || 'direct.coop@okhdfcbank'}
                </p>
              </div>
            </div>

            {/* Itemised Breakdown Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6F6A63]">
                Itemised Service Breakdown
              </h3>

              <div className="border border-[#EFE2D2] rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F7F3EC] border-b border-[#EFE2D2] text-[10px] uppercase font-bold text-[#6F6A63]">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Factor Multiplier</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE2D2]">
                    {/* Base Rate */}
                    <tr>
                      <td className="p-3 font-semibold text-[#171717]">
                        {invoice.service_name} — Standard Base Service Rate
                      </td>
                      <td className="p-3 text-right font-mono text-[#6F6A63]">1.00x</td>
                      <td className="p-3 text-right font-mono font-bold text-[#171717]">
                        ₹{invoice.base_price.toFixed(2)}
                      </td>
                    </tr>

                    {/* Applied Surcharges Line Items */}
                    {invoice.dynamic_surcharges.map((s) => (
                      <tr key={s.id} className="bg-[#9A5B3A]/5">
                        <td className="p-3">
                          <span className="font-semibold text-[#171717]">{s.name}</span>
                          <span className="block text-[10px] text-[#6F6A63]">{s.description}</span>
                        </td>
                        <td className="p-3 text-right font-mono text-[#9A5B3A] font-bold">
                          +{((s.multiplier_weight - 1) * 100).toFixed(0)}%
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#9A5B3A]">
                          +₹{s.surcharge_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Subtotal Row */}
                    <tr className="bg-[#F7F3EC]/70 font-bold">
                      <td className="p-3 text-[#171717]" colSpan={2}>
                        Subtotal Gross Service Fare
                      </td>
                      <td className="p-3 text-right font-mono text-[#171717]">
                        ₹{invoice.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* ITEMISED TRANSPARENT COOPERATIVE SPLIT */}
            {/* ========================================================================= */}
            <div className="p-4 bg-[#F7F3EC] rounded-2xl border border-[#EFE2D2] space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#EFE2D2]">
                <span className="font-bold uppercase tracking-wider text-[#6F6A63] text-[10px]">
                  Cooperative Value Allocation
                </span>
                <span className="font-mono text-[10px] text-[#527A62] font-bold">
                  0% Extractive Commission
                </span>
              </div>

              {/* 1. Worker Earning */}
              <div className="flex items-center justify-between text-[#527A62]">
                <div>
                  <span className="font-bold">Worker Direct Earning ({invoice.worker_share_percent}%)</span>
                  <p className="text-[10px] text-[#6F6A63]">Direct instant transfer to service worker</p>
                </div>
                <span className="font-mono font-extrabold text-sm">
                  ₹{invoice.worker_earning.toFixed(2)}
                </span>
              </div>

              {/* 2. Cooperative Fee */}
              <div className="flex items-center justify-between text-[#9A5B3A]">
                <div>
                  <span className="font-bold">Cooperative Operating Fee ({invoice.cooperative_fee_percent}%)</span>
                  <p className="text-[10px] text-[#6F6A63]">Platform server, mapping radar & member governance</p>
                </div>
                <span className="font-mono font-extrabold text-sm">
                  ₹{invoice.cooperative_fee.toFixed(2)}
                </span>
              </div>

              {/* 3. Welfare Contribution */}
              <div className="flex items-center justify-between text-[#A94A43]">
                <div>
                  <span className="font-bold">Worker Welfare & Health Pool ({invoice.welfare_contribution_percent}%)</span>
                  <p className="text-[10px] text-[#6F6A63]">Emergency healthcare & hardship safety pool</p>
                </div>
                <span className="font-mono font-extrabold text-sm">
                  ₹{invoice.welfare_contribution.toFixed(2)}
                </span>
              </div>

              {/* Total Final Line */}
              <div className="pt-2 border-t border-[#EFE2D2] flex items-center justify-between text-sm">
                <span className="font-black text-[#171717]">Total Paid by Customer</span>
                <span className="font-black text-lg text-[#171717] font-mono">
                  ₹{invoice.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer Sign-off */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-[#6F6A63] border-t border-[#EFE2D2]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#527A62]" />
                <span>Digitally Authenticated by Cooperative Trust Network</span>
              </div>
              <span className="font-mono">Tx: {invoice.transaction_id}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default InvoiceModal;
