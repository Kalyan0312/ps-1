const API_BASE = 'https://ps-1-rtys.vercel.app/api/v1';

export interface AdminOverviewMetrics {
  workers_online: number;
  total_workers: number;
  bookings_today: number;
  total_bookings: number;
  jobs_completed: number;
  total_revenue: number;
  worker_payouts_total: number;
  cooperative_treasury: number;
  welfare_fund_total: number;
  pending_verifications_count: number;
  open_grievances_count: number;
}

export interface PendingWorkerItem {
  id: string;
  name: string;
  phone_number: string;
  skills: string[];
  certificates: {
    id: string;
    title: string;
    issuer: string;
    issued_year: string;
    verification_status: string;
  }[];
  cooperative_membership: string;
  experience_years: number;
  upi_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

export interface GrievanceItem {
  id: string;
  ticket_reference: string;
  reporter_role: 'customer' | 'worker';
  reporter_name: string;
  booking_reference?: string;
  subject: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface CategoryAnalyticsItem {
  category_id: string;
  name: string;
  booking_count: number;
  revenue: number;
  avg_price: number;
}

export interface AdminAnalyticsResponse {
  total_revenue: number;
  worker_wage_share_85: number;
  cooperative_fee_10: number;
  welfare_contribution_5: number;
  completion_rate_percent: number;
  active_workers_count: number;
  categories: CategoryAnalyticsItem[];
}

// ─── PHASE 15: ADVANCED CHARTS & DEMAND FORECASTING TYPES ─────────────────────

export interface DataProvenance {
  source: string;
  label: string;
  is_synthetic: boolean;
  total_historical_records: number;
  note: string;
}

export interface DailyRequestPoint {
  date: string;
  day_name: string;
  total_requests: number;
  completed: number;
  cancelled: number;
}

export interface DailyRevenuePoint {
  date: string;
  day_name: string;
  total_revenue: number;
  worker_share_85: number;
  cooperative_share_10: number;
  welfare_share_5: number;
}

export interface RevenueSplitChartData {
  total_revenue: number;
  worker_earnings_85: number;
  cooperative_fee_10: number;
  welfare_contribution_5: number;
  avg_ticket_size: number;
  daily_revenue_trend: DailyRevenuePoint[];
}

export interface GrievanceSOSEvent {
  id: string;
  item_type: 'grievance' | 'sos';
  title: string;
  status: string;
  timestamp: string;
  priority: string;
  reference?: string;
}

export interface GrievanceSOSChartData {
  total_grievances: number;
  open_grievances: number;
  under_review_grievances: number;
  resolved_grievances: number;
  total_sos_alerts: number;
  active_sos_alerts: number;
  resolved_sos_alerts: number;
  resolution_rate_percent: number;
  recent_events: GrievanceSOSEvent[];
}

export interface SkillDistribution {
  skill_name: string;
  worker_count: number;
  percentage: number;
}

export interface WorkerVerificationChartData {
  total_roster_count: number;
  verified_active_count: number;
  pending_review_count: number;
  rejected_count: number;
  verification_rate_percent: number;
  skills_distribution: SkillDistribution[];
}

export interface AdminChartsDataResponse {
  generated_at: string;
  provenance: DataProvenance;
  daily_work_requests: DailyRequestPoint[];
  jobs_completed_trend: DailyRequestPoint[];
  revenue_split: RevenueSplitChartData;
  grievance_sos_volume: GrievanceSOSChartData;
  worker_verification_status: WorkerVerificationChartData;
}

export interface DayForecastPoint {
  date: string;
  day_name: string;
  is_weekend: boolean;
  predicted_requests: number;
  lower_bound_95: number;
  upper_bound_95: number;
  expected_completion_rate: number;
  projected_revenue: number;
  weather_risk_factor: string;
}

export interface ServiceForecastItem {
  service_id: string;
  service_name: string;
  current_weekly_volume: number;
  predicted_weekly_volume: number;
  growth_percent: number;
  demand_share_percent: number;
  recommended_active_workers: number;
  peak_demand_slot: string;
}

export interface LocalityForecastItem {
  locality_id: string;
  locality_name: string;
  latitude: number;
  longitude: number;
  demand_index: number;
  projected_daily_requests: number;
  active_worker_capacity: number;
  recommended_workers: number;
  deficit_warning: boolean;
  hotspot_level: 'normal' | 'high' | 'critical';
}

export interface PeakHourForecast {
  time_slot: string;
  demand_percentage: number;
  projected_volume_multiplier: number;
  recommended_guild_readiness: string;
}

export interface DispatchRecommendation {
  locality: string;
  priority: string;
  required_guild_capacity: number;
  current_available: number;
  target_services: string[];
  action_text: string;
}

export interface DemandForecastResponse {
  model_name: string;
  forecast_horizon_days: number;
  generated_at: string;
  is_synthetic_demo_data: boolean;
  historical_samples_count: number;
  confidence_score_percent: number;
  pricing_ai_status: string;
  summary: {
    total_projected_requests: number;
    avg_daily_projected_requests: number;
    projected_total_revenue: number;
    projected_worker_earnings_85: number;
    projected_coop_treasury_10: number;
    projected_welfare_fund_5: number;
    highest_demand_day: string;
    highest_demand_locality: string;
  };
  day_wise_forecast: DayForecastPoint[];
  service_demand_forecast: ServiceForecastItem[];
  locality_demand_forecast: LocalityForecastItem[];
  peak_hours_distribution: PeakHourForecast[];
  worker_dispatch_recommendations: DispatchRecommendation[];
}

export async function fetchAdminOverview(): Promise<AdminOverviewMetrics> {
  const res = await fetch(`${API_BASE}/admin/overview`);
  if (!res.ok) throw new Error('Failed to fetch admin overview');
  return res.json();
}

export async function fetchPendingWorkers(statusFilter: string = 'pending'): Promise<PendingWorkerItem[]> {
  const res = await fetch(`${API_BASE}/admin/workers/pending?status_filter=${statusFilter}`);
  if (!res.ok) throw new Error('Failed to fetch pending workers');
  return res.json();
}

export async function approveWorker(workerId: string, reason?: string): Promise<PendingWorkerItem> {
  const res = await fetch(`${API_BASE}/admin/workers/${workerId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) throw new Error('Failed to approve worker');
  return res.json();
}

export async function rejectWorker(workerId: string, reason?: string): Promise<PendingWorkerItem> {
  const res = await fetch(`${API_BASE}/admin/workers/${workerId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) throw new Error('Failed to reject worker');
  return res.json();
}

export async function fetchGrievances(statusFilter?: string): Promise<GrievanceItem[]> {
  const url = statusFilter ? `${API_BASE}/admin/grievances?status=${statusFilter}` : `${API_BASE}/admin/grievances`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch grievances');
  return res.json();
}

export async function updateGrievanceStatus(
  grievanceId: string,
  status: 'open' | 'under_review' | 'resolved',
  resolutionNotes?: string
): Promise<GrievanceItem> {
  const res = await fetch(`${API_BASE}/admin/grievances/${grievanceId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, resolution_notes: resolutionNotes })
  });
  if (!res.ok) throw new Error('Failed to update grievance status');
  return res.json();
}

export async function fetchAdminAnalytics(): Promise<AdminAnalyticsResponse> {
  const res = await fetch(`${API_BASE}/admin/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchAdminChartsData(): Promise<AdminChartsDataResponse> {
  const res = await fetch(`${API_BASE}/admin/analytics/charts`);
  if (!res.ok) throw new Error('Failed to fetch admin analytics charts data');
  return res.json();
}

export async function fetchDemandForecast(horizonDays: number = 7): Promise<DemandForecastResponse> {
  const res = await fetch(`${API_BASE}/admin/forecast/demand?horizon_days=${horizonDays}`);
  if (!res.ok) throw new Error('Failed to fetch demand forecast');
  return res.json();
}


// ══════════════════════════════════════════════════════════════════════════════
// SECURITY AUDIT LOGS
// ══════════════════════════════════════════════════════════════════════════════

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event_type: string;
  actor_role: string;
  actor_id?: string;
  target_resource_type: string;
  target_resource_id: string;
  action: string;
  details: Record<string, unknown>;
  client_ip?: string;
  status: string;
}

export async function fetchAuditLogs(
  eventType?: string,
  actorRole?: string,
  limit: number = 50
): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams();
  if (eventType) params.set('event_type', eventType);
  if (actorRole) params.set('actor_role', actorRole);
  params.set('limit', String(limit));
  const res = await fetch(`${API_BASE}/admin/audit-logs?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}
