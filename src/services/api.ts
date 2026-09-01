export interface DatabaseHealth {
  status: string;
  connected: boolean;
  latency_ms?: number;
  database_name?: string;
  postgis_available: boolean;
  postgis_version?: string;
  error_message?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  project: string;
  version: string;
  environment: string;
  timestamp: string;
  database: DatabaseHealth;
  services: {
    speech_to_text: boolean;
    payments_gateway: boolean;
    firebase_notifications: boolean;
    forecasting_engine: string;
    realtime_websockets: string;
  };
}

const API_BASE = '/api/v1';

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Health check request failed with status: ${response.status}`);
  }

  return response.json();
}
