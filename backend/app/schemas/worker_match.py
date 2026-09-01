from pydantic import BaseModel, Field
from typing import Optional, List

class NearbyWorkerItem(BaseModel):
    worker_id: str
    name: str
    photo: str
    rating: float
    distance_km: float
    service: str
    is_available: bool
    eta_minutes: int
    latitude: float
    longitude: float
    cooperative_name: str = "Bangalore Workers Cooperative"

class NearbyWorkersResponse(BaseModel):
    service: str
    search_radius_km: float
    customer_location: dict
    count: int
    workers: List[NearbyWorkerItem]
    emergency_priority: bool = False
    has_workers: bool

class RemoteAdvisorRequest(BaseModel):
    service: str
    problem_description: str
    customer_name: Optional[str] = "Customer"

class RemoteAdvisorResponse(BaseModel):
    session_id: str
    advisor_name: str
    advisor_specialty: str
    status: str
    call_type: str
    message: str
    cooperative_advisor_badge: str

# --- Phase 8: Worker Experience Schemas ---

class WorkerStatusResponse(BaseModel):
    is_available: bool
    today_earnings: float
    jobs_today: int
    rating: float
    worker_name: str
    cooperative_name: str
    active_job_id: Optional[str] = None

class WorkerToggleAvailabilityRequest(BaseModel):
    is_available: bool

class WorkerJobRequestItem(BaseModel):
    id: str
    service: str
    distance_km: float
    fare: float
    customer_name: str
    customer_address: str
    notes: Optional[str] = "Standard inspection and repair required"
    created_at: str
    expires_in_seconds: int = 45

class WorkerActiveJobResponse(BaseModel):
    id: str
    booking_reference: str
    service: str
    customer_name: str
    customer_phone: str
    customer_address: str
    distance_km: float
    status: str # assigned | on_the_way | working | done
    fare: float
    worker_payout: float
    coop_dividend: float
    scheduled_time: str
    eta_minutes: int
    action_label: str
    can_advance: bool
    notes: Optional[str] = None

class WorkerJobStatusUpdateRequest(BaseModel):
    status: str # assigned | on_the_way | working | done

class WorkerEarningTransaction(BaseModel):
    id: str
    service: str
    booking_reference: str
    amount: float
    worker_payout: float
    coop_dividend: float
    welfare_deduction: float
    timestamp: str
    customer_name: str

class WorkerEarningsResponse(BaseModel):
    today_earnings: float
    this_week_earnings: float
    jobs_count: int
    welfare_balance: float
    coop_dividend_accumulated: float
    payout_rate_percent: float = 85.0
    transactions: List[WorkerEarningTransaction]

class WorkerSkillItem(BaseModel):
    id: str
    name: str
    level: str
    is_certified: bool

class WorkerCertificateItem(BaseModel):
    id: str
    title: str
    issuer: str
    issued_year: str
    verification_status: str

class WorkerProfileDetailResponse(BaseModel):
    worker_id: str
    full_name: str
    photo: str
    phone_number: str
    rating: float
    total_ratings: int
    cooperative_badge: str
    cooperative_name: str
    experience_years: int
    total_gigs: int
    skills: List[WorkerSkillItem]
    certificates: List[WorkerCertificateItem]
    bio: str
    member_since: str
    upi_id: str

class WorkerSOSRequest(BaseModel):
    latitude: Optional[float] = 12.9716
    longitude: Optional[float] = 77.5946
    notes: Optional[str] = "Worker triggered one-tap emergency alert"
    booking_id: Optional[str] = None

class WorkerSOSResponse(BaseModel):
    alert_id: str
    status: str
    message: str
    police_notified: bool
    cooperative_helpline: str
    dispatched_at: str
    live_gps: dict

