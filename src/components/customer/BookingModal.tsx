import React, { useState } from 'react';
import { X, MapPin, Clock, CheckCircle2, ArrowRight, Navigation } from 'lucide-react';
import { ServiceCategory } from '@/services/customer';
import { NearbyWorker } from '@/services/workers';
import { WorkerMapView } from '@/components/customer/WorkerMapView';
import { PriceBreakdownView } from '@/components/pricing/PriceBreakdownView';
import { PricingCalculateResponse } from '@/services/pricing';
import { createBooking, BookingDetail } from '@/services/bookings';
import { UPIPaymentModal } from '@/components/customer/UPIPaymentModal';
import { RemoteAdvisorModal } from '@/components/customer/RemoteAdvisorModal';

interface BookingModalProps {
  category: ServiceCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  category,
  isOpen,
  onClose,
  onBookingSuccess
}) => {
  const [viewMode, setViewMode] = useState<'details' | 'map'>('details');
  const [selectedWorker, setSelectedWorker] = useState<NearbyWorker | null>(null);
  const [address, setAddress] = useState('12th Main Road, HAL 2nd Stage, Indiranagar');
  const [timeSlot, setTimeSlot] = useState('Immediate (15-20 mins)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [latestPricing, setLatestPricing] = useState<PricingCalculateResponse | null>(null);
  const [activeBooking, setActiveBooking] = useState<BookingDetail | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [simulateNoWorkers, setSimulateNoWorkers] = useState(false);
  const [isRemoteAdvisorOpen, setIsRemoteAdvisorOpen] = useState(false);

  if (!isOpen || !category) return null;

  const isUrgent = timeSlot.includes('Immediate');
  const scheduledHour = timeSlot.includes('4:00 PM') ? 16 : timeSlot.includes('10:00 AM') ? 10 : 14;

  const handleInitiateBooking = async () => {
    if (simulateNoWorkers) {
      setIsRemoteAdvisorOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const priceTag = latestPricing ? ` (Total: ₹${latestPricing.final_price})` : '';
      const notes = selectedWorker
        ? `Customer specifically selected ${selectedWorker.name} (${selectedWorker.distance_km}km away)${priceTag}`
        : `Auto-dispatched to closest available cooperative worker${priceTag}`;
      
      const newBooking = await createBooking({
        service_id: category.id,
        worker_id: selectedWorker?.worker_id,
        service_address: address,
        booking_type: isUrgent ? 'emergency' : 'scheduled',
        scheduled_time: timeSlot,
        notes: notes,
        factors: {
          is_urgent: isUrgent,
          scheduled_hour: scheduledHour
        }
      });

      setActiveBooking(newBooking);
      setIsPaymentOpen(true);
    } catch (e) {
      alert('Could not create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onBookingSuccess();
      onClose();
    }, 1200);
  };


  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-3xl p-5 shadow-2xl border border-[#EFE2D2] text-[#171717] space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE2D2]">
          <div>
            <h2 className="font-extrabold text-lg text-[#171717] font-display">{category.name}</h2>
            <p className="text-xs text-[#6F6A63]">Fair price • Worker-owned</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[48px] min-w-[48px] rounded-full hover:bg-[#EFE2D2] text-[#6F6A63] transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {viewMode === 'map' ? (
          /* MAP VIEW & WORKER SELECTION */
          <WorkerMapView
            serviceName={category.name}
            onSelectWorker={(w) => {
              setSelectedWorker(w);
              setViewMode('details');
            }}
            onCancel={() => setViewMode('details')}
          />
        ) : (
          /* DETAILS VIEW */
          <>
            {/* View Nearby Workers On Map CTA */}
            <div
              onClick={() => setViewMode('map')}
              className="p-3 rounded-2xl bg-[#F7F3EC] border border-[#EFE2D2] hover:border-[#9A5B3A] transition-colors flex items-center justify-between cursor-pointer min-h-[72px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#9A5B3A] text-white">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                <p className="text-xs font-extrabold text-[#171717]">
                    {selectedWorker ? `Selected: ${selectedWorker.name} (${selectedWorker.distance_km} km)` : 'Find a worker near you'}
                  </p>
                  <p className="text-[10px] text-[#6F6A63]">
                    {selectedWorker ? `★ ${selectedWorker.rating} rating` : 'See available workers on map'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#9A5B3A] hover:underline">
                {selectedWorker ? 'Change' : 'Open Map'}
              </span>
            </div>

            {/* Address Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9A5B3A]" />
                <span>Service Address</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F7F3EC] border border-[#EFE2D2] text-xs font-medium text-[#171717] focus:outline-none focus:border-[#9A5B3A]"
              />
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9A5B3A]" />
                <span>When</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'Immediate (15-20 mins)', label: 'Now (15–20 min)' },
                  { val: 'Today, 4:00 PM', label: 'Today 4 PM' },
                  { val: 'Tomorrow, 10:00 AM', label: 'Tomorrow 10 AM' },
                  { val: 'Choose Time', label: 'Pick time' },
                ].map((slot) => (
                  <button
                    key={slot.val}
                    type="button"
                    onClick={() => setTimeSlot(slot.val)}
                    className={`min-h-[48px] py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      timeSlot === slot.val
                        ? 'bg-[#9A5B3A] text-white border-[#9A5B3A] shadow-sm'
                        : 'bg-[#F7F3EC] text-[#6F6A63] border-[#EFE2D2] hover:border-[#9A5B3A]'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LIVE RULE-BASED PRICING BREAKDOWN (FastAPI Backend) */}
            <PriceBreakdownView
              serviceId={category.id}
              initialFactors={{
                is_urgent: isUrgent,
                scheduled_hour: scheduledHour
              }}
              showSimulators={true}
              onPriceCalculated={setLatestPricing}
            />

            <div className="flex items-center gap-2 mt-4 px-2">
              <input
                type="checkbox"
                id="simNoWorkers"
                checked={simulateNoWorkers}
                onChange={(e) => setSimulateNoWorkers(e.target.checked)}
                className="w-4 h-4 text-[#9A5B3A] rounded border-[#EFE2D2] focus:ring-[#9A5B3A]"
              />
              <label htmlFor="simNoWorkers" className="text-xs text-[#6F6A63] font-medium">
                Force "No workers nearby" (Test Phase 12)
              </label>
            </div>

            {/* Primary Action Button — Pay now */}
            <button
              type="button"
              onClick={handleInitiateBooking}
              disabled={isSubmitting}
              className="btn-primary w-full text-sm shadow-xl shadow-[#9A5B3A]/25 disabled:opacity-50"
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Booked!</span>
                </>
              ) : isSubmitting ? (
                <span>Creating booking...</span>
              ) : (
                <>
                  <span>
                    Pay now {latestPricing ? `(₹${latestPricing.final_price.toFixed(2)})` : ''}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}

        {/* UPI Escrow Payment Modal */}
        {activeBooking && (
          <UPIPaymentModal
            isOpen={isPaymentOpen}
            bookingId={activeBooking.id}
            amount={activeBooking.price.final_price}
            serviceName={activeBooking.service.name}
            onClose={() => setIsPaymentOpen(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* Remote Advisor Modal */}
        <RemoteAdvisorModal
          isOpen={isRemoteAdvisorOpen}
          category={category}
          onClose={() => setIsRemoteAdvisorOpen(false)}
        />
      </div>
    </div>
  );
};
export default BookingModal;


