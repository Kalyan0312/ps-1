/**
 * Phase 11: RealtimeContext
 *
 * Provides a single shared WebSocket connection per user session.
 * Components call useRealtime() to subscribe to typed events.
 * Connection is managed at the portal level (Customer / Worker / Admin).
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { RealtimeClient, createRealtimeClient, RealtimeEvent, Channels } from '@/services/realtime';

interface RealtimeContextValue {
  client: RealtimeClient | null;
  isConnected: boolean;
  /** Subscribe to an event. Returns cleanup function. */
  on: (event: RealtimeEvent | string, cb: (payload: Record<string, unknown>) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  client: null,
  isConnected: false,
  on: () => () => {},
});

interface RealtimeProviderProps {
  channels: string[];
  children: ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ channels, children }) => {
  const clientRef = useRef<RealtimeClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createRealtimeClient(channels);
    clientRef.current = client;

    // Track connection state via the system event
    const unsub = client.on('connection.established', () => setIsConnected(true));

    client.connect();

    return () => {
      unsub();
      client.disconnect();
      clientRef.current = null;
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels.join(',')]);

  const on = useCallback(
    (event: RealtimeEvent | string, cb: (payload: Record<string, unknown>) => void) => {
      if (clientRef.current) {
        return clientRef.current.on(event, cb);
      }
      return () => {};
    },
    []
  );

  return (
    <RealtimeContext.Provider value={{ client: clientRef.current, isConnected, on }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export function useRealtime() {
  return useContext(RealtimeContext);
}

/**
 * Hook to subscribe to a specific real-time event.
 * Automatically cleans up on unmount.
 */
export function useRealtimeEvent(
  event: RealtimeEvent | string,
  callback: (payload: Record<string, unknown>) => void
) {
  const { on } = useRealtime();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const cleanup = on(event, (payload) => callbackRef.current(payload));
    return cleanup;
  }, [event, on]);
}

export { Channels };
