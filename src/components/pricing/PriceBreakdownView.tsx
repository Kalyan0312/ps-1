import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Sparkles,
  CloudRain,
  Flame,
  Moon,
  Calendar,
  Zap,
  Info,
  RefreshCw,
  Sliders
} from 'lucide-react';

import {
  calculatePricing,
  PricingCalculateResponse,
  FactorInput
} from '@/services/pricing';

interface PriceBreakdownViewProps {
  serviceId: string;
  initialFactors?: FactorInput;
  onPriceCalculated?: (result: PricingCalculateResponse) => void;
  showSimulators?: boolean;
}

export const PriceBreakdownView: React.FC<PriceBreakdownViewProps> = ({
  serviceId,
  initialFactors,
  onPriceCalculated,
  showSimulators = true
}) => {
  const [factors, setFactors] = useState<FactorInput>(initialFactors || {
    weather: 'none',
    is_festival: false,
    is_urgent: false,
    demand_level: 'normal',
    scheduled_hour: 14,
    day_of_week: 'monday'
  });

  const [pricing, setPricing] = useState<PricingCalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await calculatePricing({
        service_id: serviceId,
        factors: factors
      });
      setPricing(res);
      if (onPriceCalculated) {
        onPriceCalculated(res);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to compute rule-based price');
    } finally {
      setLoading(false);
    }
  }, [serviceId, factors, onPriceCalculated]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const toggleUrgency = () => {
    setFactors((prev) => ({ ...prev, is_urgent: !prev.is_urgent }));
  };

  const toggleFestival = () => {
    setFactors((prev) => ({ ...prev, is_festival: !prev.is_festival }));
  };

  const setWeather = (w: 'none' | 'rain' | 'storm') => {
    setFactors((prev) => ({ ...prev, weather: w }));
  };

  const toggleNight = () => {
    setFactors((prev) => ({
      ...prev,
      scheduled_hour: prev.scheduled_hour === 23 ? 14 : 23
    }));
  };

  const toggleWeekend = () => {
    setFactors((prev) => ({
      ...prev,
      day_of_week: prev.day_of_week === 'saturday' ? 'monday' : 'saturday'
    }));
  };

  const isNight = (factors.scheduled_hour ?? 14) >= 22 || (factors.scheduled_hour ?? 14) < 6;
  const isWeekend = factors.day_of_week === 'saturday' || factors.day_of_week === 'sunday';

  return (
    <div className="space-y-4">
      {/* Simulation Factor Controls */}
      {showSimulators && (
        <div className="bg-[#F7F3EC] p-3.5 rounded-2xl border border-[#E0D5C8] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63] flex items-center gap-1.5 font-display">
              <Sliders className="w-3.5 h-3.5 text-[#9A5B3A]" />
              <span>Simulate Real-Time Factor Triggers</span>
            </span>
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#9A5B3A]" />}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {/* Weather: Rain */}
            <button
              type="button"
              onClick={() => setWeather(factors.weather === 'rain' ? 'none' : 'rain')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                factors.weather === 'rain'
                  ? 'bg-[#9A5B3A] text-white shadow-sm'
                  : 'bg-[#FFFFFF] text-[#6F6A63] border border-[#E0D5C8] hover:border-[#9A5B3A]'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Rain (+15%)</span>
            </button>

            {/* Weather: Storm */}
            <button
              type="button"
              onClick={() => setWeather(factors.weather === 'storm' ? 'none' : 'storm')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                factors.weather === 'storm'
                  ? 'bg-[#9A5B3A] text-white shadow-sm'
                  : 'bg-[#FFFFFF] text-[#6F6A63] border border-[#E0D5C8] hover:border-[#9A5B3A]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Storm (+25%)</span>
            </button>

            {/* Urgency */}
            <button
              type="button"
              onClick={toggleUrgency}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                factors.is_urgent
                  ? 'bg-[#9A5B3A] text-white shadow-sm'
                  : 'bg-[#FFFFFF] text-[#6F6A63] border border-[#E0D5C8] hover:border-[#9A5B3A]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Urgent 15m (+20%)</span>
            </button>

            {/* Night Time */}
            <button
              type="button"
              onClick={toggleNight}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isNight
                  ? 'bg-[#9A5B3A] text-white shadow-sm'
                  : 'bg-[#FFFFFF] text-[#6F6A63] border border-[#E0D5C8] hover:border-[#9A5B3A]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Late Night (+25%)</span>
            </button>

            {/* Weekend */}
            <button
              type="button"
              onClick={toggleWeekend}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isWeekend
                  ? 'bg-[#9A5B3A] text-white shadow-sm'
                  : 'bg-[#FFFFFF] text-[#6F6A63] border border-[#E0D5C8] hover:border-[#9A5B3A]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekend (+10%)</span>
            </button>

            {/* Festival */}
            <button
              type="button"
              onClick={toggleFestival}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                factors.is_festival
                  ? 'bg-[#9A5B3A] text-white shadow-sm'
                  : 'bg-[#FFFFFF] text-[#6F6A63] border border-[#E0D5C8] hover:border-[#9A5B3A]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Festival (+20%)</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#A94A43]/10 border border-[#A94A43]/30 rounded-xl text-[#A94A43] text-xs font-medium">
          {error}
        </div>
      )}

      {/* Real-time Rule-Based Pricing Breakdown Box */}
      {pricing && (
        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E0D5C8] space-y-3 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E0D5C8]">
            <div>
              <p className="text-[10px] uppercase font-extrabold text-[#6F6A63] tracking-wider font-display">
                Cooperative Rate Breakdown
              </p>
              <h4 className="font-extrabold text-sm text-[#171717] font-display">
                {pricing.service_name}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-[#171717] font-mono">
                ₹{pricing.final_price.toFixed(2)}
              </span>
              <p className="text-[10px] text-[#527A62] font-semibold flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Base Floor Guaranteed</span>
              </p>
            </div>
          </div>

          {/* Surcharge Line items */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[#6F6A63]">
              <span>Base Rate (Cooperative Approved):</span>
              <span className="font-bold text-[#171717] font-mono">₹{pricing.base_price.toFixed(2)}</span>
            </div>

            {pricing.applied_factors.length > 0 ? (
              <div className="py-1 space-y-1 border-t border-b border-dashed border-[#E0D5C8]">
                <p className="text-[10px] font-bold text-[#9A5B3A] uppercase tracking-wider">
                  Applied Rule Factors ({pricing.applied_factors.length}):
                </p>
                {pricing.applied_factors.map((f) => (
                  <div key={f.id} className="flex items-start justify-between text-[11px] pl-1.5 text-[#6F6A63]">
                    <div>
                      <span className="font-semibold text-[#171717]">{f.name}</span>
                      <span className="text-[10px] text-[#9A5B3A] ml-1">({((f.multiplier_weight - 1) * 100).toFixed(0)}%)</span>
                    </div>
                    <span className="font-bold text-[#9A5B3A] font-mono">+₹{f.surcharge_amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-1 text-[11px] text-[#527A62] italic flex items-center gap-1">
                <span>Standard fair rate active • Zero surge multiplier</span>
              </div>
            )}

            {pricing.multiplier_cap_enforced && (
              <div className="p-2 bg-[#EFE2D2] rounded-xl border border-[#C9A07A] text-[#9A5B3A] text-[10px] flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Surge protected: Capped at maximum {pricing.multiplier_cap}x cooperative ceiling.</span>
              </div>
            )}
          </div>

          {/* Three-Way Value Allocation Split (85% Worker / 10% Coop / 5% Welfare) */}
          <div className="pt-2 border-t border-[#E0D5C8] space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A63] font-display">
              Transparent Value Allocation Split
            </p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {/* Worker Share 85% */}
              <div className="p-2.5 rounded-xl bg-[#527A62]/10 border border-[#527A62]/30">
                <p className="text-[10px] font-bold text-[#527A62]">Worker ({pricing.worker_payout_percent}%)</p>
                <p className="text-sm font-extrabold text-[#527A62] mt-0.5 font-mono">
                  ₹{pricing.worker_earning.toFixed(2)}
                </p>
                <p className="text-[9px] text-[#6F6A63]">Direct wage</p>
              </div>

              {/* Cooperative Reserve 10% */}
              <div className="p-2.5 rounded-xl bg-[#9A5B3A]/10 border border-[#9A5B3A]/30">
                <p className="text-[10px] font-bold text-[#9A5B3A]">Guild ({pricing.cooperative_fee_percent}%)</p>
                <p className="text-sm font-extrabold text-[#9A5B3A] mt-0.5 font-mono">
                  ₹{pricing.cooperative_fee.toFixed(2)}
                </p>
                <p className="text-[9px] text-[#6F6A63]">Platform ops</p>
              </div>

              {/* Welfare Pool 5% */}
              <div className="p-2.5 rounded-xl bg-[#527A62]/10 border border-[#527A62]/30">
                <p className="text-[10px] font-bold text-[#527A62]">Welfare ({pricing.welfare_contribution_percent}%)</p>
                <p className="text-sm font-extrabold text-[#527A62] mt-0.5 font-mono">
                  ₹{pricing.welfare_contribution.toFixed(2)}
                </p>
                <p className="text-[9px] text-[#6F6A63]">Health safety</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PriceBreakdownView;
