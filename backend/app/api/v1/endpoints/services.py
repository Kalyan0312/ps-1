import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from geoalchemy2 import WKTElement

from app.core.database import get_db
from app.schemas.service import ServiceCategoryResponse, BookingCreateRequest, BookingSummaryResponse
from app.models.core_models import ServiceCategory, Booking, CustomerProfile, User
from app.models.base import BookingStatus
from app.api.deps import get_current_user

router = APIRouter()

# Default 9 Service Categories for Cooperative Gig Platform
DEFAULT_CATEGORIES = [
    {
        "id": "cat-electrician",
        "name": "Electrician",
        "slug": "electrician",
        "description": "Wiring, fixture repairs, appliances, and fuse box maintenance.",
        "base_rate": 250.00,
        "minimum_wage_floor": 200.00,
        "icon_name": "Zap",
        "is_active": True,
        "workers_available": 14
    },
    {
        "id": "cat-plumber",
        "name": "Plumber",
        "slug": "plumber",
        "description": "Leak fixes, pipe installations, water heaters, and sanitation.",
        "base_rate": 250.00,
        "minimum_wage_floor": 200.00,
        "icon_name": "Wrench",
        "is_active": True,
        "workers_available": 9
    },
    {
        "id": "cat-carpenter",
        "name": "Carpenter",
        "slug": "carpenter",
        "description": "Furniture assembly, door locks, cabinetry, and wooden repairs.",
        "base_rate": 300.00,
        "minimum_wage_floor": 220.00,
        "icon_name": "Hammer",
        "is_active": True,
        "workers_available": 7
    },
    {
        "id": "cat-painter",
        "name": "Painter",
        "slug": "painter",
        "description": "Interior & exterior wall painting, waterproof coats, and touchups.",
        "base_rate": 220.00,
        "minimum_wage_floor": 180.00,
        "icon_name": "Paintbrush",
        "is_active": True,
        "workers_available": 11
    },
    {
        "id": "cat-cleaning",
        "name": "Cleaning",
        "slug": "cleaning",
        "description": "Deep home cleaning, kitchen scrubbing, bathroom sanitization.",
        "base_rate": 200.00,
        "minimum_wage_floor": 160.00,
        "icon_name": "Sparkles",
        "is_active": True,
        "workers_available": 22
    },
    {
        "id": "cat-care",
        "name": "Care",
        "slug": "care",
        "description": "Elderly companion assistance, nursing aid, and patient support.",
        "base_rate": 280.00,
        "minimum_wage_floor": 220.00,
        "icon_name": "HeartHandshake",
        "is_active": True,
        "workers_available": 8
    },
    {
        "id": "cat-driver",
        "name": "Driver",
        "slug": "driver",
        "description": "On-demand chauffeur, vehicle relocation, and hourly driving.",
        "base_rate": 240.00,
        "minimum_wage_floor": 190.00,
        "icon_name": "Car",
        "is_active": True,
        "workers_available": 16
    },
    {
        "id": "cat-gardening",
        "name": "Gardening",
        "slug": "gardening",
        "description": "Lawn mowing, hedge trimming, plant potting, and pest spray.",
        "base_rate": 200.00,
        "minimum_wage_floor": 160.00,
        "icon_name": "Trees",
        "is_active": True,
        "workers_available": 6
    },
    {
        "id": "cat-technician",
        "name": "Technician",
        "slug": "technician",
        "description": "AC servicing, refrigerator repair, washing machines, electronics.",
        "base_rate": 350.00,
        "minimum_wage_floor": 250.00,
        "icon_name": "Cpu",
        "is_active": True,
        "workers_available": 13
    }
]

# In-memory customer bookings store for fast dev reactivity
DEV_BOOKINGS = [
    {
        "id": "bk-demo-001",
        "booking_reference": "CG-88219",
        "category_name": "Electrician",
        "status": "worker_en_route",
        "service_address": "12th Main Road, HAL 2nd Stage, Indiranagar, Bangalore",
        "scheduled_time": datetime.now(timezone.utc) + timedelta(minutes=15),
        "estimated_fare": 350.00,
        "worker_share": 297.50, # 85%
        "cooperative_share": 52.50, # 15%
        "worker_name": "Ramesh Kumar",
        "worker_phone": "+91 98765 43210",
        "worker_rating": 4.92,
        "eta_minutes": 8,
        "created_at": datetime.now(timezone.utc) - timedelta(minutes=20)
    }
]

@router.get(
    "/categories",
    response_model=List[ServiceCategoryResponse],
    summary="List all available service categories"
)
async def list_service_categories():
    # Return active categories immediately for high responsiveness
    return [ServiceCategoryResponse(**cat) for cat in DEFAULT_CATEGORIES]


@router.post(
    "/bookings",
    response_model=BookingSummaryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new service booking"
)
async def create_booking(
    payload: BookingCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    # Find category
    matched_cat = next((c for c in DEFAULT_CATEGORIES if c["id"] == payload.category_id or c["slug"] == payload.category_id), None)
    cat_name = matched_cat["name"] if matched_cat else "General Service"
    base_rate = matched_cat["base_rate"] if matched_cat else 250.0

    worker_share = round(base_rate * 0.85, 2)
    coop_share = round(base_rate * 0.15, 2)
    ref = f"CG-{uuid.uuid4().hex[:5].upper()}"

    booking_id = f"bk-{uuid.uuid4().hex[:8]}"
    scheduled = payload.scheduled_time or (datetime.now(timezone.utc) + timedelta(minutes=30))

    new_booking = {
        "id": booking_id,
        "booking_reference": ref,
        "category_name": cat_name,
        "status": "matching",
        "service_address": payload.service_address,
        "scheduled_time": scheduled,
        "estimated_fare": base_rate,
        "worker_share": worker_share,
        "cooperative_share": coop_share,
        "worker_name": "Ramesh Kumar (Matched)",
        "worker_phone": "+91 98765 43210",
        "worker_rating": 4.92,
        "eta_minutes": 15,
        "created_at": datetime.now(timezone.utc)
    }

    DEV_BOOKINGS.insert(0, new_booking)

    return BookingSummaryResponse(**new_booking)


@router.get(
    "/my-bookings",
    response_model=List[BookingSummaryResponse],
    summary="Get customer bookings list"
)
async def get_my_bookings():
    return [BookingSummaryResponse(**b) for b in DEV_BOOKINGS]
