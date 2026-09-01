import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Phone,
  Star,
  FileText,
  RefreshCw
} from 'lucide-react';
import { fetchBookings, BookingDetail } from '@/services/bookings';
import { InvoiceModal } from '@/components/invoice/InvoiceModal';
import { useRealtimeEvent } from '@/contexts/RealtimeContext';
import { RatingModal } from '@/components/ratings/RatingModal';


export const CustomerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceBookingId, setSelectedInvoiceBookingId] = useState<string | null>(null);
  const [ratingBooking, setRatingBooking] = useState<BookingDetail | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load customer bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // ─── Phase 11: Real-Time Status Sync ─────────────────────────────────────
  useRealtimeEvent('booking.status_changed', () => {
    loadBookings();
  });
  useRealtimeEvent('booking.completed', () => {
    loadBookings();
  });

  return (
    <div className="space-y-6 pb-20 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight font-display">
            My bookings
          </h1>
          <p className="text-xs font-medium text-[#6F6A63]">
            Track jobs &amp; view bills
          </p>
        </div>

        <button
          onClick={loadBookings}
          className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-[#FFFFFF] border border-[#EFE2D2] text-[#6F6A63] hover:text-[#171717] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#6F6A63] space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9A5B3A]" />
          <p>Loading real-time bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-3xl p-8 text-center space-y-2 border border-[#EFE2D2]">
          <p className="font-bold text-sm text-[#171717] font-display">No active bookings</p>
          <p className="text-xs text-[#6F6A63]">Select a service category from Home to book.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#EFE2D2] shadow-sm space-y-4 hover:border-[#9A5B3A]/40 transition-colors"
            >
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#9A5B3A] bg-[#EFE2D2] px-2.5 py-1 rounded-full">
                    {b.booking_reference}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#6F6A63] font-mono">
                    {b.booking_type}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#527A62] bg-[#527A62]/10 px-2.5 py-0.5 rounded-full capitalize">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#527A62] animate-pulse"></span>
                    {b.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Service Info */}
              <div>
                <h3 className="font-extrabold text-base text-[#171717] font-display">{b.service.name}</h3>
                <p className="text-xs text-[#6F6A63] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9A5B3A] shrink-0" />
                  <span className="truncate">{b.customer.address}</span>
                </p>
              </div>

              {/* Live Worker GPS / Dispatch Card */}
              {b.worker && (
                <div className="bg-[#F7F3EC] p-3.5 rounded-2xl border border-[#EFE2D2] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.worker.photo}
                      alt={b.worker.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-[#EFE2D2]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{b.worker.full_name}</p>
                      <p className="text-[10px] text-[#6F6A63] flex items-center gap-1 font-mono">
                        <Star className="w-3 h-3 text-[#9A5B3A] fill-[#9A5B3A]" />
                        <span>{b.worker.rating} rating</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#527A62] bg-[#527A62]/10 px-2 py-0.5 rounded">
                      {b.status === 'completed' ? 'Completed' : `ETA ${b.eta_minutes || 10}m`}
                    </span>
                    {b.worker.phone_number && (
                      <a
                        href={`tel:${b.worker.phone_number}`}
                        className="flex items-center justify-end gap-1 text-[11px] font-bold text-[#9A5B3A] mt-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Fare & Value Split Preview */}
              <div className="pt-2 border-t border-[#EFE2D2] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#6F6A63] font-medium">Total</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#527A62]/10 text-[#527A62] text-[10px] font-bold font-mono">
                      {b.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                    </span>
                  </div>
                  <span className="font-black text-base text-[#171717] font-mono">
                    ₹{b.price.final_price.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6F6A63] bg-[#F7F3EC]/70 p-2 rounded-xl">
                  <span>Worker: <strong className="text-[#527A62]">₹{b.price.worker_share.toFixed(2)}</strong> (85%)</span>
                  <span>Guild: <strong className="text-[#9A5B3A]">₹{b.price.cooperative_share.toFixed(2)}</strong> (10%)</span>
                  <span>Welfare: <strong className="text-[#A94A43]">₹{b.price.welfare_share.toFixed(2)}</strong> (5%)</span>
                </div>
              </div>

              {/* View Itemised Invoice CTA Button */}
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceBookingId(b.id)}
                  className="w-full min-h-[48px] px-4 rounded-xl bg-[#F7F3EC] hover:bg-[#EFE2D2] text-[#9A5B3A] font-extrabold text-xs flex items-center justify-center gap-2 border border-[#EFE2D2] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>View bill</span>
                </button>

                {b.status === 'completed' && (
                  <button
                    type="button"
                    onClick={() => setRatingBooking(b)}
                    className="btn-primary w-full text-xs"
                  >
                    <Star className="w-4 h-4" />
                    <span>Rate {b.worker?.full_name || 'worker'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {selectedInvoiceBookingId && (
        <InvoiceModal
          isOpen={Boolean(selectedInvoiceBookingId)}
          bookingId={selectedInvoiceBookingId}
          onClose={() => setSelectedInvoiceBookingId(null)}
        />
      )}

      {/* Customer → Worker Rating Modal */}
      {ratingBooking && (
        <RatingModal
          isOpen={Boolean(ratingBooking)}
          bookingId={ratingBooking.id}
          workerName={ratingBooking.worker?.full_name || 'Worker'}
          direction="customer_to_worker"
          onClose={() => setRatingBooking(null)}
        />
      )}
    </div>
  );
};
export default CustomerBookings;
