"""Core database models with PostGIS spatial support

Revision ID: 001_core_models
Revises: 
Create Date: 2026-08-28 14:21:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2

# revision identifiers, used by Alembic.
revision: str = '001_core_models'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Ensure PostGIS extensions are enabled
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis_topology;")

    # 2. Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('phone_number', sa.String(length=20), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('role', sa.Enum('WORKER', 'CUSTOMER', 'ADMIN', 'COOPERATIVE_LEADER', name='userrole'), nullable=False),
        sa.Column('status', sa.Enum('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DEACTIVATED', name='userstatus'), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False),
        sa.Column('preferred_language', sa.String(length=10), nullable=False),
        sa.Column('fcm_token', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('phone_number')
    )
    op.create_index(op.f('ix_users_created_at'), 'users', ['created_at'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)
    op.create_index(op.f('ix_users_phone_number'), 'users', ['phone_number'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    op.create_index(op.f('ix_users_status'), 'users', ['status'], unique=False)

    # 3. Cooperatives Table
    op.create_table(
        'cooperatives',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('registration_number', sa.String(length=100), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('treasury_balance', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('dividend_rate', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('welfare_pool_balance', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('registration_number')
    )
    op.create_index(op.f('ix_cooperatives_city'), 'cooperatives', ['city'], unique=False)
    op.create_index(op.f('ix_cooperatives_created_at'), 'cooperatives', ['created_at'], unique=False)

    # 4. Worker Profiles Table
    op.create_table(
        'worker_profiles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('cooperative_id', sa.String(length=36), nullable=True),
        sa.Column('is_online', sa.Boolean(), nullable=False),
        sa.Column('is_available', sa.Boolean(), nullable=False),
        sa.Column('rating_average', sa.Numeric(precision=3, scale=2), nullable=False),
        sa.Column('total_gigs_completed', sa.Integer(), nullable=False),
        sa.Column('total_earnings', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('cooperative_dividend_earned', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('upi_id', sa.String(length=100), nullable=True),
        sa.Column('current_location', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['cooperative_id'], ['cooperatives.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_worker_profiles_cooperative_id'), 'worker_profiles', ['cooperative_id'], unique=False)
    op.create_index(op.f('ix_worker_profiles_created_at'), 'worker_profiles', ['created_at'], unique=False)
    op.create_index(op.f('ix_worker_profiles_is_available'), 'worker_profiles', ['is_available'], unique=False)
    op.create_index(op.f('ix_worker_profiles_is_online'), 'worker_profiles', ['is_online'], unique=False)
    op.create_index(op.f('ix_worker_profiles_user_id'), 'worker_profiles', ['user_id'], unique=False)

    # 5. Customer Profiles Table
    op.create_table(
        'customer_profiles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('default_address', sa.Text(), nullable=True),
        sa.Column('default_location', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=True),
        sa.Column('rating_average', sa.Numeric(precision=3, scale=2), nullable=False),
        sa.Column('total_bookings', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_customer_profiles_created_at'), 'customer_profiles', ['created_at'], unique=False)
    op.create_index(op.f('ix_customer_profiles_user_id'), 'customer_profiles', ['user_id'], unique=False)

    # 6. Admin Profiles Table
    op.create_table(
        'admin_profiles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('department', sa.String(length=100), nullable=False),
        sa.Column('permissions', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_admin_profiles_created_at'), 'admin_profiles', ['created_at'], unique=False)
    op.create_index(op.f('ix_admin_profiles_user_id'), 'admin_profiles', ['user_id'], unique=False)

    # 7. Service Categories Table
    op.create_table(
        'service_categories',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('slug', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('base_rate', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('minimum_wage_floor', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('icon_name', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug')
    )
    op.create_index(op.f('ix_service_categories_created_at'), 'service_categories', ['created_at'], unique=False)
    op.create_index(op.f('ix_service_categories_slug'), 'service_categories', ['slug'], unique=False)

    # 8. Worker Skills Table
    op.create_table(
        'worker_skills',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=36), nullable=False),
        sa.Column('category_id', sa.String(length=36), nullable=False),
        sa.Column('experience_years', sa.Integer(), nullable=False),
        sa.Column('custom_hourly_rate', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('is_certified', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['service_categories.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['worker_id'], ['worker_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('worker_id', 'category_id', name='uq_worker_category_skill')
    )
    op.create_index(op.f('ix_worker_skills_category_id'), 'worker_skills', ['category_id'], unique=False)
    op.create_index(op.f('ix_worker_skills_created_at'), 'worker_skills', ['created_at'], unique=False)
    op.create_index(op.f('ix_worker_skills_worker_id'), 'worker_skills', ['worker_id'], unique=False)

    # 9. Worker Documents Table
    op.create_table(
        'worker_documents',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=36), nullable=False),
        sa.Column('document_type', sa.String(length=50), nullable=False),
        sa.Column('document_number', sa.String(length=100), nullable=True),
        sa.Column('file_url', sa.String(length=500), nullable=False),
        sa.Column('status', sa.Enum('SUBMITTED', 'VERIFIED', 'REJECTED', 'EXPIRED', name='documentstatus'), nullable=False),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['worker_id'], ['worker_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_worker_documents_created_at'), 'worker_documents', ['created_at'], unique=False)
    op.create_index(op.f('ix_worker_documents_status'), 'worker_documents', ['status'], unique=False)
    op.create_index(op.f('ix_worker_documents_worker_id'), 'worker_documents', ['worker_id'], unique=False)

    # 10. Worker Availabilities Table
    op.create_table(
        'worker_availabilities',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=36), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.String(length=5), nullable=False),
        sa.Column('end_time', sa.String(length=5), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['worker_id'], ['worker_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_worker_day_availability', 'worker_availabilities', ['worker_id', 'day_of_week'], unique=False)
    op.create_index(op.f('ix_worker_availabilities_created_at'), 'worker_availabilities', ['created_at'], unique=False)
    op.create_index(op.f('ix_worker_availabilities_worker_id'), 'worker_availabilities', ['worker_id'], unique=False)

    # 11. Bookings Table
    op.create_table(
        'bookings',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('booking_reference', sa.String(length=20), nullable=False),
        sa.Column('customer_id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=36), nullable=True),
        sa.Column('category_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.Enum('REQUESTED', 'MATCHING', 'ACCEPTED', 'WORKER_EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_WORKER', 'DISPUTED', name='bookingstatus'), nullable=False),
        sa.Column('scheduled_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('service_address', sa.Text(), nullable=False),
        sa.Column('service_location', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('voice_recording_url', sa.String(length=500), nullable=True),
        sa.Column('estimated_fare', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('actual_fare', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('worker_share', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('cooperative_share', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['service_categories.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['customer_id'], ['customer_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['worker_id'], ['worker_profiles.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_reference')
    )
    op.create_index(op.f('ix_bookings_booking_reference'), 'bookings', ['booking_reference'], unique=False)
    op.create_index(op.f('ix_bookings_category_id'), 'bookings', ['category_id'], unique=False)
    op.create_index(op.f('ix_bookings_created_at'), 'bookings', ['created_at'], unique=False)
    op.create_index(op.f('ix_bookings_customer_id'), 'bookings', ['customer_id'], unique=False)
    op.create_index(op.f('ix_bookings_status'), 'bookings', ['status'], unique=False)
    op.create_index(op.f('ix_bookings_worker_id'), 'bookings', ['worker_id'], unique=False)

    # 12. Payments Table
    op.create_table(
        'payments',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('booking_id', sa.String(length=36), nullable=False),
        sa.Column('gateway_payment_id', sa.String(length=100), nullable=True),
        sa.Column('gateway_order_id', sa.String(length=100), nullable=True),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('payment_method', sa.String(length=50), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'ESCROW_HELD', 'RELEASED_TO_WORKER', 'REFUNDED', 'FAILED', name='paymentstatus'), nullable=False),
        sa.Column('escrow_held_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('released_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_id'),
        sa.UniqueConstraint('gateway_payment_id')
    )
    op.create_index(op.f('ix_payments_booking_id'), 'payments', ['booking_id'], unique=False)
    op.create_index(op.f('ix_payments_created_at'), 'payments', ['created_at'], unique=False)
    op.create_index(op.f('ix_payments_gateway_order_id'), 'payments', ['gateway_order_id'], unique=False)
    op.create_index(op.f('ix_payments_gateway_payment_id'), 'payments', ['gateway_payment_id'], unique=False)
    op.create_index(op.f('ix_payments_status'), 'payments', ['status'], unique=False)

    # 13. Invoices Table
    op.create_table(
        'invoices',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('invoice_number', sa.String(length=50), nullable=False),
        sa.Column('booking_id', sa.String(length=36), nullable=False),
        sa.Column('subtotal', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('tax_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('worker_payout', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('welfare_deduction', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('issued_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_id'),
        sa.UniqueConstraint('invoice_number')
    )
    op.create_index(op.f('ix_invoices_booking_id'), 'invoices', ['booking_id'], unique=False)
    op.create_index(op.f('ix_invoices_created_at'), 'invoices', ['created_at'], unique=False)
    op.create_index(op.f('ix_invoices_invoice_number'), 'invoices', ['invoice_number'], unique=False)

    # 14. Price Rules Table
    op.create_table(
        'price_rules',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('category_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('multiplier', sa.Numeric(precision=4, scale=2), nullable=False),
        sa.Column('minimum_floor_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('start_hour', sa.Integer(), nullable=True),
        sa.Column('end_hour', sa.Integer(), nullable=True),
        sa.Column('is_weather_surge', sa.Boolean(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['service_categories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_price_rules_category_id'), 'price_rules', ['category_id'], unique=False)
    op.create_index(op.f('ix_price_rules_created_at'), 'price_rules', ['created_at'], unique=False)

    # 15. Welfare Contributions Table
    op.create_table(
        'welfare_contributions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('cooperative_id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=36), nullable=False),
        sa.Column('booking_id', sa.String(length=36), nullable=True),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('contribution_type', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['cooperative_id'], ['cooperatives.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['worker_id'], ['worker_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_welfare_contributions_cooperative_id'), 'welfare_contributions', ['cooperative_id'], unique=False)
    op.create_index(op.f('ix_welfare_contributions_created_at'), 'welfare_contributions', ['created_at'], unique=False)
    op.create_index(op.f('ix_welfare_contributions_worker_id'), 'welfare_contributions', ['worker_id'], unique=False)

    # 16. Welfare Claims Table
    op.create_table(
        'welfare_claims',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('cooperative_id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=36), nullable=False),
        sa.Column('claim_type', sa.String(length=50), nullable=False),
        sa.Column('requested_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('approved_amount', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('evidence_document_url', sa.String(length=500), nullable=True),
        sa.Column('status', sa.Enum('SUBMITTED', 'UNDER_REVIEW', 'VOTED_APPROVED', 'REJECTED', 'DISBURSED', name='welfareclaimstatus'), nullable=False),
        sa.Column('votes_in_favor', sa.Integer(), nullable=False),
        sa.Column('votes_against', sa.Integer(), nullable=False),
        sa.Column('disbursed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['cooperative_id'], ['cooperatives.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['worker_id'], ['worker_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_welfare_claims_cooperative_id'), 'welfare_claims', ['cooperative_id'], unique=False)
    op.create_index(op.f('ix_welfare_claims_created_at'), 'welfare_claims', ['created_at'], unique=False)
    op.create_index(op.f('ix_welfare_claims_status'), 'welfare_claims', ['status'], unique=False)
    op.create_index(op.f('ix_welfare_claims_worker_id'), 'welfare_claims', ['worker_id'], unique=False)

    # 17. Ratings Table
    op.create_table(
        'ratings',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('booking_id', sa.String(length=36), nullable=False),
        sa.Column('reviewer_id', sa.String(length=36), nullable=False),
        sa.Column('reviewee_id', sa.String(length=36), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('tags', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('score >= 1 AND score <= 5', name='check_valid_rating_score'),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewee_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ratings_booking_id'), 'ratings', ['booking_id'], unique=False)
    op.create_index(op.f('ix_ratings_created_at'), 'ratings', ['created_at'], unique=False)
    op.create_index(op.f('ix_ratings_reviewee_id'), 'ratings', ['reviewee_id'], unique=False)
    op.create_index(op.f('ix_ratings_reviewer_id'), 'ratings', ['reviewer_id'], unique=False)

    # 18. Grievances Table
    op.create_table(
        'grievances',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('ticket_number', sa.String(length=30), nullable=False),
        sa.Column('booking_id', sa.String(length=36), nullable=True),
        sa.Column('complainant_id', sa.String(length=36), nullable=False),
        sa.Column('respondent_id', sa.String(length=36), nullable=True),
        sa.Column('subject', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.Enum('OPEN', 'INVESTIGATING', 'RESOLVED', 'ESCALATED', 'CLOSED', name='grievancestatus'), nullable=False),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['complainant_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['respondent_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticket_number')
    )
    op.create_index(op.f('ix_grievances_booking_id'), 'grievances', ['booking_id'], unique=False)
    op.create_index(op.f('ix_grievances_complainant_id'), 'grievances', ['complainant_id'], unique=False)
    op.create_index(op.f('ix_grievances_created_at'), 'grievances', ['created_at'], unique=False)
    op.create_index(op.f('ix_grievances_respondent_id'), 'grievances', ['respondent_id'], unique=False)
    op.create_index(op.f('ix_grievances_status'), 'grievances', ['status'], unique=False)
    op.create_index(op.f('ix_grievances_ticket_number'), 'grievances', ['ticket_number'], unique=False)

    # 19. SOS Alerts Table
    op.create_table(
        'sos_alerts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('booking_id', sa.String(length=36), nullable=True),
        sa.Column('trigger_location', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=False),
        sa.Column('status', sa.Enum('ACTIVE', 'RESPONDING', 'RESOLVED', 'FALSE_ALARM', name='sosstatus'), nullable=False),
        sa.Column('emergency_contacts_alerted', sa.Boolean(), nullable=False),
        sa.Column('police_notified', sa.Boolean(), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sos_alerts_booking_id'), 'sos_alerts', ['booking_id'], unique=False)
    op.create_index(op.f('ix_sos_alerts_created_at'), 'sos_alerts', ['created_at'], unique=False)
    op.create_index(op.f('ix_sos_alerts_status'), 'sos_alerts', ['status'], unique=False)
    op.create_index(op.f('ix_sos_alerts_user_id'), 'sos_alerts', ['user_id'], unique=False)

    # 20. Notifications Table
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('channel', sa.String(length=30), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('metadata_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_created_at'), 'notifications', ['created_at'], unique=False)
    op.create_index(op.f('ix_notifications_is_read'), 'notifications', ['is_read'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)

    # 21. Locations Table (PostGIS tracking)
    op.create_table(
        'locations',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('booking_id', sa.String(length=36), nullable=True),
        sa.Column('coordinates', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=False),
        sa.Column('accuracy_meters', sa.Numeric(precision=6, scale=2), nullable=True),
        sa.Column('heading', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('speed_mps', sa.Numeric(precision=6, scale=2), nullable=True),
        sa.Column('recorded_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_locations_booking_id'), 'locations', ['booking_id'], unique=False)
    op.create_index(op.f('ix_locations_created_at'), 'locations', ['created_at'], unique=False)
    op.create_index(op.f('ix_locations_recorded_at'), 'locations', ['recorded_at'], unique=False)
    op.create_index(op.f('ix_locations_user_id'), 'locations', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_table('locations')
    op.drop_table('notifications')
    op.drop_table('sos_alerts')
    op.drop_table('grievances')
    op.drop_table('ratings')
    op.drop_table('welfare_claims')
    op.drop_table('welfare_contributions')
    op.drop_table('price_rules')
    op.drop_table('invoices')
    op.drop_table('payments')
    op.drop_table('bookings')
    op.drop_table('worker_availabilities')
    op.drop_table('worker_documents')
    op.drop_table('worker_skills')
    op.drop_table('service_categories')
    op.drop_table('admin_profiles')
    op.drop_table('customer_profiles')
    op.drop_table('worker_profiles')
    op.drop_table('cooperatives')
    op.drop_table('users')
