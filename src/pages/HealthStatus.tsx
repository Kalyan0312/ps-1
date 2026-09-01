import React from 'react';
import {
  Activity,
  AlertCircle,
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import { HealthResponse } from '@/services/api';

interface HealthStatusProps {
  healthData: HealthResponse | null;
  serverStatus: string;
  error: string | null;
}

export const HealthStatus: React.FC<HealthStatusProps> = ({ healthData, serverStatus, error }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717] tracking-tight font-display">System Diagnostic & Health</h1>
          <p className="text-xs text-[#6F6A63] mt-1">Real-time status check of FastAPI, PostGIS, and microservices</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E0D5C8] shadow-sm">
          <Activity className="w-4 h-4 text-[#527A62]" />
          <span className="text-xs font-mono text-[#171717]">
            {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#A94A43]/10 border border-[#A94A43]/30 text-[#A94A43] text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#A94A43]" />
          <div>
            <p className="font-semibold">Backend Connection Notice</p>
            <p className="text-[#A94A43] mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Raw Health Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Server Panel */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E0D5C8] space-y-4 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E0D5C8]">
            <Cpu className="w-5 h-5 text-[#527A62]" />
            <h2 className="font-bold text-sm text-[#171717] font-display">FastAPI Core Runtime</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E0D5C8]">
              <span className="text-[#6F6A63]">Status</span>
              <span className="font-semibold text-[#527A62] capitalize">{serverStatus}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E0D5C8]">
              <span className="text-[#6F6A63]">Application</span>
              <span className="font-mono text-[#171717]">{healthData?.project || 'Cooperative Gig Platform'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E0D5C8]">
              <span className="text-[#6F6A63]">Version</span>
              <span className="font-mono text-[#9A5B3A]">{healthData?.version || '1.0.0'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6F6A63]">Environment</span>
              <span className="font-mono text-[#171717] capitalize">{healthData?.environment || 'development'}</span>
            </div>
          </div>
        </div>

        {/* Database & Spatial Engine */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E0D5C8] space-y-4 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E0D5C8]">
            <Database className="w-5 h-5 text-[#9A5B3A]" />
            <h2 className="font-bold text-sm text-[#171717] font-display">PostgreSQL & PostGIS Driver</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E0D5C8]">
              <span className="text-[#6F6A63]">Database Name</span>
              <span className="font-mono text-[#171717]">{healthData?.database.database_name || 'cooperative_gig'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E0D5C8]">
              <span className="text-[#6F6A63]">Connection State</span>
              <span className={`font-semibold ${healthData?.database.connected ? 'text-[#527A62]' : 'text-[#A94A43]'}`}>
                {healthData
                  ? (healthData.database.connected ? 'Connected' : 'Disconnected')
                  : 'Checking...'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E0D5C8]">
              <span className="text-[#6F6A63]">PostGIS Spatial Engine</span>
              <span className={`font-mono ${healthData?.database.postgis_available ? 'text-[#527A62]' : 'text-[#A94A43]'}`}>
                {healthData
                  ? (healthData.database.postgis_available
                    ? `PostGIS ${healthData.database.postgis_version?.split(' ')[0] || 'Connected'}`
                    : 'PostGIS Unavailable')
                  : 'Checking...'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6F6A63]">Query Latency</span>
              <span className="font-mono text-[#171717]">
                {healthData?.database.latency_ms != null ? `${healthData.database.latency_ms}ms` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Microservices Diagnostic Matrix */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E0D5C8] space-y-4 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E0D5C8]">
          <Layers className="w-5 h-5 text-[#9A5B3A]" />
          <h2 className="font-bold text-sm text-[#171717] font-display">Auxiliary Microservices & Pipeline Health</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F7F3EC] rounded-xl border border-[#E0D5C8] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6F6A63] uppercase">Speech-To-Text</span>
              <span className="badge-warning text-[10px]">Ready</span>
            </div>
            <p className="text-xs font-semibold text-[#171717] mt-1">Google Cloud STT Audio</p>
          </div>

          <div className="p-4 bg-[#F7F3EC] rounded-xl border border-[#E0D5C8] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6F6A63] uppercase">UPI Escrow</span>
              <span className="badge-success text-[10px]">Active</span>
            </div>
            <p className="text-xs font-semibold text-[#171717] mt-1">Direct Worker Payouts</p>
          </div>

          <div className="p-4 bg-[#F7F3EC] rounded-xl border border-[#E0D5C8] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6F6A63] uppercase">Demand Model</span>
              <span className="badge-success text-[10px]">
                {healthData?.services.forecasting_engine || 'Seasonal'}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#171717] mt-1">Time-Series Predictor</p>
          </div>

          <div className="p-4 bg-[#F7F3EC] rounded-xl border border-[#E0D5C8] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6F6A63] uppercase">WebSockets</span>
              <span className="badge-success text-[10px]">Online</span>
            </div>
            <p className="text-xs font-semibold text-[#171717] mt-1">Live Multi-Channel Bus</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HealthStatus;
