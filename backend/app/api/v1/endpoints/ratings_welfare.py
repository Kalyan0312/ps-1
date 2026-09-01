import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter()

# ══════════════════════════════════════════════════════════════════════════════
# IN-MEMORY STORES
# ══════════════════════════════════════════════════════════════════════════════

RATINGS_STORE: List[Dict[str, Any]] = [
    {
        "id": "rating-seed-001",
        "booking_id": "bk-initial-001",
        "direction": "customer_to_worker",
        "from_id": "cust-meera-01",
        "to_id": "wrk-ravi-01",
        "stars": 5,
        "comment": "Excellent work, fixed the tap leak in under an hour.",
        "created_at": "2026-08-28T06:30:00Z"
    }
]

WELFARE_LEDGER: List[Dict[str, Any]] = [
    {
        "id": "wf-seed-001",
        "booking_id": "bk-initial-001",
        "booking_reference": "CG-88102",
        "worker_id": "wrk-ravi-01",
        "worker_name": "Ravi Kumar",
        "amount": 14.37,
        "type": "inflow",
        "description": "5% welfare contribution from booking CG-88102",
        "created_at": "2026-08-28T06:00:00Z"
    }
]

WELFARE_CLAIMS: List[Dict[str, Any]] = [
    {
        "id": "wfc-seed-001",
        "worker_id": "wrk-ravi-01",
        "worker_name": "Ravi Kumar",
        "claim_type": "healthcare",
        "amount": 2500.00,
        "description": "Annual eye checkup reimbursement",
        "status": "approved",
        "created_at": "2026-08-15T10:00:00Z",
        "resolved_at": "2026-08-16T14:00:00Z"
    },
    {
        "id": "wfc-seed-002",
        "worker_id": "wrk-anita-02",
        "worker_name": "Anita Desai",
        "claim_type": "emergency",
        "amount": 5000.00,
        "description": "Emergency tool replacement after theft",
        "status": "pending",
        "created_at": "2026-08-27T16:00:00Z",
        "resolved_at": None
    }
]


# ══════════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ══════════════════════════════════════════════════════════════════════════════

class RatingSubmitRequest(BaseModel):
    booking_id: str
    direction: str = Field(..., description="customer_to_worker or worker_to_customer")
    stars: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class RatingResponse(BaseModel):
    id: str
    booking_id: str
    direction: str
    from_id: str
    to_id: str
    stars: int
    comment: Optional[str]
    created_at: str

class WorkerRatingsSummary(BaseModel):
    worker_id: str
    average_rating: float
    total_ratings: int
    five_star: int
    four_star: int
    three_star: int
    two_star: int
    one_star: int
    recent_reviews: List[RatingResponse]

class CustomerRatingSummary(BaseModel):
    customer_id: str
    average_rating: float
    total_ratings: int
    recent_ratings: List[Dict[str, Any]]  # Anonymous entries

class WelfareContributionRecord(BaseModel):
    id: str
    booking_id: str
    booking_reference: str
    worker_id: str
    worker_name: str
    amount: float
    type: str
    description: str
    created_at: str

class WorkerWelfareDashboard(BaseModel):
    worker_id: str
    total_welfare_balance: float
    this_month_contributions: float
    contribution_count: int
    history: List[WelfareContributionRecord]

class WelfareClaimItem(BaseModel):
    id: str
    worker_id: str
    worker_name: str
    claim_type: str
    amount: float
    description: str
    status: str
    created_at: str
    resolved_at: Optional[str]

class AdminWelfareDashboard(BaseModel):
    total_welfare_fund: float
    total_inflows: float
    total_claims_paid: float
    pending_claims_count: int
    pending_claims_amount: float
    inflows: List[WelfareContributionRecord]
    claims: List[WelfareClaimItem]


