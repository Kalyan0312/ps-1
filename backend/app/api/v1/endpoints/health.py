import time
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, status, Response
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine
from app.schemas.health import HealthResponse, DatabaseHealth

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Comprehensive Service and Database Health Check",
    description="Inspects live backend status, active PostgreSQL connection, PostGIS spatial extension, and service configurations."
)
async def check_health(response: Response):
    start_time = time.perf_counter()
    db_health = DatabaseHealth(
        status="down",
        connected=False,
        database_name=settings.POSTGRES_DB,
        postgis_available=False,
        postgis_version=None,
        error_message=None
    )

    # Test Database & PostGIS connectivity with quick timeout
    try:
        import asyncio
        async def _ping_db():
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
                try:
                    postgis_res = await conn.execute(text("SELECT PostGIS_Version();"))
                    row = postgis_res.fetchone()
                    if row and row[0]:
                        db_health.postgis_available = True
                        db_health.postgis_version = str(row[0])
                except Exception as pe:
                    db_health.postgis_available = False
                    db_health.postgis_version = f"Extension note: {str(pe)}"

        await asyncio.wait_for(_ping_db(), timeout=1.5)
        latency = (time.perf_counter() - start_time) * 1000.0
        db_health.connected = True
        db_health.status = "healthy"
        db_health.latency_ms = round(latency, 2)
    except Exception as e:
        latency = (time.perf_counter() - start_time) * 1000.0
        db_health.status = "disconnected"
        db_health.connected = False
        db_health.latency_ms = round(latency, 2)
        db_health.error_message = str(e)
        logger.warning(f"Database connection failed: {e}")

    overall_status = "healthy" if db_health.connected else "disconnected"
    
    # Return 200 even if degraded so health dashboards can display detailed metrics
    response.status_code = status.HTTP_200_OK

    return HealthResponse(
        status=overall_status,
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
        database=db_health,
        services={
            "speech_to_text": bool(settings.GOOGLE_APPLICATION_CREDENTIALS or settings.GOOGLE_CLOUD_PROJECT),
            "payments_gateway": bool(settings.RAZORPAY_KEY_ID),
            "firebase_notifications": bool(settings.FIREBASE_CREDENTIALS_PATH),
            "forecasting_engine": settings.FORECASTING_MODEL_TYPE,
            "realtime_websockets": "enabled",
        }
    )
