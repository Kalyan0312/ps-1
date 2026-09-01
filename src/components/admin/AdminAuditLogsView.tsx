import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Database,
  IndianRupee,
  UserCheck,
  Settings,
  Clock
} from 'lucide-react';
import { fetchAuditLogs, AuditLogEntry } from '@/services/admin';

const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PRICING_RULE_CREATED: { label: 'Rule Created', color: 'text-[#527A62]', icon: <IndianRupee className="w-3.5 h-3.5" /> },
  PRICING_RULE_UPDATED: { label: 'Rule Updated', color: 'text-[#9A5B3A]', icon: <IndianRupee className="w-3.5 h-3.5" /> },
  PRICING_RULE_DELETED: { label: 'Rule Deleted', color: 'text-[#A94A43]', icon: <IndianRupee className="w-3.5 h-3.5" /> },
  PRICING_CONFIG_UPDATED: { label: 'Config Changed', color: 'text-[#9A5B3A]', icon: <Settings className="w-3.5 h-3.5" /> },
  PRICING_CONFIG_INITIALIZED: { label: 'Config Init', color: 'text-[#6F6A63]', icon: <Settings className="w-3.5 h-3.5" /> },
  WORKER_VERIFICATION_APPROVED: { label: 'Member Approved', color: 'text-[#527A62]', icon: <UserCheck className="w-3.5 h-3.5" /> },
  WORKER_VERIFICATION_REJECTED: { label: 'Application Rejected', color: 'text-[#A94A43]', icon: <UserCheck className="w-3.5 h-3.5" /> },
  SOS_ALERT_TRIGGERED: { label: 'SOS Alert', color: 'text-[#A94A43]', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

const FILTER_CATEGORIES = [
  { value: '', label: 'All Events' },
  { value: 'PRICING_RULE_CREATED', label: 'Rule Created' },
  { value: 'PRICING_RULE_UPDATED', label: 'Rule Updated' },
  { value: 'PRICING_RULE_DELETED', label: 'Rule Deleted' },
  { value: 'PRICING_CONFIG_UPDATED', label: 'Config Changed' },
  { value: 'WORKER_VERIFICATION_APPROVED', label: 'Member Approved' },
  { value: 'WORKER_VERIFICATION_REJECTED', label: 'Application Rejected' },
];

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', hour12: true });
  } catch {
    return ts;
  }
}

function AuditEntryRow({ entry }: { entry: AuditLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = EVENT_TYPE_CONFIG[entry.event_type] ?? {
    label: entry.event_type.replace(/_/g, ' '),
    color: 'text-[#6F6A63]',
    icon: <Database className="w-3.5 h-3.5" />
  };

  return (
    <div
      className={`border-b border-[#E0D5C8] transition-colors ${expanded ? 'bg-[#F7F3EC]' : 'hover:bg-[#F7F3EC]/50'}`}
    >
      <button
        className="w-full text-left px-5 py-3.5 flex items-center gap-3 focus:outline-none"
        onClick={() => setExpanded(p => !p)}
      >
        {/* Event Type Badge */}
        <div className={`flex items-center gap-1.5 min-w-[170px] ${cfg.color}`}>
          {cfg.icon}
          <span className="text-xs font-bold font-mono">{cfg.label}</span>
        </div>

        {/* Target */}
        <span className="text-[11px] text-[#6F6A63] font-mono truncate min-w-[120px] max-w-[160px]">
          {entry.target_resource_type}:{entry.target_resource_id.substring(0, 14)}
        </span>

        {/* Action */}
        <span className="text-[11px] text-[#171717] flex-1 truncate hidden md:block">{entry.action.replace(/_/g, ' ')}</span>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#6F6A63] ml-auto shrink-0 font-mono">
          <Clock className="w-3 h-3 text-[#9A5B3A]" />
          <span>{formatTimestamp(entry.timestamp)}</span>
        </div>

        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full shrink-0 ${entry.status === 'SUCCESS' ? 'bg-[#527A62]' : 'bg-[#A94A43]'}`} />
      </button>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="px-5 pb-4 space-y-3 bg-[#F7F3EC]/60 border-t border-[#E0D5C8]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] pt-3">
            <div>
              <span className="text-[#6F6A63] uppercase tracking-wider font-semibold text-[10px]">Actor</span>
              <p className="text-[#171717] font-mono mt-0.5">{entry.actor_role} / {entry.actor_id || 'system'}</p>
            </div>
            <div>
              <span className="text-[#6F6A63] uppercase tracking-wider font-semibold text-[10px]">Client IP</span>
              <p className="text-[#171717] font-mono mt-0.5">{entry.client_ip || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[#6F6A63] uppercase tracking-wider font-semibold text-[10px]">Log ID</span>
              <p className="text-[#6F6A63] font-mono mt-0.5 text-[10px]">{entry.id}</p>
            </div>
          </div>
          {entry.details && Object.keys(entry.details).length > 0 && (
            <div>
              <p className="text-[#6F6A63] text-[11px] uppercase tracking-wider font-semibold mb-1.5">Change Details</p>
              <pre className="text-[11px] text-[#171717] bg-[#FFFFFF] rounded-xl p-3 font-mono overflow-x-auto whitespace-pre-wrap border border-[#E0D5C8]">
                {JSON.stringify(entry.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogs(filterType || undefined, undefined, 100);
      setLogs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0D5C8] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#EFE2D2] text-[#9A5B3A]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#171717] font-display">Security Audit Trail</h2>
            <p className="text-xs text-[#6F6A63] mt-0.5">
              Immutable record of all pricing changes, worker verifications, and security events
            </p>
          </div>
        </div>
        <button
          onClick={loadLogs}
          className="btn-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E0D5C8] flex items-center gap-3 flex-wrap shadow-sm">
        <Filter className="w-4 h-4 text-[#9A5B3A] shrink-0" />
        <span className="text-xs text-[#6F6A63] font-semibold shrink-0">Filter:</span>
        <div className="flex flex-wrap gap-2">
          {FILTER_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilterType(cat.value)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                filterType === cat.value
                  ? 'bg-[#9A5B3A] border-[#9A5B3A] text-white shadow-sm'
                  : 'bg-[#F7F3EC] border-[#E0D5C8] text-[#6F6A63] hover:border-[#9A5B3A] hover:text-[#171717]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E0D5C8] overflow-hidden shadow-sm">
        {/* Column Headers */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[#E0D5C8] bg-[#F7F3EC]">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6F6A63] min-w-[170px]">Event</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6F6A63] min-w-[120px]">Target</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6F6A63] flex-1 hidden md:block">Action</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6F6A63] ml-auto">Timestamp</span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#9A5B3A] mx-auto" />
            <p className="text-xs text-[#6F6A63]">Loading audit trail...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-2">
            <AlertTriangle className="w-6 h-6 text-[#A94A43] mx-auto" />
            <p className="text-xs text-[#A94A43]">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-[#6F6A63] mx-auto" />
            <p className="text-xs text-[#6F6A63]">No audit log entries match the selected filter.</p>
          </div>
        ) : (
          <div>
            {logs.map(entry => (
              <AuditEntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {/* Footer Stamp */}
        <div className="px-5 py-2.5 border-t border-[#E0D5C8] bg-[#F7F3EC] flex items-center gap-2 text-[10px] text-[#6F6A63]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#527A62]" />
          <span>{logs.length} entries • Immutable append-only audit trail • Secrets redacted from all entries</span>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogsView;
