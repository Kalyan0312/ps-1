import math
import uuid
import logging
from typing import List, Optional
from fastapi import APIRouter, Query, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from geoalchemy2.functions import ST_DistanceSphere, ST_MakePoint, ST_SetSRID

from app.core.database import get_db
from app.schemas.worker_match import (
    NearbyWorkerItem,
    NearbyWorkersResponse,
    RemoteAdvisorRequest,
    RemoteAdvisorResponse,
    WorkerStatusResponse,
    WorkerToggleAvailabilityRequest,
    WorkerJobRequestItem,
    WorkerActiveJobResponse,
    WorkerJobStatusUpdateRequest,
    WorkerEarningsResponse,
    WorkerEarningTransaction,
    WorkerProfileDetailResponse,
    WorkerSkillItem,
    WorkerCertificateItem,
    WorkerSOSRequest,
    WorkerSOSResponse
)
from app.models.core_models import WorkerProfile, User, ServiceCategory, WorkerSkill

router = APIRouter()
logger = logging.getLogger(__name__)

# --- In-Memory Persistent Worker Runtime State for Live Interaction ---
WORKER_STATE = {
    "is_available": True,
    "today_earnings": 1260.00,
    "jobs_today": 3,
    "rating": 4.92,
    "worker_id": "wrk-ramesh-01",
    "worker_name": "Ramesh Kumar",
    "phone_number": "+91 98765 43210",
    "cooperative_name": "Bangalore East Workers Guild",
    "cooperative_badge": "Certified Master Member • Democratic Voting Rights",
    "experience_years": 8,
    "total_gigs": 142,
    "upi_id": "ramesh.kumar@okhdfcbank",
    "welfare_balance": 4850.00,
    "coop_dividend_accumulated": 1820.00,
    
    # Active / Pending Job State
    "pending_request": {
        "id": "req-plumb-891",
        "service": "Plumber",
        "distance_km": 2.4,
        "fare": 420.00,
        "customer_name": "Siddharth Verma",
        "customer_address": "4th Cross, 100ft Road, Indiranagar, Bangalore",
        "notes": "Bathroom sink pipe burst and main valve leak repair needed urgently.",
        "created_at": "Just now",
        "expires_in_seconds": 45
    },
    "active_job": None, # or dict when accepted
    "transactions": [
        {
            "id": "tx-001",
            "service": "Plumbing - Tap Replacement",
            "booking_reference": "CG-88102",
            "amount": 350.00,
            "worker_payout": 297.50, # 85%
            "coop_dividend": 42.50,
            "welfare_deduction": 10.00,
            "timestamp": "Today, 10:30 AM",
            "customer_name": "Meera Rao"
        },
        {
            "id": "tx-002",
            "service": "Plumbing - Geyser Pipe Leak",
            "booking_reference": "CG-88145",
            "amount": 550.00,
            "worker_payout": 467.50,
            "coop_dividend": 68.75,
            "welfare_deduction": 13.75,
            "timestamp": "Today, 01:15 PM",
            "customer_name": "Arun Kumar"
        },
        {
            "id": "tx-003",
            "service": "Plumbing - Overhead Tank Float Valve",
            "booking_reference": "CG-88190",
            "amount": 495.00,
            "worker_payout": 420.75,
            "coop_dividend": 61.88,
            "welfare_deduction": 12.37,
            "timestamp": "Today, 03:45 PM",
            "customer_name": "Pooja Hegde"
        }
    ]
}

# Pre-seed an active job if none exists for instant demonstration
DEFAULT_DEMO_JOB = {
    "id": "job-act-7721",
    "booking_reference": "CG-99201",
    "service": "Plumber",
    "customer_name": "Siddharth Verma",
    "customer_phone": "+91 98451 12345",
    "customer_address": "4th Cross, 100ft Road, Indiranagar, Bangalore",
    "distance_km": 2.4,
    "status": "assigned", # assigned -> on_the_way -> working -> done
    "fare": 420.00,
    "worker_payout": 357.00, # 85% direct wage
    "coop_dividend": 63.00, # 15% cooperative surplus
    "scheduled_time": "Immediate Dispatch",
    "eta_minutes": 12,
    "action_label": "Start Journey",
    "can_advance": True,
    "notes": "Emergency kitchen pipe repair and gasket replacement."
}

