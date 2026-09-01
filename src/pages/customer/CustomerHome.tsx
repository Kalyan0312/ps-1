import React, { useState, useEffect } from 'react';
import {
  Mic,
  Search,
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Sparkles,
  HeartHandshake,
  Car,
  Trees,
  Cpu,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ServiceCategory, fetchServiceCategories } from '@/services/customer';
import { VoiceBookingSheet } from '@/components/customer/VoiceBookingSheet';
import { TypeBookingSheet } from '@/components/customer/TypeBookingSheet';
import { BookingModal } from '@/components/customer/BookingModal';

interface CustomerHomeProps {
  onGoToBookings: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({ onGoToBookings }) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  useEffect(() => {
    fetchServiceCategories()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Wrench': return Wrench;
      case 'Hammer': return Hammer;
      case 'Paintbrush': return Paintbrush;
      case 'Sparkles': return Sparkles;
      case 'HeartHandshake': return HeartHandshake;
      case 'Car': return Car;
      case 'Trees': return Trees;
      case 'Cpu': return Cpu;
      default: return Wrench;
    }
  };

  // Unified callback from both Talk and Type flows
  const handleUnifiedConfirm = (
    service: string,
    _problem: string,
    _timeSlot: string,
    categoryId?: string,
    baseRate?: number
  ) => {
    // Close input sheets
    setIsVoiceOpen(false);
    setIsTypeOpen(false);

    // Find category object
    const matched = categories.find((c) =>
      c.id === categoryId || c.name.toLowerCase() === service.toLowerCase()
    ) || {
      id: categoryId || 'cat-general',
      name: service,
      slug: service.toLowerCase().replace(/\s+/g, '-'),
      base_rate: baseRate || 250.0,
      minimum_wage_floor: 200.0,
      icon_name: 'Wrench',
      is_active: true,
      workers_available: 12
    };

    setSelectedCategory(matched);
  };

  return (
    <div className="space-y-6 pb-20 max-w-lg mx-auto">
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight font-display">
          What do you need?
        </h1>
        <p className="text-xs font-medium text-[#6F6A63]">
          Worker-owned • Fair prices
        </p>
      </div>

      {/* Two Large Primary Actions: Talk and Type */}
      <div className="grid grid-cols-2 gap-3">
        {/* Large Talk Action */}
        <button
          type="button"
          onClick={() => setIsVoiceOpen(true)}
          className="p-4 sm:p-5 min-h-[90px] rounded-3xl bg-[#9A5B3A] hover:bg-[#C9684A] text-white shadow-lg shadow-[#9A5B3A]/20 transition-all flex flex-col items-center justify-center gap-1.5 group active:scale-98"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-wide">Talk</span>
          <span className="text-[10px] text-white/80 font-medium">Say what you need</span>
        </button>

        {/* Large Type Action */}
        <button
          type="button"
          onClick={() => setIsTypeOpen(true)}
          className="p-4 sm:p-5 min-h-[90px] rounded-3xl bg-[#FFFFFF] border border-[#EFE2D2] text-[#171717] hover:border-[#9A5B3A] shadow-sm transition-all flex flex-col items-center justify-center gap-1.5 group active:scale-98"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#F7F3EC] flex items-center justify-center group-hover:scale-105 transition-transform text-[#9A5B3A]">
            <Search className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-sm tracking-wide">Type</span>
          <span className="text-[10px] text-[#6F6A63] font-medium">Type your need</span>
        </button>
      </div>

      {/* 9 Dynamic Service Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63]">
            All Services ({categories.length})
          </p>
          <span className="text-[10px] font-semibold text-[#527A62] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fair price guarantee</span>
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#6F6A63]">
            Loading services...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {categories.map((cat) => {
              const IconComp = getIcon(cat.icon_name);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="bg-[#FFFFFF] hover:bg-[#F7F3EC] p-3 min-h-[90px] rounded-2xl border border-[#EFE2D2] hover:border-[#9A5B3A] transition-all flex flex-col items-center justify-center text-center gap-1.5 group shadow-sm active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F7F3EC] group-hover:bg-[#FFFFFF] flex items-center justify-center text-[#9A5B3A] transition-colors border border-[#EFE2D2]">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#171717] truncate max-w-[85px]">{cat.name}</h3>
                    <p className="text-[10px] font-semibold text-[#6F6A63] mt-0.5 font-mono">₹{cat.base_rate}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Active Tracking Reminder Banner */}
      <div
        onClick={onGoToBookings}
        className="p-3.5 min-h-[52px] rounded-2xl bg-[#FFFFFF] border border-[#EFE2D2] hover:border-[#9A5B3A] transition-colors flex items-center justify-between cursor-pointer shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#527A62] animate-pulse shrink-0"></div>
          <div>
            <p className="text-xs font-bold text-[#171717]">Track your booking</p>
            <p className="text-[10px] text-[#6F6A63]">Live location & arrival time</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-[#9A5B3A] shrink-0" />
      </div>

      {/* Talk Voice Booking Sheet */}
      <VoiceBookingSheet
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onConfirmEntities={handleUnifiedConfirm}
        onSwitchToType={() => {
          setIsVoiceOpen(false);
          setIsTypeOpen(true);
        }}
      />

      {/* Type Booking Sheet */}
      <TypeBookingSheet
        isOpen={isTypeOpen}
        onClose={() => setIsTypeOpen(false)}
        categories={categories}
        onConfirmType={handleUnifiedConfirm}
      />

      {/* Unified Booking Confirmation Modal */}
      <BookingModal
        category={selectedCategory}
        isOpen={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory(null)}
        onBookingSuccess={onGoToBookings}
      />
    </div>
  );
};
export default CustomerHome;
