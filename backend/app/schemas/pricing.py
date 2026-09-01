from pydantic import BaseModel, Field
from typing import List, Optional

class FactorInput(BaseModel):
    weather: Optional[str] = "none" # "none" | "rain" | "heatwave" | "storm"
    is_festival: Optional[bool] = False
    scheduled_hour: Optional[int] = None # 0 to 23 (e.g. 23 for night)
    day_of_week: Optional[str] = None # "monday" ... "sunday"
    demand_level: Optional[str] = "normal" # "low" | "normal" | "high" | "peak"
    is_urgent: Optional[bool] = False # Immediate 15-min dispatch

class PricingCalculateRequest(BaseModel):
    service_id: str # e.g. "cat-plumber" or "plumber"
    factors: Optional[FactorInput] = Field(default_factory=FactorInput)
    custom_base_rate: Optional[float] = None

class AppliedFactorItem(BaseModel):
    id: str
    factor_type: str # weather | festival | time | day | demand | urgency
    name: str
    description: str
    multiplier_weight: float
    surcharge_amount: float

class PricingCalculateResponse(BaseModel):
    service_name: str
    service_id: str
    base_price: float
    applied_factors: List[AppliedFactorItem]
    total_multiplier_raw: float
    total_multiplier_applied: float
    multiplier_cap: float
    multiplier_cap_enforced: bool
    surcharge: float
    worker_earning: float
    worker_payout_percent: float
    cooperative_fee: float
    cooperative_fee_percent: float
    welfare_contribution: float
    welfare_contribution_percent: float
    final_price: float
    base_floor_guaranteed: bool

class PriceRuleCreateRequest(BaseModel):
    factor_type: str # weather | festival | time | day | demand | urgency
    name: str
    description: str
    multiplier: float
    is_active: bool = True
    condition_value: Optional[str] = None

class PriceRuleUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    multiplier: Optional[float] = None
    is_active: Optional[bool] = None
    condition_value: Optional[str] = None

class PriceRuleResponse(BaseModel):
    id: str
    factor_type: str
    name: str
    description: str
    multiplier: float
    is_active: bool
    condition_value: Optional[str] = None
    created_at: str

class PricingConfigResponse(BaseModel):
    max_multiplier_cap: float
    worker_payout_percent: float
    cooperative_fee_percent: float
    welfare_contribution_percent: float
    minimum_wage_floor_enforced: bool

class PricingConfigUpdateRequest(BaseModel):
    max_multiplier_cap: Optional[float] = None
    worker_payout_percent: Optional[float] = None
    cooperative_fee_percent: Optional[float] = None
    welfare_contribution_percent: Optional[float] = None
