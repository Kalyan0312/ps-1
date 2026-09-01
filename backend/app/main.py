import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.rate_limit import RateLimitMiddleware
from app.api.v1.api import api_router
from app.api.v1.endpoints.ws import router as ws_router

# Configure logging without sensitive PII
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info(f"Starting up {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    yield
    # Shutdown sequence
    logger.info(f"Shutting down {settings.PROJECT_NAME}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# ─── SECURITY MIDDLEWARE & HEADERS ───────────────────────────────────────────

# 1. Rate Limiting Middleware (180 requests/min per IP)
app.add_middleware(RateLimitMiddleware)

# 2. Strict CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

# 3. Security Response Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# ─── SAFE EXCEPTION HANDLERS (ZERO SECRET/STACK LEAK) ────────────────────────

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardized clean HTTP error envelope."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None)
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats clean validation errors without exposing internal database schemas."""
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        errors.append({
            "field": field or "body",
            "message": err.get("msg", "Invalid input format")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation failed. Please verify the submitted fields.",
            "validation_errors": errors
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catches unhandled runtime errors, prevents traceback and DB connection string leaks."""
    logger.error(f"Unhandled server error on {request.url.path}: {str(exc)}", exc_info=settings.DEBUG)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. The incident has been safely logged."
        }
    )


# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount WebSocket endpoint directly on app
app.include_router(ws_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG
    )
