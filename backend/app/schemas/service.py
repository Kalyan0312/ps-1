from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ServiceCategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    base_rate: float
    minimum_wage_floor: float
    icon_name: str
    is_active: bool
    workers_available: int = Field(default=0)

class BookingCreateRequest(BaseModel):
    category_id: str
    service_address: str
    scheduled_time: Optional[datetime] = None
    notes: Optional[str] = None
    latitude: Optional[float] = 12.9716
    longitude: Optional[float] = 77.5946

class BookingSummaryResponse(BaseModel):
    id: str
    booking_reference: str
    category_name: str
    status: str
    service_address: str
    scheduled_time: datetime
    estimated_fare: float
    worker_share: float
    cooperative_share: float
    worker_name: Optional[str] = None
    worker_phone: Optional[str] = None
    worker_rating: Optional[float] = 4.9
    eta_minutes: Optional[int] = 12
    created_at: datetime
