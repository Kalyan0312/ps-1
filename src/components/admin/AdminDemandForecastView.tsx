import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowUpRight,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import {
  fetchDemandForecast,
  DemandForecastResponse,
  DayForecastPoint
} from '@/services/admin';

export const AdminDemandForecastView: React.FC = () => {
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [forecast, setForecast] = useState<DemandForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayForecastPoint | null>(null);

  const loadForecast = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDemandForecast(horizonDays);
      setForecast(data);
      if (data.day_wise_forecast.length > 0) {
        setSelectedDay(data.day_wise_forecast[0]);
      }
    } catch (err: any) {
      console.error('Failed to load demand forecast:', err);
      setError(err.message || 'Failed to generate demand forecast');
    } finally {
      setLoading(false);
    }
  }, [horizonDays]);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  if (loading && !forecast) {
    return (
      <div className="p-12 text-center text-[#6F6A63] space-y-3 bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#9A5B3A]" />
        <p className="text-sm font-medium">Running seasonal regression demand forecasting model...</p>
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div className="p-6 rounded-2xl bg-[#A94A43]/10 border border-[#A94A43]/30 text-[#A94A43] space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#A94A43]" />
          <h4 className="font-bold text-sm">Demand Forecast Engine Error</h4>
        </div>
        <p className="text-xs">{error || 'Unknown forecasting error occurred'}</p>
        <button
          onClick={loadForecast}
          className="btn-danger py-1.5 px-4 text-xs font-bold"
        >
          Retry Forecast
        </button>
      </div>
    );
  }

  const {
    summary,
    day_wise_forecast,
    service_demand_forecast,
    locality_demand_forecast,
    peak_hours_distribution,
    worker_dispatch_recommendations
  } = forecast;

  const maxForecastRequests = Math.max(
    ...day_wise_forecast.map((d) => d.upper_bound_95),
    1
  );

  return (
    <div className="space-y-6">
      {/* ─── FORECAST HEADER & HORIZON CONTROLLER ─────────────────────────── */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-6 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#EFE2D2] text-[#9A5B3A]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#171717] font-display">Multi-Dimensional Demand Forecasting</h2>
                <span className="badge-warning text-[10px]">
                  Seasonal Baseline
                </span>
              </div>
              <p className="text-xs text-[#6F6A63] mt-0.5">
                AI Time-series projections across services, zones, and future days to mobilize cooperative workers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center bg-[#F7F3EC] rounded-xl p-1 border border-[#E0D5C8] text-xs font-bold">
              <button
                onClick={() => setHorizonDays(7)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  horizonDays === 7
                    ? 'bg-[#9A5B3A] text-white shadow-sm'
                    : 'text-[#6F6A63] hover:text-[#171717]'
                }`}
              >
                7-Day Horizon
              </button>
              <button
                onClick={() => setHorizonDays(14)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  horizonDays === 14
                    ? 'bg-[#9A5B3A] text-white shadow-sm'
                    : 'text-[#6F6A63] hover:text-[#171717]'
                }`}
              >
                14-Day Horizon
              </button>
            </div>

            <button
              onClick={loadForecast}
              className="p-2.5 rounded-xl bg-[#EFE2D2] text-[#6F6A63] hover:text-[#171717] transition-colors"
              title="Re-run forecast"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Guardrail Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E0D5C8] text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#527A62]/10 border border-[#527A62]/30 text-[#527A62] font-medium">
            <Shield className="w-3.5 h-3.5 text-[#527A62]" />
            <span>Pricing AI: <strong>Disabled</strong> (100% Deterministic Rule-Based Pricing)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE2D2] border border-[#E0D5C8] text-[#9A5B3A] font-medium font-mono">
            <Zap className="w-3.5 h-3.5 text-[#9A5B3A]" />
            <span>Model: {forecast.model_name} (Confidence: {forecast.confidence_score_percent}%)</span>
          </div>

          {forecast.is_synthetic_demo_data && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9A5B3A]/10 border border-[#9A5B3A]/30 text-[#9A5B3A] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#9A5B3A]" />
              <span>Demo Modeled Baseline (Sparse Historical Seed Records)</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── SUMMARY KPI CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-[#6F6A63]">Total Projected Requests</span>
          <p className="text-2xl font-black text-[#171717] font-mono">
            {summary.total_projected_requests} <span className="text-xs text-[#6F6A63] font-normal">gigs</span>
          </p>
          <p className="text-[11px] text-[#9A5B3A] font-medium">~{summary.avg_daily_projected_requests} requests / day average</p>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-[#6F6A63]">Projected Gross Volume</span>
          <p className="text-2xl font-black text-[#527A62] font-mono">
            ₹{summary.projected_total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-[#527A62] font-medium">₹{summary.projected_worker_earnings_85.toLocaleString('en-IN', { minimumFractionDigits: 0 })} to workers (85%)</p>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-[#6F6A63]">Peak Demand Day</span>
          <p className="text-2xl font-black text-[#9A5B3A] font-mono">
            {summary.highest_demand_day}
          </p>
          <p className="text-[11px] text-[#9A5B3A] font-medium">Weekend Surge Expected</p>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-[#6F6A63]">Hotspot Locality</span>
          <p className="text-2xl font-black text-[#C9684A] font-mono">
            {summary.highest_demand_locality}
          </p>
          <p className="text-[11px] text-[#C9684A] font-medium">High Surge Pressure Zone</p>
        </div>
      </div>

      {/* ─── DAY-WISE DEMAND FORECAST TIMELINE & CONFIDENCE INTERVALS ───────── */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#9A5B3A]" />
              <h3 className="font-bold text-base text-[#171717] font-display">{horizonDays}-Day Projected Demand Curve</h3>
            </div>
            <p className="text-xs text-[#6F6A63] mt-0.5">
              Day-by-day request forecast with 95% upper/lower confidence intervals
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#9A5B3A]">
              <span className="w-3 h-3 rounded bg-[#9A5B3A]" /> Predicted Mean
            </span>
            <span className="flex items-center gap-1.5 text-[#6F6A63]">
              <span className="w-3 h-3 rounded bg-[#EFE2D2] border border-[#C9A07A]" /> 95% Confidence Band
            </span>
          </div>
        </div>

        {/* Interactive Timeline Bars */}
        <div className="h-60 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-2 border-b border-[#E0D5C8]">
          {day_wise_forecast.map((day) => {
            const predHeight = Math.round((day.predicted_requests / maxForecastRequests) * 100);
            const upperHeight = Math.round((day.upper_bound_95 / maxForecastRequests) * 100);
            const isSelected = selectedDay?.date === day.date;

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative p-1 rounded-xl transition-all ${
                  isSelected ? 'bg-[#EFE2D2] ring-1 ring-[#9A5B3A]' : 'hover:bg-[#F7F3EC]'
                }`}
              >
                {/* Confidence Range Column */}
                <div className="w-full flex justify-center items-end relative h-full">
                  {/* Upper Bound Shadow */}
                  <div
                    style={{ height: `${upperHeight}%` }}
                    className="w-full max-w-[32px] bg-[#EFE2D2] border border-dashed border-[#C9A07A] rounded-t-lg absolute bottom-0"
                  />
                  {/* Predicted Mean Bar */}
                  <div
                    style={{ height: `${predHeight}%` }}
                    className={`w-full max-w-[24px] rounded-t-md transition-all duration-300 relative z-10 ${
                      day.is_weekend ? 'bg-[#C9684A] group-hover:bg-[#9A5B3A]' : 'bg-[#9A5B3A] group-hover:bg-[#C9684A]'
                    }`}
                  />
                </div>

                {/* Day Label */}
                <div className="text-center mt-2">
                  <span className={`block text-[11px] font-bold ${isSelected ? 'text-[#171717]' : 'text-[#6F6A63]'}`}>
                    {day.day_name.slice(0, 3)}
                  </span>
                  <span className="text-[9px] text-[#6F6A63] font-mono">
                    {day.predicted_requests}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Inspector */}
        {selectedDay && (
          <div className="p-4 rounded-xl bg-[#F7F3EC] border border-[#E0D5C8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[#6F6A63] block">Forecast Date:</span>
              <span className="font-bold text-[#171717] text-sm">{selectedDay.day_name}, {selectedDay.date}</span>
              {selectedDay.is_weekend && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#9A5B3A]/20 text-[#9A5B3A] text-[10px] font-bold">
                  Weekend Peak
                </span>
              )}
            </div>
            <div>
              <span className="text-[#6F6A63] block">Predicted Requests:</span>
              <span className="font-bold text-[#9A5B3A] text-sm">{selectedDay.predicted_requests}</span>
              <span className="text-[#6F6A63] text-[11px] block">Range: {selectedDay.lower_bound_95} – {selectedDay.upper_bound_95}</span>
            </div>
            <div>
              <span className="text-[#6F6A63] block">Projected Revenue:</span>
              <span className="font-bold text-[#527A62] text-sm">₹{selectedDay.projected_revenue.toLocaleString('en-IN')}</span>
              <span className="text-[#6F6A63] text-[11px] block">Comp Rate: {selectedDay.expected_completion_rate}%</span>
            </div>
            <div>
              <span className="text-[#6F6A63] block">Weather Risk Factor:</span>
              <span className={`font-bold text-sm uppercase ${
                selectedDay.weather_risk_factor === 'normal' ? 'text-[#527A62]' : 'text-[#9A5B3A]'
              }`}>
                {selectedDay.weather_risk_factor.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── TWO COLUMNS: SERVICE DEMAND & LOCALITY DEMAND ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Service Category Demand Forecast */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0D5C8]">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#9A5B3A]" />
              <h3 className="font-bold text-base text-[#171717] font-display">Service Category Demand Projections</h3>
            </div>
            <span className="text-xs text-[#6F6A63] font-mono">Volume & Growth</span>
          </div>

          <div className="space-y-3">
            {service_demand_forecast.map((service) => (
              <div
                key={service.service_id}
                className="p-3.5 rounded-xl bg-[#F7F3EC] border border-[#E0D5C8] space-y-2 hover:border-[#9A5B3A] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#171717]">{service.service_name}</h4>
                    <p className="text-[11px] text-[#6F6A63]">Peak Slot: {service.peak_demand_slot}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-[#9A5B3A] font-mono">
                      {service.predicted_weekly_volume} gigs
                    </span>
                    <div className="flex items-center justify-end gap-1 text-[11px] text-[#527A62] font-mono font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{service.growth_percent}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E0D5C8] font-mono">
                  <span className="text-[#6F6A63]">Demand Share: {service.demand_share_percent}%</span>
                  <span className="text-[#9A5B3A] font-bold">
                    Target Workers: {service.recommended_active_workers} active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Locality Demand Forecast */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0D5C8]">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C9684A]" />
              <h3 className="font-bold text-base text-[#171717] font-display">Locality Demand Pressure & Hotspots</h3>
            </div>
            <span className="text-xs text-[#6F6A63] font-mono">Bangalore Zones</span>
          </div>

          <div className="space-y-3">
            {locality_demand_forecast.map((loc) => (
              <div
                key={loc.locality_id}
                className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
                  loc.deficit_warning
                    ? 'bg-[#A94A43]/10 border-[#A94A43]/30'
                    : 'bg-[#F7F3EC] border-[#E0D5C8] hover:border-[#9A5B3A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#171717]">{loc.locality_name}</h4>
                    {loc.deficit_warning && (
                      <span className="badge-error text-[10px]">
                        Capacity Deficit
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#6F6A63]">Demand Index: </span>
                    <span className="font-mono font-black text-sm text-[#9A5B3A]">
                      {loc.demand_index} / 10
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E0D5C8]">
                    <span className="text-[10px] text-[#6F6A63] block">Est Daily</span>
                    <span className="font-bold text-[#171717]">{loc.projected_daily_requests} requests</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E0D5C8]">
                    <span className="text-[10px] text-[#6F6A63] block">Available</span>
                    <span className="font-bold text-[#527A62]">{loc.active_worker_capacity} workers</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E0D5C8]">
                    <span className="text-[10px] text-[#6F6A63] block">Target Needed</span>
                    <span className={`font-bold ${loc.deficit_warning ? 'text-[#A94A43]' : 'text-[#9A5B3A]'}`}>
                      {loc.recommended_workers} workers
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── ROW 4: PEAK HOURS DISTRIBUTION & DISPATCH RECOMMENDATIONS ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Distribution */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E0D5C8]">
            <Clock className="w-5 h-5 text-[#9A5B3A]" />
            <h3 className="font-bold text-base text-[#171717] font-display">Intra-Day Peak Demand Curve</h3>
          </div>

          <div className="space-y-3">
            {peak_hours_distribution.map((slot) => (
              <div key={slot.time_slot} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#171717] font-medium">{slot.time_slot}</span>
                  <span className="text-[#9A5B3A] font-bold">
                    {slot.demand_percentage}% volume ({slot.recommended_guild_readiness})
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#EFE2D2] overflow-hidden">
                  <div
                    style={{ width: `${slot.demand_percentage * 2.5}%` }}
                    className="h-full bg-gradient-to-r from-[#9A5B3A] to-[#C9684A] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worker Dispatch Action Targets */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E0D5C8]">
            <Activity className="w-5 h-5 text-[#527A62]" />
            <h3 className="font-bold text-base text-[#171717] font-display">Guild Dispatch Actions & Mobilization</h3>
          </div>

          <div className="space-y-3">
            {worker_dispatch_recommendations.map((action, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#F7F3EC] border border-[#E0D5C8] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#171717]">{action.locality}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      action.priority === 'HIGH' ? 'badge-error'
                      : action.priority === 'MEDIUM' ? 'badge-warning'
                      : 'badge-success'
                    }`}>
                      {action.priority} Priority
                    </span>
                  </div>
                  <span className="text-[#6F6A63] font-mono">
                    {action.current_available}/{action.required_guild_capacity} Workers Active
                  </span>
                </div>
                <p className="text-[#6F6A63] font-medium">{action.action_text}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {action.target_services.map((svc: string) => (
                    <span key={svc} className="px-2 py-0.5 rounded bg-[#EFE2D2] text-[10px] text-[#9A5B3A] font-mono">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDemandForecastView;