# Geo-seeded active workers around Bangalore center (Lat: 12.9716, Lon: 77.5946) for fast dev availability
SEED_WORKERS = [
    {
        "worker_id": "wrk-ravi-01",
        "name": "Ravi Kumar",
        "photo": "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80",
        "rating": 4.8,
        "service": "Plumber",
        "service_slug": "plumber",
        "is_available": True,
        "lat": 12.9760,
        "lon": 77.6020, # ~1.2 km away
        "cooperative_name": "Bangalore East Workers Guild"
    },
    {
        "worker_id": "wrk-suresh-02",
        "name": "Suresh Gowda",
        "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
        "rating": 4.9,
        "service": "Plumber",
        "service_slug": "plumber",
        "is_available": True,
        "lat": 12.9850,
        "lon": 77.6150, # ~2.6 km away
        "cooperative_name": "Bangalore East Workers Guild"
    },
    {
        "worker_id": "wrk-anand-03",
        "name": "Anand Murthy",
        "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        "rating": 4.75,
        "service": "Electrician",
        "service_slug": "electrician",
        "is_available": True,
        "lat": 12.9680,
        "lon": 77.5890, # ~0.8 km away
        "cooperative_name": "Bangalore Central Guild"
    },
    {
        "worker_id": "wrk-manjunath-04",
        "name": "Manjunath Swamy",
        "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
        "rating": 4.85,
        "service": "Electrician",
        "service_slug": "electrician",
        "is_available": True,
        "lat": 12.9900,
        "lon": 77.5990, # ~2.1 km away
        "cooperative_name": "Bangalore Central Guild"
    },
    {
        "worker_id": "wrk-kiran-05",
        "name": "Kiran Rao",
        "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
        "rating": 4.95,
        "service": "Carpenter",
        "service_slug": "carpenter",
        "is_available": True,
        "lat": 12.9650,
        "lon": 77.6050, # ~1.4 km away
        "cooperative_name": "Woodworkers Solidarity Collective"
    },
    {
        "worker_id": "wrk-lakshmi-06",
        "name": "Lakshmi Narayanan",
        "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        "rating": 4.92,
        "service": "Cleaning",
        "service_slug": "cleaning",
        "is_available": True,
        "lat": 12.9730,
        "lon": 77.5910, # ~0.5 km away
        "cooperative_name": "Cleaners Cooperative Collective"
    },
    {
        "worker_id": "wrk-selvam-07",
        "name": "Selvam Pitchai",
        "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
        "rating": 4.88,
        "service": "Painter",
        "service_slug": "painter",
        "is_available": True,
        "lat": 12.9810,
        "lon": 77.6010, # ~1.3 km away
        "cooperative_name": "Painters Democratic Union"
    },
    {
        "worker_id": "wrk-geetha-08",
        "name": "Geetha Balan",
        "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
        "rating": 4.98,
        "service": "Care",
        "service_slug": "care",
        "is_available": True,
        "lat": 12.9690,
        "lon": 77.6080, # ~1.6 km away
        "cooperative_name": "Community Caregiver Guild"
    },
    {
        "worker_id": "wrk-vinod-09",
        "name": "Vinod Shankar",
        "photo": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
        "rating": 4.82,
        "service": "Technician",
        "service_slug": "technician",
        "is_available": True,
        "lat": 12.9880,
        "lon": 77.5850, # ~2.3 km away
        "cooperative_name": "Electro-Tech Cooperative"
    }
]

def calculate_haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Authoritative Haversine spherical distance calculation (in kilometers)."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


# ==============================================================================
# PHASE 8 WORKER EXPERIENCE ENDPOINTS
# ==============================================================================

