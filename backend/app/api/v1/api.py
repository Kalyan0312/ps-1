from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, services, speech, workers, pricing, bookings, ratings_welfare, admin

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health & Status"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Roles"])
api_router.include_router(services.router, prefix="/services", tags=["Services & Categories"])
api_router.include_router(speech.router, prefix="/speech", tags=["Speech & Voice AI"])
api_router.include_router(workers.router, prefix="/workers", tags=["Workers & Spatial Dispatch"])
api_router.include_router(pricing.router, prefix="/pricing", tags=["Rule-Based Pricing Engine"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings, Payment & Invoice"])
api_router.include_router(ratings_welfare.router, prefix="/community", tags=["Ratings & Welfare"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Desktop Dashboard & Governance"])

