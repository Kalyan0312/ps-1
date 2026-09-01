from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.pricing import FactorInput, AppliedFactorItem

class CustomerDetail(BaseModel):
    id: str
    full_name: str
    phone_number: str
    address: str

class WorkerDetail(BaseModel):
    id: str
    full_name: str
    phone_number: str
    rating: float
    photo: str
    upi_id: Optional[str] = "worker.coop@okhdfcbank"

class ServiceDetail(BaseModel):
    id: str
    name: str
    slug: str

class PriceBreakdown(BaseModel):
    base_price: float
    surcharge: float
    final_price: float
    worker_share: float
    worker_payout_percent: float = 85.0
    cooperative_share: float
    cooperative_fee_percent: float = 10.0
    welfare_share: float
    welfare_contribution_percent: float = 5.0

class BookingCreateRequest(BaseModel):
    service_id: str
    worker_id: Optional[str] = None
    customer_name: Optional[str] = "Priya Sharma"
    customer_phone: Optional[str] = "+91 98765 43211"
    service_address: str
    booking_type: str = "scheduled" # "scheduled" | "emergency"
    scheduled_time: Optional[str] = None
    notes: Optional[str] = None
    factors: Optional[FactorInput] = None
    payment_method: Optional[str] = "UPI"

class BookingStatusUpdateRequest(BaseModel):
    status: str # requested | confirmed | worker_assigned | worker_en_route | in_progress | completed | cancelled
    cancellation_reason: Optional[str] = None

class BookingDetailResponse(BaseModel):
    id: str
    booking_reference: str
    booking_type: str # scheduled | emergency
    service: ServiceDetail
    customer: CustomerDetail
    worker: Optional[WorkerDetail] = None
    status: str # requested | confirmed | worker_assigned | worker_en_route | in_progress | completed | cancelled
    payment_status: str # pending | escrow_held | paid | refunded | failed
    price: PriceBreakdown
    pricing_factors: List[AppliedFactorItem]
    scheduled_time: str
    eta_minutes: Optional[int] = 15
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    notes: Optional[str] = None

class PaymentInitiateRequest(BaseModel):
    booking_id: Optional[str] = None
    upi_app: Optional[str] = "gpay" # gpay | phonepe | paytm | bhim | custom_vpa


class PaymentInitiateResponse(BaseModel):
    order_id: str
    booking_id: str
    amount: float
    currency: str = "INR"
    payment_method: str = "UPI"
    upi_vpa: str
    upi_intent_uri: str
    is_demo_mode: bool
    created_at: int

class PaymentVerifyRequest(BaseModel):
    payment_id: str
    order_id: str
    signature: str

class PaymentVerifyResponse(BaseModel):
    success: bool
    payment_id: str
    status: str # escrow_held | paid
    message: str
    escrow_held_at: str

class InvoiceLineItem(BaseModel):
    description: str
    amount: float
    type: str = "item"

class InvoiceResponse(BaseModel):
    invoice_number: str
    invoice_date: str
    booking_reference: str
    booking_id: str
    service_name: str
    customer: CustomerDetail
    worker: Optional[WorkerDetail] = None
    base_price: float
    dynamic_surcharges: List[AppliedFactorItem]
    surcharge_total: float
    worker_earning: float
    worker_share_percent: float
    cooperative_fee: float
    cooperative_fee_percent: float
    welfare_contribution: float
    welfare_contribution_percent: float
    subtotal: float
    tax_amount: float
    total_amount: float
    payment_status: str
    payment_method: str
    transaction_id: str
    is_cooperative_verified: bool = True
