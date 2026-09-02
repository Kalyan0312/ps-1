import React from 'react';
import { X, MapPin, Mic, TrendingUp, CreditCard, CheckCircle2 } from 'lucide-react';
import { HealthResponse } from '@/services/api';

export type TechFeatureType = 'postgis' | 'voice' | 'forecast' | 'escrow';

interface TechArchitectureModalProps {
  feature: TechFeatureType | null;
  onClose: () => void;
  healthData: HealthResponse | null;
}

export const TechArchitectureModal: React.FC<TechArchitectureModalProps> = ({
  feature,
  onClose,
  healthData,
}) => {
  if (!feature) return null;

  const content = {
    postgis: {
      title: 'PostGIS Spatial Dispatch Engine',
      icon: MapPin,
      color: 'text-[#527A62]',
      bg: 'bg-[#527A62]/10',
      border: 'border-[#527A62]/30',
      tag: 'EPSG:4326 Coordinate System',
      description:
        'High-performance geospatial dispatch engine calculates real-time spherical distances (ST_DWithin, ST_DistanceSphere) to route closest verified workers within milliseconds, minimizing carbon footprint and arrival wait times.',
      stats: [
        { label: 'Spatial Driver', value: healthData?.database?.postgis_version?.split(' ')[0] || 'PostGIS 3.4' },
        { label: 'Coordinate System', value: 'WGS 84 (SRID 4326)' },
        { label: 'Dispatch Radius', value: '5.0 km dynamic bounding box' },
        { label: 'Location Privacy', value: 'Obfuscated post-job completion' },
      ],
      highlights: [
        'Sub-millisecond KNN spatial index querying (GIST indexes)',
        'Live worker GPS broadcast over WebSocket channels',
        'Automatic fallbacks when workers are out of radius',
      ],
    },
    voice: {
      title: 'Multilingual Voice AI Booking',
      icon: Mic,
      color: 'text-[#C9684A]',
      bg: 'bg-[#C9684A]/10',
      border: 'border-[#C9684A]/30',
      tag: 'GCP Speech-to-Text & Entity Extractor',
      description:
        'Empowers non-literate and regional language customers & workers to book services naturally using voice in Hindi, Tamil, Telugu, Kannada, Bengali, and English with automatic semantic slot extraction.',
      stats: [
        { label: 'Supported Languages', value: '12+ Indian Regional Languages' },
        { label: 'Recognition Model', value: 'Chirp 2 / Latest Conformer' },
        { label: 'Intent Parser', value: 'Regex + FastAPI NLP pipeline' },
        { label: 'Audio Latency', value: '< 650ms end-to-end' },
      ],
      highlights: [
        'Automatic entity extraction for service category, urgency, and location',
        'Instant fallback to tap-and-type sheets if voice is unclear',
        'Voice prompt confirmation with audio waveform visualization',
      ],
    },
    forecast: {
      title: 'Predictive Demand & Surge Guard',
      icon: TrendingUp,
      color: 'text-[#9A5B3A]',
      bg: 'bg-[#9A5B3A]/10',
      border: 'border-[#9A5B3A]/30',
      tag: 'Fair Multipliers Capped at 1.75x',
      description:
        'Transparent time-series forecasting model predicts service demand spikes across city sectors while enforcing democratic cooperative price floors and hard-capping surge multipliers at 1.75x.',
      stats: [
        { label: 'Forecasting Engine', value: healthData?.services?.forecasting_engine || 'Baseline Time-Series' },
        { label: 'Surge Multiplier Cap', value: '1.75x Maximum' },
        { label: 'Minimum Wage Floor', value: '₹200 / hour guaranteed' },
        { label: 'Model Update Cadence', value: 'Every 15 minutes' },
      ],
      highlights: [
        'Democratic pricing formula transparently shown to customer before payment',
        'Zero algorithmic wage suppression',
        'Direct revenue distribution: 85% to worker, 10% cooperative reserve, 5% welfare',
      ],
    },
    escrow: {
      title: 'UPI Escrow & Direct Settlement',
      icon: CreditCard,
      color: 'text-[#527A62]',
      bg: 'bg-[#527A62]/10',
      border: 'border-[#527A62]/30',
      tag: 'NPCI UPI Direct Payouts',
      description:
        'Secure milestone-based payment escrow with automated fund locking at booking initiation and instant UPI bank settlement directly to the verified worker upon mutual completion code verification.',
      stats: [
        { label: 'Settlement Protocol', value: 'Instant UPI 2.0 / IMPS' },
        { label: 'Worker Wage Allocation', value: '85.0% Guaranteed' },
        { label: 'Welfare Fund Pool', value: '5.0% Direct Health/Accident' },
        { label: 'Dispute Protection', value: 'Guild Arbitration Escrow Hold' },
      ],
      highlights: [
        '100% itemized invoice generated automatically for every booking',
        'Zero commission extracted by middlemen platforms',
        'Automatic welfare contribution deposited into cooperative emergency pool',
      ],
    },
  }[feature];

  const Icon = content.icon;

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#FFFFFF] rounded-3xl p-6 shadow-2xl border border-[#E0D5C8] text-[#171717] space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E0D5C8]">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${content.bg} ${content.color} border ${content.border}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F7F3EC] border border-[#E0D5C8] text-[10px] font-bold text-[#9A5B3A] uppercase tracking-wider">
                {content.tag}
              </span>
              <h2 className="text-lg font-bold text-[#171717] font-display mt-1">
                {content.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-[#F7F3EC] text-[#6F6A63] transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Description */}
        <p className="text-xs text-[#6F6A63] leading-relaxed">
          {content.description}
        </p>

        {/* System Telemetry & Stats Grid */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-[#171717] uppercase tracking-wider font-display">
            Architecture Specifications
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {content.stats.map((stat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#F7F3EC] border border-[#E0D5C8] space-y-0.5">
                <span className="text-[10px] text-[#6F6A63] font-medium">{stat.label}</span>
                <p className="text-xs font-bold text-[#171717] font-mono truncate">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Innovations */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-[#171717] uppercase tracking-wider font-display">
            Key Architectural Guarantees
          </p>
          <div className="space-y-1.5">
            {content.highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#171717]">
                <CheckCircle2 className="w-4 h-4 text-[#527A62] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="btn-secondary w-full py-3 text-xs font-bold"
          >
            Close Architecture Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
export default TechArchitectureModal;
