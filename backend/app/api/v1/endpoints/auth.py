import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import rate_limit_sensitive
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.models.base import UserRole, UserStatus
from app.models.core_models import User, WorkerProfile, CustomerProfile, AdminProfile
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    LogoutResponse
)
from app.api.deps import get_current_user, require_roles

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory dev storage cache for seamless offline/dev mode without requiring active PostgreSQL
DEV_USER_STORE: Dict[str, dict] = {
    # Demo Worker
    "9876543210": {
        "id": "usr-worker-001",
        "phone_number": "9876543210",
        "email": "worker@cooperativegig.org",
        "hashed_password": get_password_hash("worker123"),
        "full_name": "Ramesh Kumar",
        "role": UserRole.WORKER,
        "status": UserStatus.ACTIVE,
        "is_verified": True,
        "preferred_language": "ta",
        "created_at": datetime.now(timezone.utc),
        "profile": {
            "is_online": True,
            "rating_average": 4.92,
            "total_gigs_completed": 128,
            "total_earnings": 34800.00,
            "cooperative_dividend_earned": 5220.00,
            "upi_id": "ramesh@oksbi"
        }
    },
    # Demo Customer
    "9876543211": {
        "id": "usr-customer-001",
        "phone_number": "9876543211",
        "email": "customer@cooperativegig.org",
        "hashed_password": get_password_hash("customer123"),
        "full_name": "Priya Sharma",
        "role": UserRole.CUSTOMER,
        "status": UserStatus.ACTIVE,
        "is_verified": True,
        "preferred_language": "en",
        "created_at": datetime.now(timezone.utc),
        "profile": {
            "default_address": "Indiranagar 100ft Rd, Bangalore",
            "rating_average": 4.98,
            "total_bookings": 14
        }
    },
    # Demo Admin
    "9876543212": {
        "id": "usr-admin-001",
        "phone_number": "9876543212",
        "email": "admin@cooperativegig.org",
        "hashed_password": get_password_hash("admin123"),
        "full_name": "Ananya Sen (Coop Director)",
        "role": UserRole.ADMIN,
        "status": UserStatus.ACTIVE,
        "is_verified": True,
        "preferred_language": "en",
        "created_at": datetime.now(timezone.utc),
        "profile": {
            "department": "Executive Cooperative Governance",
            "permissions": "all"
        }
    }
}