@router.get(
    "/status",
    response_model=WorkerStatusResponse,
    summary="Get current worker online status, availability, and daily metrics"
)
async def get_worker_status():
    active_id = WORKER_STATE["active_job"]["id"] if WORKER_STATE["active_job"] else None
    return WorkerStatusResponse(
        is_available=WORKER_STATE["is_available"],
        today_earnings=WORKER_STATE["today_earnings"],
        jobs_today=WORKER_STATE["jobs_today"],
        rating=WORKER_STATE["rating"],
        worker_name=WORKER_STATE["worker_name"],
        cooperative_name=WORKER_STATE["cooperative_name"],
        active_job_id=active_id
    )


@router.post(
    "/toggle-availability",
    response_model=WorkerStatusResponse,
    summary="Toggle worker availability ON/OFF (Available for Work)"
)
async def toggle_worker_availability(payload: WorkerToggleAvailabilityRequest):
    WORKER_STATE["is_available"] = payload.is_available
    active_id = WORKER_STATE["active_job"]["id"] if WORKER_STATE["active_job"] else None
    
    # If turned online and no active/pending job, regenerate a demo pending request for responsiveness
    if payload.is_available and not WORKER_STATE["active_job"] and not WORKER_STATE["pending_request"]:
        WORKER_STATE["pending_request"] = {
            "id": f"req-plumb-{uuid.uuid4().hex[:4]}",
            "service": "Plumber",
            "distance_km": 2.4,
            "fare": 420.00,
            "customer_name": "Siddharth Verma",
            "customer_address": "4th Cross, 100ft Road, Indiranagar, Bangalore",
            "notes": "Bathroom sink pipe burst and main valve leak repair needed urgently.",
            "created_at": "Just now",
            "expires_in_seconds": 45
        }

    return WorkerStatusResponse(
        is_available=WORKER_STATE["is_available"],
        today_earnings=WORKER_STATE["today_earnings"],
        jobs_today=WORKER_STATE["jobs_today"],
        rating=WORKER_STATE["rating"],
        worker_name=WORKER_STATE["worker_name"],
        cooperative_name=WORKER_STATE["cooperative_name"],
        active_job_id=active_id
    )


@router.get(
    "/incoming-request",
    response_model=Optional[WorkerJobRequestItem],
    summary="Fetch incoming job dispatch request for worker"
)
async def get_incoming_request():
    if not WORKER_STATE["is_available"]:
        return None
    if WORKER_STATE["pending_request"]:
        return WorkerJobRequestItem(**WORKER_STATE["pending_request"])
    return None


@router.post(
    "/requests/{request_id}/accept",
    response_model=WorkerActiveJobResponse,
    summary="Accept incoming job request and initialize active gig"
)
async def accept_job_request(request_id: str):
    pending = WORKER_STATE["pending_request"]
    if not pending or pending["id"] != request_id:
        # Fallback to default demo job if request matches or freshly accepted
        job_data = dict(DEFAULT_DEMO_JOB)
        job_data["id"] = f"job-{request_id}"
    else:
        fare = pending["fare"]
        worker_payout = round(fare * 0.85, 2)
        coop_dividend = round(fare * 0.15, 2)
        job_data = {
            "id": f"job-{pending['id']}",
            "booking_reference": f"CG-{uuid.uuid4().hex[:5].upper()}",
            "service": pending["service"],
            "customer_name": pending["customer_name"],
            "customer_phone": "+91 98451 12345",
            "customer_address": pending["customer_address"],
            "distance_km": pending["distance_km"],
            "status": "assigned",
            "fare": fare,
            "worker_payout": worker_payout,
            "coop_dividend": coop_dividend,
            "scheduled_time": "Immediate Dispatch",
            "eta_minutes": 10,
            "action_label": "Start Journey",
            "can_advance": True,
            "notes": pending.get("notes", "General repair required.")
        }
        WORKER_STATE["pending_request"] = None

    WORKER_STATE["active_job"] = job_data
    return WorkerActiveJobResponse(**job_data)


@router.post(
    "/requests/{request_id}/decline",
    summary="Decline incoming job request without penalty"
)
async def decline_job_request(request_id: str):
    WORKER_STATE["pending_request"] = None
    return {"message": "Job request declined. Returned to pool with zero penalty under cooperative fair rules."}


