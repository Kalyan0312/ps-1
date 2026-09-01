import React, { useState } from 'react';
import { ShieldAlert, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { useRealtimeEvent } from '@/contexts/RealtimeContext';

interface SOSAlert {
  alert_id: string;
  timestamp: string;
  message: string;
  booking_reference?: string;
  worker_name?: string;
  customer_name?: string;
  booking_status?: string;
  status: string;
}

export const AdminSOSQueue: React.FC = () => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);

  useRealtimeEvent('sos.priority_alert', (payload: any) => {
    setAlerts((prev) => [payload, ...prev]);
  });

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.alert_id !== alertId));
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E0D5C8] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#527A62]/10 text-[#527A62] border border-[#527A62]/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#171717] font-display">Emergency Response Queue</h2>
            <p className="text-xs text-[#6F6A63]">0 active SOS alerts. All cooperative operations nominal.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border-2 border-[#A94A43] shadow-md space-y-4 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#A94A43]/15 text-[#A94A43] animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#A94A43] font-display">Emergency Response Queue</h2>
              <p className="text-xs text-[#A94A43] font-bold">{alerts.length} Active SOS Alert{alerts.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.alert_id} className="bg-[#F7F3EC] border border-[#E0D5C8] rounded-xl p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#A94A43]"></div>
              <div className="pl-2 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="badge-error text-xs font-bold uppercase">Priority</span>
                  <span className="text-xs text-[#6F6A63] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTime(alert.timestamp)}
                  </span>
                  <span className="text-xs text-[#6F6A63] font-mono">ID: {alert.alert_id}</span>
                </div>
                
                <p className="text-sm font-bold text-[#171717]">
                  {alert.message}
                </p>

                {alert.booking_reference && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[#6F6A63]">Booking Ref:</span>
                      <p className="font-bold text-[#9A5B3A]">{alert.booking_reference}</p>
                    </div>
                    <div>
                      <span className="text-[#6F6A63]">Worker:</span>
                      <p className="font-medium text-[#171717]">{alert.worker_name}</p>
                    </div>
                    <div>
                      <span className="text-[#6F6A63]">Customer:</span>
                      <p className="font-medium text-[#171717]">{alert.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-[#6F6A63]">Status:</span>
                      <p className="font-medium text-[#171717]">{alert.booking_status}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button className="btn-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#9A5B3A]" /> Live GPS
                </button>
                <button 
                  onClick={() => resolveAlert(alert.alert_id)}
                  className="btn-danger px-4 py-2 text-xs font-bold"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AdminSOSQueue;
