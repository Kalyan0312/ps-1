import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import Column, DateTime, String, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class TimestampMixin:
    """Provides automatic created_at and updated_at timestamps."""
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

class UserRole(str, enum.Enum):
    WORKER = "worker"
    CUSTOMER = "customer"
    ADMIN = "admin"
    COOPERATIVE_LEADER = "cooperative_leader"

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    PENDING_VERIFICATION = "pending_verification"
    SUSPENDED = "suspended"
    DEACTIVATED = "deactivated"

class BookingStatus(str, enum.Enum):
    REQUESTED = "requested"
    MATCHING = "matching"
    ACCEPTED = "accepted"
    WORKER_EN_ROUTE = "worker_en_route"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED_BY_CUSTOMER = "cancelled_by_customer"
    CANCELLED_BY_WORKER = "cancelled_by_worker"
    DISPUTED = "disputed"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    ESCROW_HELD = "escrow_held"
    RELEASED_TO_WORKER = "released_to_worker"
    REFUNDED = "refunded"
    FAILED = "failed"

class DocumentStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"

class WelfareClaimStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    VOTED_APPROVED = "voted_approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"

class GrievanceStatus(str, enum.Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    ESCALATED = "escalated"
    CLOSED = "closed"

class SOSStatus(str, enum.Enum):
    ACTIVE = "active"
    RESPONDING = "responding"
    RESOLVED = "resolved"
    FALSE_ALARM = "false_alarm"
