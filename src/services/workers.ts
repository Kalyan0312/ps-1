export interface NearbyWorker {
  worker_id: string;
  name: string;
  photo: string;
  rating: number;
  distance_km: number;
  service: string;
  is_available: boolean;
  eta_minutes: number;
  latitude: number;
  longitude: number;
  cooperative_name: string;
}

export interface NearbyWorkersResult {
  service: string;
  search_radius_km: number;
  customer_location: { latitude: number; longitude: number };
  count: number;
  workers: NearbyWorker[];
  emergency_priority: boolean;
  has_workers: boolean;
}

export interface RemoteAdvisorSession {
  session_id: string;
  advisor_name: string;
  advisor_specialty: string;
  status: string;
  call_type: string;
  message: string;
  cooperative_advisor_badge: string;
}

// --- Phase 8 Worker Experience Interfaces ---

export interface WorkerStatus {
  is_available: boolean;
  today_earnings: number;
  jobs_today: number;
  rating: number;
  worker_name: string;
  cooperative_name: string;
  active_job_id?: string | null;
}

export interface WorkerJobRequest {
  id: string;
  service: string;
  distance_km: number;
  fare: number;
  customer_name: string;
  customer_address: string;
  notes?: string;
  created_at: string;
  expires_in_seconds: number;
}

export type JobStage = 'assigned' | 'on_the_way' | 'working' | 'done';

export interface WorkerActiveJob {
  id: string;
  booking_reference: string;
  service: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  distance_km: number;
  status: JobStage;
  fare: number;
  worker_payout: number;
  coop_dividend: number;
  scheduled_time: string;
  eta_minutes: number;
  action_label: string;
  can_advance: boolean;
  notes?: string;
}

export interface WorkerEarningTransaction {
  id: string;
  service: string;
  booking_reference: string;
  amount: number;
  worker_payout: number;
  coop_dividend: number;
  welfare_deduction: number;
  timestamp: string;
  customer_name: string;
}

export interface WorkerEarnings {
  today_earnings: number;
  this_week_earnings: number;
  jobs_count: number;
  welfare_balance: number;
  coop_dividend_accumulated: number;
  payout_rate_percent: number;
  transactions: WorkerEarningTransaction[];
}

export interface WorkerSkill {
  id: string;
  name: string;
  level: string;
  is_certified: boolean;
}

export interface WorkerCertificate {
  id: string;
  title: string;
  issuer: string;
  issued_year: string;
  verification_status: string;
}

export interface WorkerProfileDetail {
  worker_id: string;
  full_name: string;
  photo: string;
  phone_number: string;
  rating: number;
  total_ratings: number;
  cooperative_badge: string;
  cooperative_name: string;
  experience_years: number;
  total_gigs: number;
  skills: WorkerSkill[];
  certificates: WorkerCertificate[];
  bio: string;
  member_since: string;
  upi_id: string;
}

export interface WorkerSOSResponse {
  alert_id: string;
  status: string;
  message: string;
  police_notified: boolean;
  cooperative_helpline: string;
  dispatched_at: string;
  live_gps: { latitude: number; longitude: number };
}

const API_BASE = 'https://ps-1-rtys.vercel.app/api/v1';

export async function fetchNearbyWorkers(
  service: string,
  latitude = 12.9716,
  longitude = 77.5946,
  radius = 5.0,
  emergency_priority = false
): Promise<NearbyWorkersResult> {
  const params = new URLSearchParams({
    service,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
    emergency_priority: emergency_priority ? 'true' : 'false'
  });

  const res = await fetch(`${API_BASE}/workers/nearby?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch nearby workers');
  }
  return res.json();
}

export async function requestRemoteAdvisor(service: string, problem: string): Promise<RemoteAdvisorSession> {
  const res = await fetch(`${API_BASE}/workers/remote-advisor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service,
      problem_description: problem,
      customer_name: 'Customer'
    })
  });
  if (!res.ok) {
    throw new Error('Failed to connect to Remote Advisor');
  }
  return res.json();
}

// --- Phase 8 Worker Experience API Calls ---

export async function fetchWorkerStatus(): Promise<WorkerStatus> {
  const res = await fetch(`${API_BASE}/workers/status`);
  if (!res.ok) throw new Error('Failed to fetch worker status');
  return res.json();
}

export async function toggleWorkerAvailability(isAvailable: boolean): Promise<WorkerStatus> {
  const res = await fetch(`${API_BASE}/workers/toggle-availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_available: isAvailable })
  });
  if (!res.ok) throw new Error('Failed to update availability');
  return res.json();
}

export async function fetchIncomingJobRequest(): Promise<WorkerJobRequest | null> {
  const res = await fetch(`${API_BASE}/workers/incoming-request`);
  if (!res.ok) throw new Error('Failed to fetch job requests');
  return res.json();
}

export async function acceptJobRequest(requestId: string): Promise<WorkerActiveJob> {
  const res = await fetch(`${API_BASE}/workers/requests/${requestId}/accept`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to accept job request');
  return res.json();
}

export async function declineJobRequest(requestId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/workers/requests/${requestId}/decline`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to decline job request');
  return res.json();
}

export async function fetchActiveJob(): Promise<WorkerActiveJob | null> {
  const res = await fetch(`${API_BASE}/workers/active-job`);
  if (!res.ok) throw new Error('Failed to fetch active job');
  return res.json();
}

export async function advanceJobStatus(jobId: string, status?: JobStage): Promise<WorkerActiveJob> {
  const res = await fetch(`${API_BASE}/workers/jobs/${jobId}/advance-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: status ? JSON.stringify({ status }) : undefined
  });
  if (!res.ok) throw new Error('Failed to advance job status');
  return res.json();
}

export async function fetchWorkerEarnings(): Promise<WorkerEarnings> {
  const res = await fetch(`${API_BASE}/workers/earnings`);
  if (!res.ok) throw new Error('Failed to fetch worker earnings');
  return res.json();
}

export async function fetchWorkerProfile(): Promise<WorkerProfileDetail> {
  const res = await fetch(`${API_BASE}/workers/profile`);
  if (!res.ok) throw new Error('Failed to fetch worker profile');
  return res.json();
}

export async function triggerWorkerSOS(
  latitude = 12.9716,
  longitude = 77.5946,
  notes = 'Worker SOS triggered from mobile interface',
  bookingId?: string
): Promise<WorkerSOSResponse> {
  const res = await fetch(`${API_BASE}/workers/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude, notes, booking_id: bookingId })
  });
  if (!res.ok) throw new Error('Failed to send SOS signal');
  return res.json();
}

