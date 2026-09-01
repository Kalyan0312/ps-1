/**
 * Phase 11: Real-Time WebSocket Client
 *
 * Connects to ws://host/api/v1/ws?channels=...
 * Handles automatic reconnection with exponential backoff.
 * Dispatches typed events to registered listeners.
 *
 * Usage:
 *   const ws = createRealtimeClient(['customer:cust-123', 'broadcast']);
 *   ws.on('booking.status_changed', (payload) => { ... });
 *   ws.connect();
 */

export type RealtimeEvent =
  | 'connection.established'
  | 'booking.created'
  | 'booking.status_changed'
  | 'booking.completed'
  | 'worker.earnings_updated'
  | 'worker.rating_updated'
  | 'admin.booking_count_update'
  | 'admin.revenue_update'
  | 'admin.grievance_queue_update'
  | 'sos.priority_alert'
  | 'pricing.config_updated';

export interface RealtimeMessage {
  event: RealtimeEvent | string;
  channel: string;
  payload: Record<string, unknown>;
}

type EventListener = (payload: RealtimeMessage['payload']) => void;

const WS_BASE = (() => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/v1/ws`;
})();

const RECONNECT_BASE_DELAY_MS = 1500;
const MAX_RECONNECT_DELAY_MS = 30000;
const HEARTBEAT_INTERVAL_MS = 25000;

export class RealtimeClient {
  private channels: string[];
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<EventListener>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private shouldReconnect = true;
  private isConnecting = false;

  constructor(channels: string[]) {
    this.channels = channels.length ? channels : ['broadcast'];
  }

  connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;
    this.shouldReconnect = true;
    this._connect();
  }

  disconnect() {
    this.shouldReconnect = false;
    this._clearTimers();
    this.ws?.close();
    this.ws = null;
    this.reconnectAttempts = 0;
  }

  on(event: RealtimeEvent | string, listener: EventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    // Return unsubscribe function
    return () => this.listeners.get(event)?.delete(listener);
  }

  off(event: RealtimeEvent | string, listener: EventListener) {
    this.listeners.get(event)?.delete(listener);
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private _connect() {
    this.isConnecting = true;
    const channelsParam = this.channels.join(',');
    const url = `${WS_BASE}?channels=${encodeURIComponent(channelsParam)}`;

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.isConnecting = false;
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this._startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: RealtimeMessage = JSON.parse(event.data as string);
        this._dispatch(msg.event, msg.payload ?? {});
      } catch {
        // pong message or non-JSON - ignore
      }
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this._clearTimers();
      if (this.shouldReconnect) {
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror, handle reconnect there
      this.isConnecting = false;
    };
  }

  private _dispatch(event: string, payload: RealtimeMessage['payload']) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((fn) => {
        try { fn(payload); } catch { /* listener errors are isolated */ }
      });
    }
  }

  private _startHeartbeat() {
    this._clearTimers();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  private _scheduleReconnect() {
    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * Math.pow(1.8, this.reconnectAttempts),
      MAX_RECONNECT_DELAY_MS
    );
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => this._connect(), delay);
  }

  private _clearTimers() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createRealtimeClient(channels: string[]): RealtimeClient {
  return new RealtimeClient(channels);
}

// ─── Convenience channel builders ────────────────────────────────────────────

export const Channels = {
  customer: (id: string) => `customer:${id}`,
  worker: (id: string) => `worker:${id}`,
  admin: () => 'admin',
  broadcast: () => 'broadcast',
};