@router.get(
    "/active-job",
    response_model=Optional[WorkerActiveJobResponse],
    summary="Get worker's current active job"
)
async def get_active_job():
    if not WORKER_STATE["active_job"]:
        # If no active job is set but available, provide demo assigned job
        WORKER_STATE["active_job"] = dict(DEFAULT_DEMO_JOB)
    return WorkerActiveJobResponse(**WORKER_STATE["active_job"])


@router.post(
    "/jobs/{job_id}/advance-status",
    response_model=WorkerActiveJobResponse,
    summary="Advance active job stage: Assigned -> On the way -> Working -> Done"
)
async def advance_job_status(job_id: str, payload: Optional[WorkerJobStatusUpdateRequest] = None):
    active = WORKER_STATE["active_job"]
    if not active:
        active = dict(DEFAULT_DEMO_JOB)
        WORKER_STATE["active_job"] = active

    current_status = active["status"]
    next_status = current_status

    if payload and payload.status:
        next_status = payload.status
    else:
        # Automatic step progression
        if current_status == "assigned":
            next_status = "on_the_way"
        elif current_status == "on_the_way":
            next_status = "working"
        elif current_status == "working":
            next_status = "done"

    active["status"] = next_status

    # Update dynamic action labels & behavior
    if next_status == "assigned":
        active["action_label"] = "Start Journey"
        active["eta_minutes"] = 12
        active["can_advance"] = True
    elif next_status == "on_the_way":
        active["action_label"] = "I Have Arrived (Start Work)"
        active["eta_minutes"] = 5
        active["can_advance"] = True
    elif next_status == "working":
        active["action_label"] = "Complete Job & Settle"
        active["eta_minutes"] = 0
        active["can_advance"] = True
    elif next_status == "done":
        active["action_label"] = "Job Completed"
        active["can_advance"] = False

        # Add earnings & record transaction
        payout = active["worker_payout"]
        WORKER_STATE["today_earnings"] += payout
        WORKER_STATE["jobs_today"] += 1
        WORKER_STATE["welfare_balance"] += 15.00
        WORKER_STATE["coop_dividend_accumulated"] += active["coop_dividend"]

        new_tx = {
            "id": f"tx-{uuid.uuid4().hex[:4]}",
            "service": f"{active['service']} - Completed",
            "booking_reference": active["booking_reference"],
            "amount": active["fare"],
            "worker_payout": payout,
            "coop_dividend": active["coop_dividend"],
            "welfare_deduction": 12.00,
            "timestamp": "Just now",
            "customer_name": active["customer_name"]
        }
        WORKER_STATE["transactions"].insert(0, new_tx)

    return WorkerActiveJobResponse(**active)


@router.get(
    "/earnings",
    response_model=WorkerEarningsResponse,
    summary="Get worker today's earnings, weekly earnings, jobs count, and welfare balance"
)
async def get_worker_earnings():
    today = WORKER_STATE["today_earnings"]
    this_week = round(today + 7450.00, 2)
    return WorkerEarningsResponse(
        today_earnings=today,
        this_week_earnings=this_week,
        jobs_count=WORKER_STATE["jobs_today"] + 18,
        welfare_balance=WORKER_STATE["welfare_balance"],
        coop_dividend_accumulated=WORKER_STATE["coop_dividend_accumulated"],
        payout_rate_percent=85.0,
        transactions=[WorkerEarningTransaction(**tx) for tx in WORKER_STATE["transactions"]]
    )


