/**
 * Phase 11: RealtimeToast
 *
 * Floating notification system for real-time events.
 * Displays contextual toasts for:
 *  - Booking status changes (customer)
 *  - Job requests & earnings (worker)
 *  - SOS alerts (admin)
 *  - Pricing updates (all users)
 */

import React, { useState, useCallback } from 'react';
import {
  CheckCircle2,
  IndianRupee,
  Briefcase,
  Bell,
  ShieldAlert,
  Sliders,
  X
} from 'lucide-react';
import { useRealtimeEvent } from '@/contexts/RealtimeContext';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'danger' | 'earning' | 'pricing';
  title: string;
  message: string;
}

const TOAST_TTL_MS = 5500;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#527A62] shrink-0" />,
    info: <Bell className="w-4 h-4 text-[#9A5B3A] shrink-0" />,
    warning: <Briefcase className="w-4 h-4 text-[#9A5B3A] shrink-0" />,
    danger: <ShieldAlert className="w-4 h-4 text-[#A94A43] shrink-0 animate-pulse" />,
    earning: <IndianRupee className="w-4 h-4 text-[#527A62] shrink-0" />,
    pricing: <Sliders className="w-4 h-4 text-[#9A5B3A] shrink-0" />,
  };

  const colors = {
    success: 'border-[#527A62]/40 bg-[#FFFFFF] text-[#171717]',
    info: 'border-[#E0D5C8] bg-[#FFFFFF] text-[#171717]',
    warning: 'border-[#9A5B3A]/40 bg-[#FFFFFF] text-[#171717]',
    danger: 'border-[#A94A43]/60 bg-[#FFFFFF] text-[#171717] shadow-[#A94A43]/15',
    earning: 'border-[#527A62]/40 bg-[#FFFFFF] text-[#171717]',
    pricing: 'border-[#C9A07A] bg-[#FFFFFF] text-[#171717]',
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl
        text-xs font-medium w-80 max-w-[calc(100vw-2rem)]
        animate-slide-in-right
        ${colors[toast.type]}
      `}
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[11px] uppercase tracking-wider text-[#6F6A63] mb-0.5 font-display">
          {toast.title}
        </p>
        <p className="text-[12px] leading-tight text-[#171717]">{toast.message}</p>
      </div>
      <button
        onClick={onDismiss}
        type="button"
        className="text-[#6F6A63] hover:text-[#171717] transition-colors shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface RealtimeToastProps {
  role: 'customer' | 'worker' | 'admin';
}

export const RealtimeToast: React.FC<RealtimeToastProps> = ({ role }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `t-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_TTL_MS);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Customer events ────────────────────────────────────────────────────────
  useRealtimeEvent('booking.status_changed', (payload) => {
    if (role !== 'customer') return;
    const p = payload as Record<string, string | number | null | Record<string, unknown>>;
    addToast({
      type: 'info',
      title: 'Booking Update',
      message: (p.message as string) ?? `Status: ${p.status}`,
    });
  });

  useRealtimeEvent('booking.completed', (payload) => {
    if (role !== 'customer') return;
    const p = payload as Record<string, string | boolean | number>;
    addToast({
      type: 'success',
      title: 'Service Complete!',
      message: (p.message as string) ?? 'Your booking has been completed.',
    });
  });

  // ─── Worker events ──────────────────────────────────────────────────────────
  useRealtimeEvent('booking.created', (payload) => {
    if (role !== 'worker') return;
    const p = payload as Record<string, string | Record<string, unknown>>;
    const service = (p.service as Record<string, string>)?.name ?? 'New';
    const price = (p.price as Record<string, number>)?.final_price;
    addToast({
      type: 'warning',
      title: 'Incoming Job Request!',
      message: `${service} — ₹${price?.toFixed(0) ?? '—'}. Accept now in Home tab.`,
    });
  });

  useRealtimeEvent('worker.earnings_updated', (payload) => {
    if (role !== 'worker') return;
    const p = payload as Record<string, string | number>;
    addToast({
      type: 'earning',
      title: 'Earnings Credited!',
      message: (p.message as string) ?? `₹${p.new_earning} credited to your account.`,
    });
  });

  useRealtimeEvent('worker.rating_updated', (payload) => {
    if (role !== 'worker') return;
    const p = payload as Record<string, string | number>;
    addToast({
      type: 'info',
      title: 'Rating Updated',
      message: (p.message as string) ?? `Your new rating: ${p.new_rating} ★`,
    });
  });

  // ─── Admin events ────────────────────────────────────────────────────────────
  useRealtimeEvent('sos.priority_alert', (payload) => {
    if (role !== 'admin') return;
    const p = payload as Record<string, string>;
    addToast({
      type: 'danger',
      title: '🚨 SOS PRIORITY ALERT',
      message: (p.message as string) ?? `Emergency from ${p.sender_role}. Immediate response required.`,
    });
  });

  useRealtimeEvent('admin.booking_count_update', (payload) => {
    if (role !== 'admin') return;
    const p = payload as Record<string, string | number>;
    addToast({
      type: 'info',
      title: 'New Booking',
      message: `${p.service} booked — ₹${Number(p.amount).toFixed(0)} (${p.booking_reference})`,
    });
  });

  useRealtimeEvent('admin.revenue_update', (payload) => {
    if (role !== 'admin') return;
    const p = payload as Record<string, number>;
    addToast({
      type: 'earning',
      title: 'Revenue & Welfare Update',
      message: `Coop Fee: ₹${p.cooperative_fee?.toFixed(0)} | Welfare: ₹${p.welfare_contribution?.toFixed(0)} credited.`,
    });
  });

  useRealtimeEvent('admin.grievance_queue_update', (payload) => {
    if (role !== 'admin') return;
    const p = payload as Record<string, string>;
    addToast({
      type: 'warning',
      title: 'New Grievance Filed',
      message: p.subject ?? 'A new grievance has been added to the queue.',
    });
  });

  // ─── Universal: pricing changes ─────────────────────────────────────────────
  useRealtimeEvent('pricing.config_updated', (payload) => {
    const p = payload as Record<string, string | number | boolean>;
    addToast({
      type: 'pricing',
      title: 'Pricing Rules Updated',
      message: (p.message as string) ?? 'Cooperative pricing has been updated.',
    });
  });

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={() => dismiss(toast.id)} />
        </div>
      ))}
    </div>
  );
};

export default RealtimeToast;
