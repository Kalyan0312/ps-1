import React from 'react';
import { RefreshCw } from 'lucide-react';
import { HealthResponse } from '@/services/api';

interface ApiStatusBadgeProps {
  healthData: HealthResponse | null;
  serverStatus: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  compact?: boolean;
  showPingButton?: boolean;
}

export const ApiStatusBadge: React.FC<ApiStatusBadgeProps> = ({
  healthData,
  serverStatus,
  isLoading = false,
  onRefresh,
  compact = false,
  showPingButton = false,
}) => {
  const isHealthy = serverStatus === 'healthy';
  const isChecking = serverStatus === 'checking' || isLoading;

  const dotColor = isHealthy
    ? 'bg-[#527A62]'
    : isChecking
    ? 'bg-[#9A5B3A]'
    : 'bg-[#A94A43]';

  const textColor = isHealthy
    ? 'text-[#527A62]'
    : isChecking
    ? 'text-[#9A5B3A]'
    : 'text-[#A94A43]';

  const statusLabel = isHealthy
    ? 'HEALTHY'
    : isChecking
    ? 'CONNECTING'
    : 'OFFLINE';

  return (
    <div className="flex items-center gap-2">
      {showPingButton && onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE2D2] text-[#171717] text-xs font-medium border border-[#E0D5C8] transition-colors disabled:opacity-50 shadow-sm"
          title="Refresh System Health Status"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isLoading ? 'animate-spin text-[#9A5B3A]' : 'text-[#6F6A63]'
            }`}
          />
          <span className="hidden sm:inline font-mono text-[11px]">
            {isLoading ? 'Checking...' : 'Ping'}
          </span>
        </button>
      )}

      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E0D5C8] text-xs shadow-sm transition-all ${
          compact ? 'px-2 py-1' : ''
        }`}
        title={
          healthData?.database?.latency_ms != null
            ? `PostgreSQL Latency: ${healthData.database.latency_ms}ms`
            : undefined
        }
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
          />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>

        <span className="text-[#6F6A63] font-medium text-[11px] hidden sm:inline">
          API:
        </span>

        <span
          className={`font-bold font-mono text-[10px] tracking-wider uppercase ${textColor}`}
        >
          {statusLabel}
        </span>

        {healthData?.database?.latency_ms != null && !compact && (
          <span className="text-[10px] font-mono text-[#6F6A63] border-l border-[#E0D5C8] pl-1.5 hidden md:inline">
            {healthData.database.latency_ms}ms
          </span>
        )}
      </div>
    </div>
  );
};
export default ApiStatusBadge;
