import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Numeric,
    Text,
    ForeignKey,
    DateTime,
    Date,
    Enum,
    Index,
    UniqueConstraint,
    CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from geoalchemy2 import Geometry

from app.core.database import Base
from app.models.base import (
    TimestampMixin,
    generate_uuid,
    UserRole,
    UserStatus,
    BookingStatus,
    PaymentStatus,
    DocumentStatus,
    WelfareClaimStatus,
    GrievanceStatus,
    SOSStatus
)

# ----------------------------------------------------------------------
# 1. User Model
# ----------------------------------------------------------------------
class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.WORKER, nullable=False, index=True)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING_VERIFICATION, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    preferred_language = Column(String(10), default="en", nullable=False)
    fcm_token = Column(String(255), nullable=True)

    # Relationships
    worker_profile = relationship("WorkerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin_profile = relationship("AdminProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    locations = relationship("Location", back_populates="user", cascade="all, delete-orphan")
    sos_alerts = relationship("SOSAlert", back_populates="user", cascade="all, delete-orphan")


# ----------------------------------------------------------------------
# 2. Cooperative Model
# ----------------------------------------------------------------------
class Cooperative(Base, TimestampMixin):
    __tablename__ = "cooperatives"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(200), unique=True, nullable=False)
    registration_number = Column(String(100), unique=True, nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    treasury_balance = Column(Numeric(14, 2), default=Decimal("0.00"), nullable=False)
    dividend_rate = Column(Numeric(5, 2), default=Decimal("15.00"), nullable=False) # e.g. 15% cooperative surplus
    welfare_pool_balance = Column(Numeric(14, 2), default=Decimal("0.00"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    workers = relationship("WorkerProfile", back_populates="cooperative")
    welfare_contributions = relationship("WelfareContribution", back_populates="cooperative")
    welfare_claims = relationship("WelfareClaim", back_populates="cooperative")


# ----------------------------------------------------------------------
# 3. Worker Profile Model
# ----------------------------------------------------------------------
class WorkerProfile(Base, TimestampMixin):
    __tablename__ = "worker_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    cooperative_id = Column(String(36), ForeignKey("cooperatives.id", ondelete="SET NULL"), nullable=True, index=True)
    
    is_online = Column(Boolean, default=False, nullable=False, index=True)
    is_available = Column(Boolean, default=True, nullable=False, index=True)
    rating_average = Column(Numeric(3, 2), default=Decimal("5.00"), nullable=False)
    total_gigs_completed = Column(Integer, default=0, nullable=False)
    total_earnings = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    cooperative_dividend_earned = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    
    upi_id = Column(String(100), nullable=True)
    current_location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=True)

    # Relationships
    user = relationship("User", back_populates="worker_profile")
    cooperative = relationship("Cooperative", back_populates="workers")
    skills = relationship("WorkerSkill", back_populates="worker", cascade="all, delete-orphan")
    documents = relationship("WorkerDocument", back_populates="worker", cascade="all, delete-orphan")
    availabilities = relationship("WorkerAvailability", back_populates="worker", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="worker")
    welfare_contributions = relationship("WelfareContribution", back_populates="worker")
    welfare_claims = relationship("WelfareClaim", back_populates="worker")


# ----------------------------------------------------------------------
# 4. Customer Profile Model
# ----------------------------------------------------------------------
class CustomerProfile(Base, TimestampMixin):
    __tablename__ = "customer_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    default_address = Column(Text, nullable=True)
    default_location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=True)
    rating_average = Column(Numeric(3, 2), default=Decimal("5.00"), nullable=False)
    total_bookings = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", back_populates="customer_profile")
    bookings = relationship("Booking", back_populates="customer")


# ----------------------------------------------------------------------
# 5. Admin Profile Model
# ----------------------------------------------------------------------
class AdminProfile(Base, TimestampMixin):
    __tablename__ = "admin_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    department = Column(String(100), default="Cooperative Governance", nullable=False)
    permissions = Column(String(255), default="manage_users,manage_disputes,view_treasury", nullable=False)

    # Relationships
    user = relationship("User", back_populates="admin_profile")


# ----------------------------------------------------------------------
# 6. Service Category Model
# ----------------------------------------------------------------------
class ServiceCategory(Base, TimestampMixin):
    __tablename__ = "service_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), unique=True, nullable=False)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    base_rate = Column(Numeric(10, 2), nullable=False)
    minimum_wage_floor = Column(Numeric(10, 2), nullable=False)
    icon_name = Column(String(50), default="Briefcase", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    skills = relationship("WorkerSkill", back_populates="category")
    bookings = relationship("Booking", back_populates="category")
    price_rules = relationship("PriceRule", back_populates="category")


# ----------------------------------------------------------------------
# 7. Worker Skill Model
# ----------------------------------------------------------------------
class WorkerSkill(Base, TimestampMixin):
    __tablename__ = "worker_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    worker_id = Column(String(36), ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("service_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    experience_years = Column(Integer, default=1, nullable=False)
    custom_hourly_rate = Column(Numeric(10, 2), nullable=True)
    is_certified = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint("worker_id", "category_id", name="uq_worker_category_skill"),
    )

    # Relationships
    worker = relationship("WorkerProfile", back_populates="skills")
    category = relationship("ServiceCategory", back_populates="skills")


# ----------------------------------------------------------------------
# 8. Worker Document Model
# ----------------------------------------------------------------------
class WorkerDocument(Base, TimestampMixin):
    __tablename__ = "worker_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    worker_id = Column(String(36), ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(String(50), nullable=False) # e.g. "national_id", "driving_license", "police_clearance"
    document_number = Column(String(100), nullable=True)
    file_url = Column(String(500), nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.SUBMITTED, nullable=False, index=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(String(255), nullable=True)

    # Relationships
    worker = relationship("WorkerProfile", back_populates="documents")


# ----------------------------------------------------------------------
# 9. Worker Availability Model
# ----------------------------------------------------------------------
class WorkerAvailability(Base, TimestampMixin):
    __tablename__ = "worker_availabilities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    worker_id = Column(String(36), ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False) # 0=Monday, 6=Sunday
    start_time = Column(String(5), nullable=False) # "08:00"
    end_time = Column(String(5), nullable=False) # "18:00"
    is_active = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        Index("ix_worker_day_availability", "worker_id", "day_of_week"),
    )

    # Relationships
    worker = relationship("WorkerProfile", back_populates="availabilities")


# ----------------------------------------------------------------------
# 10. Booking Model
# ----------------------------------------------------------------------
class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_reference = Column(String(20), unique=True, nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("customer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    worker_id = Column(String(36), ForeignKey("worker_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(String(36), ForeignKey("service_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    status = Column(Enum(BookingStatus), default=BookingStatus.REQUESTED, nullable=False, index=True)
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    service_address = Column(Text, nullable=False)
    service_location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
    notes = Column(Text, nullable=True)
    voice_recording_url = Column(String(500), nullable=True)

    estimated_fare = Column(Numeric(10, 2), nullable=False)
    actual_fare = Column(Numeric(10, 2), nullable=True)
    worker_share = Column(Numeric(10, 2), nullable=True) # 85-90% to worker
    cooperative_share = Column(Numeric(10, 2), nullable=True) # 10-15% to coop treasury

    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer = relationship("CustomerProfile", back_populates="bookings")
    worker = relationship("WorkerProfile", back_populates="bookings")
    category = relationship("ServiceCategory", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    invoice = relationship("Invoice", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="booking", cascade="all, delete-orphan")
    grievances = relationship("Grievance", back_populates="booking", cascade="all, delete-orphan")
    sos_alerts = relationship("SOSAlert", back_populates="booking")


# ----------------------------------------------------------------------
# 11. Payment Model
# ----------------------------------------------------------------------
class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    gateway_payment_id = Column(String(100), unique=True, nullable=True, index=True)
    gateway_order_id = Column(String(100), nullable=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    payment_method = Column(String(50), default="UPI", nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)
    escrow_held_at = Column(DateTime(timezone=True), nullable=True)
    released_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    booking = relationship("Booking", back_populates="payment")


# ----------------------------------------------------------------------
# 12. Invoice Model
# ----------------------------------------------------------------------
class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    worker_payout = Column(Numeric(10, 2), nullable=False)
    welfare_deduction = Column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    issued_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    booking = relationship("Booking", back_populates="invoice")


# ----------------------------------------------------------------------
# 13. Price Rule Model
# ----------------------------------------------------------------------
class PriceRule(Base, TimestampMixin):
    __tablename__ = "price_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category_id = Column(String(36), ForeignKey("service_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    multiplier = Column(Numeric(4, 2), default=Decimal("1.00"), nullable=False)
    minimum_floor_price = Column(Numeric(10, 2), nullable=False)
    start_hour = Column(Integer, nullable=True) # e.g. 22 for night surge
    end_hour = Column(Integer, nullable=True) # e.g. 6
    is_weather_surge = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    category = relationship("ServiceCategory", back_populates="price_rules")


# ----------------------------------------------------------------------
# 14. Welfare Contribution Model
# ----------------------------------------------------------------------
class WelfareContribution(Base, TimestampMixin):
    __tablename__ = "welfare_contributions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cooperative_id = Column(String(36), ForeignKey("cooperatives.id", ondelete="CASCADE"), nullable=False, index=True)
    worker_id = Column(String(36), ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    contribution_type = Column(String(50), default="gig_automatic_allocation", nullable=False)

    # Relationships
    cooperative = relationship("Cooperative", back_populates="welfare_contributions")
    worker = relationship("WorkerProfile", back_populates="welfare_contributions")


# ----------------------------------------------------------------------
# 15. Welfare Claim Model
# ----------------------------------------------------------------------
class WelfareClaim(Base, TimestampMixin):
    __tablename__ = "welfare_claims"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cooperative_id = Column(String(36), ForeignKey("cooperatives.id", ondelete="CASCADE"), nullable=False, index=True)
    worker_id = Column(String(36), ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    claim_type = Column(String(50), nullable=False) # e.g. "healthcare", "accident", "hardship"
    requested_amount = Column(Numeric(10, 2), nullable=False)
    approved_amount = Column(Numeric(10, 2), nullable=True)
    description = Column(Text, nullable=False)
    evidence_document_url = Column(String(500), nullable=True)
    status = Column(Enum(WelfareClaimStatus), default=WelfareClaimStatus.SUBMITTED, nullable=False, index=True)
    votes_in_favor = Column(Integer, default=0, nullable=False)
    votes_against = Column(Integer, default=0, nullable=False)
    disbursed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    cooperative = relationship("Cooperative", back_populates="welfare_claims")
    worker = relationship("WorkerProfile", back_populates="welfare_claims")


# ----------------------------------------------------------------------
# 16. Rating Model
# ----------------------------------------------------------------------
class Rating(Base, TimestampMixin):
    __tablename__ = "ratings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewee_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False) # 1 to 5
    comment = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True) # e.g. "punctual,polite,skilled"

    __table_args__ = (
        CheckConstraint("score >= 1 AND score <= 5", name="check_valid_rating_score"),
    )

    # Relationships
    booking = relationship("Booking", back_populates="ratings")


# ----------------------------------------------------------------------
# 17. Grievance Model
# ----------------------------------------------------------------------
class Grievance(Base, TimestampMixin):
    __tablename__ = "grievances"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ticket_number = Column(String(30), unique=True, nullable=False, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    complainant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    respondent_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(GrievanceStatus), default=GrievanceStatus.OPEN, nullable=False, index=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    booking = relationship("Booking", back_populates="grievances")


# ----------------------------------------------------------------------
# 18. SOS Alert Model
# ----------------------------------------------------------------------
class SOSAlert(Base, TimestampMixin):
    __tablename__ = "sos_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    trigger_location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
    status = Column(Enum(SOSStatus), default=SOSStatus.ACTIVE, nullable=False, index=True)
    emergency_contacts_alerted = Column(Boolean, default=True, nullable=False)
    police_notified = Column(Boolean, default=False, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="sos_alerts")
    booking = relationship("Booking", back_populates="sos_alerts")


# ----------------------------------------------------------------------
# 19. Notification Model
# ----------------------------------------------------------------------
class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    channel = Column(String(30), default="push", nullable=False) # push, sms, in_app
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    metadata_json = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")


# ----------------------------------------------------------------------
# 20. Location Model (PostGIS Tracking)
# ----------------------------------------------------------------------
class Location(Base, TimestampMixin):
    __tablename__ = "locations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    coordinates = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
    accuracy_meters = Column(Numeric(6, 2), nullable=True)
    heading = Column(Numeric(5, 2), nullable=True) # Degrees 0-360
    speed_mps = Column(Numeric(6, 2), nullable=True) # Speed in meters per second
    recorded_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="locations")
