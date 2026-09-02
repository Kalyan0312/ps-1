const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ps-1-rtys.vercel.app';

// ══════════════════════════════════════════════════════════════════════════════
// RATINGS
// ══════════════════════════════════════════════════════════════════════════════

export interface RatingSubmitPayload {
  booking_id: string;
  direction: 'customer_to_worker' | 'worker_to_customer';
  stars: number;
  comment?: string;
}

export interface RatingEntry {
  id: string;
  booking_id: string;
  direction: string;
  from_id: string;
  to_id: string;
  stars: number;
  comment?: string;
  created_at: string;
}

export interface WorkerRatingsSummary {
  worker_id: string;
  average_rating: number;
  total_ratings: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
  recent_reviews: RatingEntry[];
}

export interface CustomerRatingSummary {
  customer_id: string;
  average_rating: number;
  total_ratings: number;
  recent_ratings: { stars: number; comment?: string; created_at: string; source: string }[];
}

export async function submitRating(payload: RatingSubmitPayload): Promise<RatingEntry> {
  const res = await fetch(`${API_BASE}/community/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit rating');
  }
  return res.json();
}

export async function fetchWorkerRatings(workerId: string): Promise<WorkerRatingsSummary> {
  const res = await fetch(`${API_BASE}/community/ratings/worker/${workerId}`);
  if (!res.ok) throw new Error('Failed to fetch worker ratings');
  return res.json();
}

export async function fetchCustomerRatings(customerId: string): Promise<CustomerRatingSummary> {
  const res = await fetch(`${API_BASE}/community/ratings/customer/${customerId}`);
  if (!res.ok) throw new Error('Failed to fetch customer ratings');
  return res.json();
}


// ══════════════════════════════════════════════════════════════════════════════
// WELFARE
// ══════════════════════════════════════════════════════════════════════════════

export interface WelfareContribution {
  id: string;
  booking_id: string;
  booking_reference: string;
  worker_id: string;
  worker_name: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export interface WorkerWelfareDashboard {
  worker_id: string;
  total_welfare_balance: number;
  this_month_contributions: number;
  contribution_count: number;
  history: WelfareContribution[];
}

export interface WelfareClaim {
  id: string;
  worker_id: string;
  worker_name: string;
  claim_type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  resolved_at?: string;
}

export interface AdminWelfareDashboard {
  total_welfare_fund: number;
  total_inflows: number;
  total_claims_paid: number;
  pending_claims_count: number;
  pending_claims_amount: number;
  inflows: WelfareContribution[];
  claims: WelfareClaim[];
}

export async function fetchWorkerWelfare(workerId: string): Promise<WorkerWelfareDashboard> {
  const res = await fetch(`${API_BASE}/community/welfare/worker/${workerId}`);
  if (!res.ok) throw new Error('Failed to fetch worker welfare');
  return res.json();
}

export async function fetchAdminWelfare(): Promise<AdminWelfareDashboard> {
  const res = await fetch(`${API_BASE}/community/welfare/admin`);
  if (!res.ok) throw new Error('Failed to fetch admin welfare');
  return res.json();
}


// ══════════════════════════════════════════════════════════════════════════════
// GRIEVANCES & DISPUTES
// ══════════════════════════════════════════════════════════════════════════════

export interface GrievanceSubmitPayload {
  subject: string;
  description: string;
  reporter_role?: string;
  reporter_name?: string;
  booking_reference?: string;
  priority?: string;
}

export interface GrievanceRecord {
  id: string;
  ticket_reference: string;
  reporter_role: string;
  reporter_name: string;
  booking_reference?: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export async function submitGrievance(payload: GrievanceSubmitPayload): Promise<GrievanceRecord> {
  const res = await fetch(`${API_BASE}/admin/grievances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit grievance');
  }
  return res.json();
}

