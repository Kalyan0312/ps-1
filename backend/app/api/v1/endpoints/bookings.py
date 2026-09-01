import uuid
import time
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.schemas.booking import (
    BookingCreateRequest,
    BookingStatusUpdateRequest,
    BookingDetailResponse,
    CustomerDetail,
    WorkerDetail,
    ServiceDetail,
    PriceBreakdown,
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
    InvoiceResponse
)
from app.schemas.pricing import PricingCalculateRequest, FactorInput, AppliedFactorItem
from app.api.v1.endpoints.pricing import calculate_pricing
from app.api.v1.endpoints.workers import SEED_WORKERS
from app.services.payment_gateway import get_payment_gateway
from app.services.realtime import (
    emit_booking_created,
    emit_status_changed,
    emit_booking_completed
)

router = APIRouter()

# In-Memory Persistent Bookings Store
BOOKINGS_STORE: List[Dict[str, Any]] = [
    {
        "id": "bk-initial-001",
        "booking_reference": "CG-88102",
        "booking_type": "scheduled",
        "service": {
            "id": "cat-plumber",
            "name": "Plumber",
            "slug": "plumber"
        },
        "customer": {
            "id": "cust-meera-01",
            "full_name": "Meera Rao",
            "phone_number": "+91 98765 11223",
            "address": "12th Main Road, HAL 2nd Stage, Indiranagar, Bangalore"
        },
        "worker": {
            "id": "wrk-ravi-01",
            "full_name": "Ravi Kumar",
            "phone_number": "+91 98765 43210",
            "rating": 4.8,
            "photo": "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80",
            "upi_id": "ravi.kumar@okhdfcbank"
        },
        "status": "completed",
        "payment_status": "paid",
        "payment_method": "UPI",
        "payment_order_id": "order_demo_88102",
        "transaction_id": "pay_demo_tx88102",
        "price": {
            "base_price": 250.00,
            "surcharge": 37.50,
            "final_price": 287.50,
            "worker_share": 244.38, # 85%
            "worker_payout_percent": 85.0,
            "cooperative_share": 28.75, # 10%
            "cooperative_fee_percent": 10.0,
            "welfare_share": 14.37, # 5%
            "welfare_contribution_percent": 5.0
        },
        "pricing_factors": [
            {
                "id": "rule-weather-rain",
                "factor_type": "weather",
                "name": "Monsoon / Heavy Rain Allowance",
                "description": "Compensates workers for adverse weather travel and difficult working conditions.",
                "multiplier_weight": 1.15,
                "surcharge_amount": 37.50
            }
        ],
        "scheduled_time": "Today, 10:30 AM",
        "eta_minutes": 0,
        "created_at": "2026-08-28T05:00:00Z",
        "started_at": "2026-08-28T05:15:00Z",
        "completed_at": "2026-08-28T06:00:00Z",
        "notes": "Tap leak replacement and main pipeline seal."
    }
]


# ==============================================================================
# 1. BOOKING CREATION & LIFECYCLE ENDPOINTS
# ==============================================================================