# ══════════════════════════════════════════════════════════════════════════════
# 1. RATINGS ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/ratings",
    response_model=RatingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a rating (customer→worker or worker→customer)"
)
async def submit_rating(payload: RatingSubmitRequest):
    # Look up booking
    from app.api.v1.endpoints.bookings import BOOKINGS_STORE
    booking = next((b for b in BOOKINGS_STORE if b["id"] == payload.booking_id), None)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if payload.direction == "customer_to_worker":
        from_id = booking["customer"]["id"]
        to_id = booking["worker"]["id"]
    elif payload.direction == "worker_to_customer":
        from_id = booking["worker"]["id"]
        to_id = booking["customer"]["id"]
    else:
        raise HTTPException(status_code=400, detail="direction must be customer_to_worker or worker_to_customer")

    # Check for duplicate
    existing = next(
        (r for r in RATINGS_STORE
         if r["booking_id"] == payload.booking_id and r["direction"] == payload.direction),
        None
    )
    if existing:
        raise HTTPException(status_code=409, detail="Rating already submitted for this booking and direction")

    rating = {
        "id": f"rating-{uuid.uuid4().hex[:8]}",
        "booking_id": payload.booking_id,
        "direction": payload.direction,
        "from_id": from_id,
        "to_id": to_id,
        "stars": payload.stars,
        "comment": payload.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    RATINGS_STORE.insert(0, rating)

    # If customer_to_worker, update worker average rating in worker state
    if payload.direction == "customer_to_worker":
        _update_worker_average_rating(to_id)

    return RatingResponse(**rating)


def _update_worker_average_rating(worker_id: str):
    """Recalculate worker average rating from all customer_to_worker ratings."""
    worker_ratings = [r for r in RATINGS_STORE if r["to_id"] == worker_id and r["direction"] == "customer_to_worker"]
    if not worker_ratings:
        return
    avg = sum(r["stars"] for r in worker_ratings) / len(worker_ratings)

    # Update worker state
    from app.api.v1.endpoints.workers import WORKER_STATE
    WORKER_STATE["rating"] = round(avg, 2)
    WORKER_STATE["total_ratings"] = len(worker_ratings)


@router.get(
    "/ratings/worker/{worker_id}",
    response_model=WorkerRatingsSummary,
    summary="Get worker rating summary with star distribution"
)
async def get_worker_ratings(worker_id: str):
    worker_ratings = [
        r for r in RATINGS_STORE
        if r["to_id"] == worker_id and r["direction"] == "customer_to_worker"
    ]

    total = len(worker_ratings) or 1
    avg = sum(r["stars"] for r in worker_ratings) / total if worker_ratings else 0.0
    dist = {s: len([r for r in worker_ratings if r["stars"] == s]) for s in range(1, 6)}

    return WorkerRatingsSummary(
        worker_id=worker_id,
        average_rating=round(avg, 2),
        total_ratings=len(worker_ratings),
        five_star=dist[5],
        four_star=dist[4],
        three_star=dist[3],
        two_star=dist[2],
        one_star=dist[1],
        recent_reviews=[RatingResponse(**r) for r in worker_ratings[:10]]
    )


@router.get(
    "/ratings/customer/{customer_id}",
    response_model=CustomerRatingSummary,
    summary="Get anonymous customer rating summary (worker identity hidden)"
)
async def get_customer_ratings(customer_id: str):
    customer_ratings = [
        r for r in RATINGS_STORE
        if r["to_id"] == customer_id and r["direction"] == "worker_to_customer"
    ]

    total = len(customer_ratings) or 1
    avg = sum(r["stars"] for r in customer_ratings) / total if customer_ratings else 0.0

    # Anonymize — strip worker (from_id) info
    anonymous_entries = [
        {
            "stars": r["stars"],
            "comment": r.get("comment"),
            "created_at": r["created_at"],
            "source": "Verified Cooperative Worker"  # Anonymous label
        }
        for r in customer_ratings[:10]
    ]

    return CustomerRatingSummary(
        customer_id=customer_id,
        average_rating=round(avg, 2),
        total_ratings=len(customer_ratings),
        recent_ratings=anonymous_entries
    )


# ══════════════════════════════════════════════════════════════════════════════
# 2. WELFARE CONTRIBUTION — AUTOMATIC
# ══════════════════════════════════════════════════════════════════════════════

def auto_record_welfare_contribution(booking: Dict[str, Any]):
    """
    Called automatically from the bookings completion flow.
    Records the 5% welfare contribution without requiring Admin action.
    """
    price = booking.get("price", {})
    welfare_amount = price.get("welfare_share", 0.0)
    if welfare_amount <= 0:
        return

    record = {
        "id": f"wf-{uuid.uuid4().hex[:8]}",
        "booking_id": booking["id"],
        "booking_reference": booking.get("booking_reference", "N/A"),
        "worker_id": booking.get("worker", {}).get("id", "unknown"),
        "worker_name": booking.get("worker", {}).get("full_name", "Unknown Worker"),
        "amount": welfare_amount,
        "type": "inflow",
        "description": f"5% welfare contribution from booking {booking.get('booking_reference', booking['id'])}",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    WELFARE_LEDGER.insert(0, record)


@router.get(
    "/welfare/worker/{worker_id}",
    response_model=WorkerWelfareDashboard,
    summary="Get worker's welfare fund, this month contributions, and history"
)
async def get_worker_welfare(worker_id: str):
    worker_records = [r for r in WELFARE_LEDGER if r["worker_id"] == worker_id]
    total = sum(r["amount"] for r in worker_records if r["type"] == "inflow")

    # This month
    now = datetime.now(timezone.utc)
    this_month = [
        r for r in worker_records
        if r["type"] == "inflow" and r["created_at"][:7] == now.strftime("%Y-%m")
    ]
    this_month_total = sum(r["amount"] for r in this_month)

    return WorkerWelfareDashboard(
        worker_id=worker_id,
        total_welfare_balance=round(total, 2),
        this_month_contributions=round(this_month_total, 2),
        contribution_count=len(worker_records),
        history=[WelfareContributionRecord(**r) for r in worker_records[:20]]
    )


@router.get(
    "/welfare/admin",
    response_model=AdminWelfareDashboard,
    summary="Admin welfare dashboard: total fund, inflows, claims, pending"
)
async def get_admin_welfare_dashboard():
    total_inflows = sum(r["amount"] for r in WELFARE_LEDGER if r["type"] == "inflow")
    total_claims_paid = sum(c["amount"] for c in WELFARE_CLAIMS if c["status"] == "approved")
    pending = [c for c in WELFARE_CLAIMS if c["status"] == "pending"]
    pending_amount = sum(c["amount"] for c in pending)

    fund_balance = total_inflows - total_claims_paid

    return AdminWelfareDashboard(
        total_welfare_fund=round(fund_balance, 2),
        total_inflows=round(total_inflows, 2),
        total_claims_paid=round(total_claims_paid, 2),
        pending_claims_count=len(pending),
        pending_claims_amount=round(pending_amount, 2),
        inflows=[WelfareContributionRecord(**r) for r in WELFARE_LEDGER[:20]],
        claims=[WelfareClaimItem(**c) for c in WELFARE_CLAIMS]
    )