def user_to_response(user: Any, profile_details: Optional[dict] = None) -> UserResponse:
    if isinstance(user, dict):
        return UserResponse(
            id=user["id"],
            phone_number=user["phone_number"],
            email=user.get("email"),
            full_name=user["full_name"],
            role=user["role"],
            status=user["status"],
            is_verified=user["is_verified"],
            preferred_language=user["preferred_language"],
            created_at=user["created_at"],
            profile_details=profile_details or user.get("profile", {})
        )
    
    # SQLAlchemy model instance
    profile_data = {}
    if user.role == UserRole.WORKER and user.worker_profile:
        profile_data = {
            "is_online": user.worker_profile.is_online,
            "rating_average": float(user.worker_profile.rating_average),
            "total_gigs_completed": user.worker_profile.total_gigs_completed,
            "total_earnings": float(user.worker_profile.total_earnings),
            "cooperative_dividend_earned": float(user.worker_profile.cooperative_dividend_earned),
            "upi_id": user.worker_profile.upi_id,
        }
    elif user.role == UserRole.CUSTOMER and user.customer_profile:
        profile_data = {
            "default_address": user.customer_profile.default_address,
            "rating_average": float(user.customer_profile.rating_average),
            "total_bookings": user.customer_profile.total_bookings,
        }
    elif user.role == UserRole.ADMIN and user.admin_profile:
        profile_data = {
            "department": user.admin_profile.department,
            "permissions": user.admin_profile.permissions,
        }

    return UserResponse(
        id=user.id,
        phone_number=user.phone_number,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        status=user.status,
        is_verified=user.is_verified,
        preferred_language=user.preferred_language,
        created_at=user.created_at,
        profile_details=profile_data
    )


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Worker, Customer, or Admin"
)
async def register_user(
    payload: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
    _rate: bool = Depends(rate_limit_sensitive(max_requests=10, window_seconds=60))
):
    # Sanitize phone
    clean_phone = payload.phone_number.strip()
    
    # Try DB registration first
    try:
        # Check existing
        existing_query = select(User).where(
            or_(User.phone_number == clean_phone, User.email == payload.email if payload.email else False)
        )
        res = await db.execute(existing_query)
        if res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this phone number or email is already registered"
            )

        new_user = User(
            id=str(uuid.uuid4()),
            phone_number=clean_phone,
            email=str(payload.email) if payload.email else None,
            hashed_password=get_password_hash(payload.password),
            full_name=payload.full_name.strip(),
            role=payload.role,
            status=UserStatus.ACTIVE,
            is_verified=True,
            preferred_language=payload.preferred_language
        )
        db.add(new_user)
        await db.flush()

        # Create matching profile
        if payload.role in (UserRole.WORKER, UserRole.COOPERATIVE_LEADER):
            wp = WorkerProfile(
                user_id=new_user.id,
                is_online=True,
                is_available=True
            )
            db.add(wp)
        elif payload.role == UserRole.CUSTOMER:
            cp = CustomerProfile(user_id=new_user.id)
            db.add(cp)
        elif payload.role == UserRole.ADMIN:
            ap = AdminProfile(user_id=new_user.id, department="Governance")
            db.add(ap)

        await db.commit()
        await db.refresh(new_user)

        token = create_access_token(subject=new_user.id, role=new_user.role.value)
        return TokenResponse(
            access_token=token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_to_response(new_user)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Database unavailable for registration, using fast dev store: {e}")
        # Fallback to dev store
        if clean_phone in DEV_USER_STORE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this phone number already registered"
            )
        
        user_id = f"usr-{payload.role.value}-{uuid.uuid4().hex[:6]}"
        dev_entry = {
            "id": user_id,
            "phone_number": clean_phone,
            "email": str(payload.email) if payload.email else None,
            "hashed_password": get_password_hash(payload.password),
            "full_name": payload.full_name,
            "role": payload.role,
            "status": UserStatus.ACTIVE,
            "is_verified": True,
            "preferred_language": payload.preferred_language,
            "created_at": datetime.now(timezone.utc),
            "profile": {
                "is_online": True,
                "rating_average": 5.0,
                "total_gigs_completed": 0,
                "total_earnings": 0.0,
                "cooperative_dividend_earned": 0.0
            }
        }
        DEV_USER_STORE[clean_phone] = dev_entry
        token = create_access_token(subject=user_id, role=payload.role.value)
        return TokenResponse(
            access_token=token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_to_response(dev_entry)
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with Phone/Email and Password"
)
async def login_user(
    payload: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
    _rate: bool = Depends(rate_limit_sensitive(max_requests=15, window_seconds=60))
):
    identifier = payload.phone_or_email.strip()
    
    # 1. Check DB first
    try:
        query = (
            select(User)
            .where(or_(User.phone_number == identifier, User.email == identifier))
            .options(
                selectinload(User.worker_profile),
                selectinload(User.customer_profile),
                selectinload(User.admin_profile)
            )
        )
        res = await db.execute(query)
        db_user = res.scalar_one_or_none()
        if db_user and verify_password(payload.password, db_user.hashed_password):
            token = create_access_token(subject=db_user.id, role=db_user.role.value)
            return TokenResponse(
                access_token=token,
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                user=user_to_response(db_user)
            )
    except Exception as e:
        logger.debug(f"DB login fallback to dev store: {e}")

    # 2. Check dev store
    matched_dev_user = None
    for p, u in DEV_USER_STORE.items():
        if p == identifier or u.get("email") == identifier:
            matched_dev_user = u
            break

    if matched_dev_user and verify_password(payload.password, matched_dev_user["hashed_password"]):
        token = create_access_token(subject=matched_dev_user["id"], role=matched_dev_user["role"].value)
        return TokenResponse(
            access_token=token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_to_response(matched_dev_user)
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials: Phone number or password incorrect"
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Logout user"
)
async def logout_user():
    return LogoutResponse(success=True, message="Successfully logged out")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current verified user profile"
)
async def get_me(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization bearer token required"
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload["sub"]

    # Try DB
    try:
        query = (
            select(User)
            .where(User.id == user_id)
            .options(
                selectinload(User.worker_profile),
                selectinload(User.customer_profile),
                selectinload(User.admin_profile)
            )
        )
        res = await db.execute(query)
        db_user = res.scalar_one_or_none()
        if db_user:
            return user_to_response(db_user)
    except Exception:
        pass

    # Try Dev Store
    for u in DEV_USER_STORE.values():
        if u["id"] == user_id:
            return user_to_response(u)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User profile not found"
    )


# ----------------------------------------------------------------------
# Role-Protected Resource Endpoints (Backend RBAC Verification)
# ----------------------------------------------------------------------
@router.get("/worker/portal-data", summary="Worker-only protected data")
async def get_worker_portal_data(current_user: User = Depends(require_roles([UserRole.WORKER, UserRole.COOPERATIVE_LEADER]))):
    return {
        "message": f"Welcome Worker {current_user.full_name}",
        "access": "granted",
        "role": current_user.role.value,
        "cooperative_rate": "85% payout + 15% cooperative dividend pool"
    }

@router.get("/customer/portal-data", summary="Customer-only protected data")
async def get_customer_portal_data(current_user: User = Depends(require_roles([UserRole.CUSTOMER]))):
    return {
        "message": f"Welcome Customer {current_user.full_name}",
        "access": "granted",
        "role": current_user.role.value,
        "available_services": ["Electrical", "Plumbing", "Carpentry", "House Cleaning"]
    }

@router.get("/admin/portal-data", summary="Admin-only protected data")
async def get_admin_portal_data(current_user: User = Depends(require_roles([UserRole.ADMIN]))):
    return {
        "message": f"Welcome Admin {current_user.full_name}",
        "access": "granted",
        "role": current_user.role.value,
        "treasury_health": "verified",
        "pending_welfare_claims": 3
    }