@router.post(
    "",
    response_model=BookingDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new service booking with rule-based pricing and worker assignment"
)
async def create_booking(payload: BookingCreateRequest):
    # 1. Calculate Rule-Based Pricing dynamically via Phase 9 engine
    calc_res = await calculate_pricing(PricingCalculateRequest(
        service_id=payload.service_id,
        factors=payload.factors or FactorInput()
    ))

    # 2. Match or Assign Worker
    matched_worker = None
    if payload.worker_id:
        seed = next((w for w in SEED_WORKERS if w["worker_id"] == payload.worker_id), None)
        if seed:
            matched_worker = {
                "id": seed["worker_id"],
                "full_name": seed["name"],
                "phone_number": "+91 98451 12345",
                "rating": seed["rating"],
                "photo": seed["photo"],
                "upi_id": f"{seed['name'].lower().replace(' ', '.')}@okhdfcbank"
            }

    if not matched_worker:
        # Auto-match from closest available in SEED_WORKERS
        target_service = payload.service_id.lower()
        candidates = [w for w in SEED_WORKERS if w["service_slug"] in target_service or target_service in w["service_slug"]]
        seed = candidates[0] if candidates else SEED_WORKERS[0]
        matched_worker = {
            "id": seed["worker_id"],
            "full_name": seed["name"],
            "phone_number": "+91 98451 12345",
            "rating": seed["rating"],
            "photo": seed["photo"],
            "upi_id": f"{seed['name'].lower().replace(' ', '.')}@okhdfcbank"
        }

    # 3. Build Booking Entity
    booking_id = f"bk-{uuid.uuid4().hex[:8]}"
    booking_ref = f"CG-{uuid.uuid4().hex[:5].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()

    scheduled_display = payload.scheduled_time or "Immediate (15-20 mins)"

    new_booking = {
        "id": booking_id,
        "booking_reference": booking_ref,
        "booking_type": payload.booking_type,
        "service": {
            "id": payload.service_id,
            "name": calc_res.service_name,
            "slug": payload.service_id.lower().replace("cat-", "")
        },
        "customer": {
            "id": f"cust-{uuid.uuid4().hex[:4]}",
            "full_name": payload.customer_name or "Priya Sharma",
            "phone_number": payload.customer_phone or "+91 98765 43211",
            "address": payload.service_address
        },
        "worker": matched_worker,
        "status": "confirmed", # Instant confirmed upon booking
        "payment_status": "escrow_held", # Held in escrow
        "payment_method": payload.payment_method or "UPI",
        "payment_order_id": f"order_demo_{uuid.uuid4().hex[:8]}",
        "transaction_id": f"pay_demo_{uuid.uuid4().hex[:8]}",
        "price": {
            "base_price": calc_res.base_price,
            "surcharge": calc_res.surcharge,
            "final_price": calc_res.final_price,
            "worker_share": calc_res.worker_earning,
            "worker_payout_percent": calc_res.worker_payout_percent,
            "cooperative_share": calc_res.cooperative_fee,
            "cooperative_fee_percent": calc_res.cooperative_fee_percent,
            "welfare_share": calc_res.welfare_contribution,
            "welfare_contribution_percent": calc_res.welfare_contribution_percent
        },
        "pricing_factors": [f.model_dump() for f in calc_res.applied_factors],
        "scheduled_time": scheduled_display,
        "eta_minutes": 12,
        "created_at": now_iso,
        "started_at": None,
        "completed_at": None,
        "notes": payload.notes
    }

    BOOKINGS_STORE.insert(0, new_booking)

    # ─── Phase 11: Real-Time Event Emission ──────────────────────────────────
    # Notify assigned worker of new job request, and admin of booking count update
    import asyncio
    asyncio.ensure_future(emit_booking_created(new_booking))

    return BookingDetailResponse(**new_booking)


@router.get(
    "",
    response_model=List[BookingDetailResponse],
    summary="List all bookings with optional status filter"
)
async def list_bookings(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(20, ge=1, le=100)
):
    results = BOOKINGS_STORE
    if status_filter:
        results = [b for b in results if b["status"] == status_filter]
    return [BookingDetailResponse(**b) for b in results[:limit]]


@router.get(
    "/{booking_id}",
    response_model=BookingDetailResponse,
    summary="Get detailed booking by ID or reference number"
)
async def get_booking(booking_id: str):
    booking = next((b for b in BOOKINGS_STORE if b["id"] == booking_id or b["booking_reference"] == booking_id), None)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Booking {booking_id} not found")
    return BookingDetailResponse(**booking)


@router.patch(
    "/{booking_id}/status",
    response_model=BookingDetailResponse,
    summary="Update booking lifecycle status"
)
async def update_booking_status(booking_id: str, payload: BookingStatusUpdateRequest):
    booking = next((b for b in BOOKINGS_STORE if b["id"] == booking_id or b["booking_reference"] == booking_id), None)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Booking {booking_id} not found")

    new_status = payload.status
    booking["status"] = new_status
    now_iso = datetime.now(timezone.utc).isoformat()

    if new_status == "in_progress" and not booking.get("started_at"):
        booking["started_at"] = now_iso
    elif new_status == "completed":
        booking["completed_at"] = now_iso
        booking["payment_status"] = "paid"
        booking["eta_minutes"] = 0

        # Release escrow funds to worker UPI automatically
        if booking.get("worker"):
            gateway = get_payment_gateway(is_demo=True)
            await gateway.release_escrow(
                booking_id=booking["id"],
                amount=booking["price"]["worker_share"],
                worker_upi_id=booking["worker"].get("upi_id", "worker@okhdfcbank")
            )

        # ─── Phase 13: Auto-record welfare contribution ──────────────────────
        from app.api.v1.endpoints.ratings_welfare import auto_record_welfare_contribution
        auto_record_welfare_contribution(booking)

    # ─── Phase 11: Real-Time Status Sync ─────────────────────────────────────
    import asyncio
    customer_id = booking["customer"]["id"]
    worker_id = booking["worker"]["id"] if booking.get("worker") else None

    if new_status == "completed" and worker_id:
        asyncio.ensure_future(emit_booking_completed(booking, customer_id, worker_id))
    else:
        asyncio.ensure_future(emit_status_changed(booking, customer_id))

    return BookingDetailResponse(**booking)