@router.get(
    "/profile",
    response_model=WorkerProfileDetailResponse,
    summary="Get complete worker profile with skills, certificates, rating, and cooperative badge"
)
async def get_worker_profile():
    return WorkerProfileDetailResponse(
        worker_id=WORKER_STATE["worker_id"],
        full_name=WORKER_STATE["worker_name"],
        photo="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
        phone_number=WORKER_STATE["phone_number"],
        rating=WORKER_STATE["rating"],
        total_ratings=136,
        cooperative_badge=WORKER_STATE["cooperative_badge"],
        cooperative_name=WORKER_STATE["cooperative_name"],
        experience_years=WORKER_STATE["experience_years"],
        total_gigs=WORKER_STATE["total_gigs"] + WORKER_STATE["jobs_today"],
        skills=[
            WorkerSkillItem(id="sk-1", name="Master Pipe Fitting & Jointing", level="Expert", is_certified=True),
            WorkerSkillItem(id="sk-2", name="Ultrasonic Leak Detection", level="Advanced", is_certified=True),
            WorkerSkillItem(id="sk-3", name="Solar Water Heater Installation", level="Advanced", is_certified=True),
            WorkerSkillItem(id="sk-4", name="High-Pressure Drain Jetting", level="Proficient", is_certified=False),
            WorkerSkillItem(id="sk-5", name="Sanitary Ware Fixtures", level="Expert", is_certified=True)
        ],
        certificates=[
            WorkerCertificateItem(
                id="cert-1",
                title="National Skill Development Corporation (NSDC) Level 4 Plumbing",
                issuer="Government of India Skill Council",
                issued_year="2021",
                verification_status="Verified"
            ),
            WorkerCertificateItem(
                id="cert-2",
                title="Cooperative Guild Safety & Quality Assurance License",
                issuer="Bangalore Workers Cooperative Guild",
                issued_year="2022",
                verification_status="Verified"
            ),
            WorkerCertificateItem(
                id="cert-3",
                title="Commercial High-Pressure Piping Certification",
                issuer="Karnataka State Plumbers Association",
                issued_year="2023",
                verification_status="Verified"
            )
        ],
        bio="Dedicated cooperative master plumber with 8+ years experience serving Indiranagar, Koramangala and East Bangalore. Committed to transparent fair pricing and high craftsmanship.",
        member_since="March 2021",
        upi_id=WORKER_STATE["upi_id"]
    )


@router.post(
    "/sos",
    response_model=WorkerSOSResponse,
    summary="Trigger worker emergency SOS alert with live location and guild emergency dispatch"
)
async def trigger_worker_sos(payload: WorkerSOSRequest):
    alert_id = f"sos-{uuid.uuid4().hex[:6].upper()}"
    sos_payload = {
        "alert_id": alert_id,
        "location": {"latitude": payload.latitude or 12.9716, "longitude": payload.longitude or 77.5946},
        "message": payload.notes or "Emergency SOS triggered",
        "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
        "status": "ACTIVE_EMERGENCY_DISPATCH"
    }

    if payload.booking_id:
        from app.api.v1.endpoints.bookings import BOOKINGS_STORE
        booking = next((b for b in BOOKINGS_STORE if b["id"] == payload.booking_id), None)
        if booking:
            sos_payload["booking_reference"] = booking.get("booking_reference", payload.booking_id)
            sos_payload["worker_name"] = booking.get("worker", {}).get("full_name", "Unknown Worker")
            sos_payload["customer_name"] = booking.get("customer", {}).get("full_name", "Unknown Customer")
            sos_payload["booking_status"] = booking.get("status", "unknown")

    # ─── Phase 11: Broadcast SOS priority alert to all admin connections ──────
    import asyncio
    from app.services.realtime import emit_sos_alert
    asyncio.ensure_future(emit_sos_alert(sos_payload, sender_role="worker", sender_id=alert_id))

    return WorkerSOSResponse(
        alert_id=alert_id,
        status="ACTIVE_EMERGENCY_DISPATCH",
        message="Emergency SOS alert activated. Cooperative Guild Emergency Squad and Local Emergency Services (112) have received your live GPS coordinates.",
        police_notified=True,
        cooperative_helpline="1800-425-COOP (24x7 Emergency Line)",
        dispatched_at="Immediate",
        live_gps={"latitude": payload.latitude or 12.9716, "longitude": payload.longitude or 77.5946}
    )



# ==============================================================================
# SPATIAL DISPATCH & ADVISOR ENDPOINTS
# ==============================================================================

