import React, { useState } from 'react';
import { X, Search, Clock, ArrowRight } from 'lucide-react';
import { ServiceCategory } from '@/services/customer';

interface TypeBookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ServiceCategory[];
  onConfirmType: (service: string, problem: string, timeSlot: string, categoryId: string, baseRate: number) => void;
}

export const TypeBookingSheet: React.FC<TypeBookingSheetProps> = ({
  isOpen,
  onClose,
  categories,
  onConfirmType
}) => {
  const [problemText, setProblemText] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || 'cat-electrician');
  const [selectedTime, setSelectedTime] = useState('Immediate (15-20 mins)');

  if (!isOpen) return null;

  const currentCat = categories.find((c) => c.id === selectedCatId) || categories[0];

  const handleContinue = () => {
    const serviceName = currentCat?.name || 'General Service';
    const problem = problemText.trim() || `${serviceName} service request`;
    const baseRate = currentCat?.base_rate || 250.0;
    onConfirmType(serviceName, problem, selectedTime, selectedCatId, baseRate);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-3xl p-5 shadow-2xl border border-[#EFE2D2] text-[#171717] space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE2D2]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9A5B3A]"></span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#6F6A63] font-display">Type to book</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[48px] min-w-[48px] rounded-full hover:bg-[#EFE2D2] text-[#6F6A63] transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question: What do you need? */}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#171717] tracking-tight font-display">
            What do you need?
          </h2>
          <p className="text-xs text-[#6F6A63]">
            Choose a service and describe your problem.
          </p>
        </div>

        {/* Text Box Input */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F6A63] mb-1.5">
            Describe problem
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#6F6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="e.g. Kitchen tap leaking, fan not working"
              className="coop-input pl-10"
            />
          </div>
        </div>

        {/* Choose Service */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F6A63]">
            Choose service
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCatId(cat.id)}
                className={`min-h-[56px] p-2 rounded-xl border text-center transition-all ${
                  selectedCatId === cat.id
                    ? 'bg-[#9A5B3A] text-white border-[#9A5B3A] shadow-sm'
                    : 'bg-[#F7F3EC] text-[#171717] border-[#EFE2D2] hover:border-[#9A5B3A]'
                }`}
              >
                <p className="font-bold text-xs truncate">{cat.name}</p>
                <p className={`text-[10px] font-mono mt-0.5 ${selectedCatId === cat.id ? 'text-white/80' : 'text-[#6F6A63]'}`}>
                  ₹{cat.base_rate}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Choose Time */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F6A63] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#9A5B3A]" />
            <span>When?</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 'Immediate (15-20 mins)', label: 'Now (15–20 min)' },
              { val: 'Today, 4:00 PM', label: 'Today 4 PM' },
              { val: 'Tomorrow, 10:00 AM', label: 'Tomorrow 10 AM' },
              { val: 'Choose Slot', label: 'Choose time' },
            ].map((slot) => (
              <button
                key={slot.val}
                type="button"
                onClick={() => setSelectedTime(slot.val)}
                className={`min-h-[48px] py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  selectedTime === slot.val
                    ? 'bg-[#9A5B3A] text-white border-[#9A5B3A]'
                    : 'bg-[#F7F3EC] text-[#6F6A63] border-[#EFE2D2] hover:border-[#9A5B3A]'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTA — "Book now" */}
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary w-full text-sm shadow-xl shadow-[#9A5B3A]/25"
        >
          <span>Book now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default TypeBookingSheet;
