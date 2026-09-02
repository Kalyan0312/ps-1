export interface FactorInput {
  weather?: 'none' | 'rain' | 'heatwave' | 'storm';
  is_festival?: boolean;
  scheduled_hour?: number;
  day_of_week?: string;
  demand_level?: 'low' | 'normal' | 'high' | 'peak';
  is_urgent?: boolean;
}

export interface PricingCalculateRequest {
  service_id: string;
  factors?: FactorInput;
  custom_base_rate?: number;
}

export interface AppliedFactorItem {
  id: string;
  factor_type: string;
  name: string;
  description: string;
  multiplier_weight: number;
  surcharge_amount: number;
}

export interface PricingCalculateResponse {
  service_name: string;
  service_id: string;
  base_price: number;
  applied_factors: AppliedFactorItem[];
  total_multiplier_raw: number;
  total_multiplier_applied: number;
  multiplier_cap: number;
  multiplier_cap_enforced: boolean;
  surcharge: number;

  worker_earning: number;
  worker_payout_percent: number;
  cooperative_fee: number;
  cooperative_fee_percent: number;
  welfare_contribution: number;
  welfare_contribution_percent: number;
  final_price: number;
  base_floor_guaranteed: boolean;
}


export interface PriceRule {
  id: string;
  factor_type: string;
  name: string;
  description: string;
  multiplier: number;
  is_active: boolean;
  condition_value?: string;
  created_at: string;
}

export interface PricingConfig {
  max_multiplier_cap: number;
  worker_payout_percent: number;
  cooperative_fee_percent: number;
  welfare_contribution_percent: number;
  minimum_wage_floor_enforced: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ps-1-rtys.vercel.app';

export async function calculatePricing(request: PricingCalculateRequest): Promise<PricingCalculateResponse> {
  const res = await fetch(`${API_BASE}/pricing/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!res.ok) {
    throw new Error('Failed to calculate pricing');
  }
  return res.json();
}

export async function fetchPricingRules(): Promise<PriceRule[]> {
  const res = await fetch(`${API_BASE}/pricing/rules`);
  if (!res.ok) throw new Error('Failed to fetch pricing rules');
  return res.json();
}

export async function createPricingRule(rule: Omit<PriceRule, 'id' | 'created_at'>): Promise<PriceRule> {
  const res = await fetch(`${API_BASE}/pricing/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule)
  });
  if (!res.ok) throw new Error('Failed to create pricing rule');
  return res.json();
}

export async function updatePricingRule(ruleId: string, rule: Partial<PriceRule>): Promise<PriceRule> {
  const res = await fetch(`${API_BASE}/pricing/rules/${ruleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule)
  });
  if (!res.ok) throw new Error('Failed to update pricing rule');
  return res.json();
}

export async function deletePricingRule(ruleId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/pricing/rules/${ruleId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete pricing rule');
  return res.json();
}

export async function fetchPricingConfig(): Promise<PricingConfig> {
  const res = await fetch(`${API_BASE}/pricing/config`);
  if (!res.ok) throw new Error('Failed to fetch pricing configuration');
  return res.json();
}

export async function updatePricingConfig(config: Partial<PricingConfig>): Promise<PricingConfig> {
  const res = await fetch(`${API_BASE}/pricing/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to update pricing configuration');
  return res.json();
}