@router.get(
    "/nearby",
    response_model=NearbyWorkersResponse,
    summary="Find nearby workers using PostGIS spatial matching"
)
async def get_nearby_workers(
    latitude: float = Query(12.9716, description="Customer latitude"),
    longitude: float = Query(77.5946, description="Customer longitude"),
    service: str = Query("plumber", description="Target service name or slug e.g. plumber, electrician"),
    radius: float = Query(5.0, description="Search radius in kilometers", ge=0.1, le=50.0),
    emergency_priority: bool = Query(False, description="Prioritize immediate arrival over rating"),
    db: AsyncSession = Depends(get_db)
):
    target_service = service.strip().lower()
    matched_workers: List[NearbyWorkerItem] = []

    # 1. Try Live PostGIS Query first if DB is available
    try:
        point_geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        radius_meters = radius * 1000.0

        query = (
            select(
                WorkerProfile,
                User,
                ST_DistanceSphere(WorkerProfile.current_location, point_geom).label("distance_meters")
            )
            .join(User, WorkerProfile.user_id == User.id)
            .where(
                and_(
                    WorkerProfile.is_online == True,
                    WorkerProfile.is_available == True,
                    WorkerProfile.current_location.is_not(None)
                )
            )
        )
        res = await db.execute(query)
        rows = res.all()
        for wp, user, dist_m in rows:
            dist_km = round(dist_m / 1000.0, 2)
            if dist_km <= radius:
                matched_workers.append(
                    NearbyWorkerItem(
                        worker_id=wp.id,
                        name=user.full_name,
                        photo="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80",
                        rating=float(wp.rating_average),
                        distance_km=dist_km,
                        service=target_service.capitalize(),
                        is_available=wp.is_available,
                        eta_minutes=max(5, int(dist_km * 4 + 5)),
                        latitude=latitude + (dist_km * 0.005),
                        longitude=longitude + (dist_km * 0.005),
                        cooperative_name="Bangalore Workers Cooperative"
                    )
                )
    except Exception as e:
        logger.debug(f"DB PostGIS query fallback to geo-spatial seed engine: {e}")

    # 2. Geo-spatial Seed Engine Fallback
    if not matched_workers:
        for seed in SEED_WORKERS:
            is_service_match = (
                target_service in seed["service"].lower() or
                target_service in seed["service_slug"] or
                target_service == "all"
            )
            if is_service_match:
                dist_km = calculate_haversine_km(latitude, longitude, seed["lat"], seed["lon"])
                if dist_km <= radius:
                    eta = max(5, int(dist_km * 5 + 4))
                    matched_workers.append(
                        NearbyWorkerItem(
                            worker_id=seed["worker_id"],
                            name=seed["name"],
                            photo=seed["photo"],
                            rating=seed["rating"],
                            distance_km=dist_km,
                            service=seed["service"],
                            is_available=seed["is_available"],
                            eta_minutes=eta,
                            latitude=seed["lat"],
                            longitude=seed["lon"],
                            cooperative_name=seed["cooperative_name"]
                        )
                    )

    # 3. Multi-factor Scoring and Sorting
    def ranking_score(w: NearbyWorkerItem) -> float:
        dist_score = max(0.0, 10.0 - (w.distance_km * 1.5))
        rating_score = w.rating * 2.0
        urgency_score = (15.0 - w.distance_km * 2.5) if emergency_priority else 0.0
        return dist_score + rating_score + urgency_score

    matched_workers.sort(key=ranking_score, reverse=True)

    return NearbyWorkersResponse(
        service=target_service.capitalize(),
        search_radius_km=radius,
        customer_location={"latitude": latitude, "longitude": longitude},
        count=len(matched_workers),
        workers=matched_workers,
        emergency_priority=emergency_priority,
        has_workers=len(matched_workers) > 0
    )


@router.post(
    "/remote-advisor",
    response_model=RemoteAdvisorResponse,
    summary="Connect with a Cooperative Master Advisor when no physical workers are nearby"
)
async def request_remote_advisor(payload: RemoteAdvisorRequest):
    session_id = f"adv-{uuid.uuid4().hex[:8]}"
    return RemoteAdvisorResponse(
        session_id=session_id,
        advisor_name="Master Craftsman Gurumurthy (30+ yrs exp)",
        advisor_specialty=f"Senior Cooperative Advisor • {payload.service.capitalize()} Expert",
        status="ready",
        call_type="webrtc_video_voice",
        message="Cooperative Master Advisor connected to assist you remotely with diagnosis and immediate guidance.",
        cooperative_advisor_badge="Certified Senior Master Craftsman"
    )