# ==============================================================================
# 2. UPI PAYMENT GATEWAY ENDPOINTS
# ==============================================================================

@router.post(
    "/{booking_id}/payment/initiate",
    response_model=PaymentInitiateResponse,
    summary="Initiate UPI-first payment gateway order (safe demo mode supported)"
)
async def initiate_payment(booking_id: str, payload: Optional[PaymentInitiateRequest] = None):
    booking = next((b for b in BOOKINGS_STORE if b["id"] == booking_id or b["booking_reference"] == booking_id), None)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Booking {booking_id} not found")

    gateway = get_payment_gateway(is_demo=True)
    amount = booking["price"]["final_price"]

    order = await gateway.create_order(
        amount=amount,
        currency="INR",
        booking_reference=booking["booking_reference"],
        customer_info=booking["customer"],
        metadata={"booking_id": booking["id"]}
    )

    booking["payment_order_id"] = order["order_id"]

    return PaymentInitiateResponse(
        order_id=order["order_id"],
        booking_id=booking["id"],
        amount=amount,
        currency="INR",
        payment_method="UPI",
        upi_vpa=order.get("upi_vpa", "cooperative.escrow@icici"),
        upi_intent_uri=order.get("upi_intent_uri", f"upi://pay?pa=cooperative.escrow@icici&am={amount:.2f}"),
        is_demo_mode=order.get("is_demo_mode", True),
        created_at=order.get("created_at", int(time.time()))
    )


@router.post(
    "/{booking_id}/payment/verify",
    response_model=PaymentVerifyResponse,
    summary="Verify UPI payment authenticity and place funds in cooperative escrow"
)
async def verify_payment(booking_id: str, payload: PaymentVerifyRequest):
    booking = next((b for b in BOOKINGS_STORE if b["id"] == booking_id or b["booking_reference"] == booking_id), None)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Booking {booking_id} not found")

    gateway = get_payment_gateway(is_demo=True)
    is_valid = await gateway.verify_payment(
        payment_id=payload.payment_id,
        order_id=payload.order_id,
        signature=payload.signature
    )

    if not is_valid:
        booking["payment_status"] = "failed"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment verification failed.")

    now_iso = datetime.now(timezone.utc).isoformat()
    booking["payment_status"] = "escrow_held"
    booking["transaction_id"] = payload.payment_id
    booking["status"] = "confirmed"

    return PaymentVerifyResponse(
        success=True,
        payment_id=payload.payment_id,
        status="escrow_held",
        message="Payment verified successfully. Funds held securely in Cooperative Escrow until job completion.",
        escrow_held_at=now_iso
    )


# ==============================================================================
# 3. ITEMIZED INVOICE GENERATION
# ==============================================================================

@router.get(
    "/{booking_id}/invoice",
    response_model=InvoiceResponse,
    summary="Generate transparent itemised invoice for completed booking"
)
async def get_booking_invoice(booking_id: str):
    booking = next((b for b in BOOKINGS_STORE if b["id"] == booking_id or b["booking_reference"] == booking_id), None)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Booking {booking_id} not found")

    price = booking["price"]
    inv_number = f"INV-{booking['booking_reference']}-{datetime.now().year}"
    inv_date = booking.get("completed_at") or booking.get("created_at") or datetime.now(timezone.utc).isoformat()

    return InvoiceResponse(
        invoice_number=inv_number,
        invoice_date=inv_date,
        booking_reference=booking["booking_reference"],
        booking_id=booking["id"],
        service_name=booking["service"]["name"],
        customer=CustomerDetail(**booking["customer"]),
        worker=WorkerDetail(**booking["worker"]) if booking.get("worker") else None,
        base_price=price["base_price"],
        dynamic_surcharges=[AppliedFactorItem(**f) for f in booking.get("pricing_factors", [])],
        surcharge_total=price["surcharge"],
        worker_earning=price["worker_share"],
        worker_share_percent=price.get("worker_payout_percent", 85.0),
        cooperative_fee=price["cooperative_share"],
        cooperative_fee_percent=price.get("cooperative_fee_percent", 10.0),
        welfare_contribution=price["welfare_share"],
        welfare_contribution_percent=price.get("welfare_contribution_percent", 5.0),
        subtotal=price["final_price"],
        tax_amount=0.00, # 0% GST on cooperative member direct wages
        total_amount=price["final_price"],
        payment_status=booking["payment_status"],
        payment_method=booking.get("payment_method", "UPI"),
        transaction_id=booking.get("transaction_id", f"pay_demo_{booking['booking_reference']}"),
        is_cooperative_verified=True
    )
