import time
import logging
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

# ══════════════════════════════════════════════════════════════════════════════
# IN-MEMORY SLIDING WINDOW RATE LIMITER
# ══════════════════════════════════════════════════════════════════════════════

class SlidingWindowRateLimiter:
    def __init__(self):
        # Maps client_ip:endpoint -> list of request timestamps
        self._requests: Dict[str, List[float]] = {}
        
    def _clean_old_requests(self, key: str, window_seconds: int, now: float) -> None:
        if key in self._requests:
            cutoff = now - window_seconds
            self._requests[key] = [t for t in self._requests[key] if t > cutoff]
            if not self._requests[key]:
                del self._requests[key]

    def is_rate_limited(
        self,
        client_id: str,
        max_requests: int = 120,
        window_seconds: int = 60
    ) -> Tuple[bool, int, int]:
        """
        Returns (is_limited, remaining_requests, retry_after_seconds)
        """
        now = time.time()
        self._clean_old_requests(client_id, window_seconds, now)
        
        timestamps = self._requests.get(client_id, [])
        if len(timestamps) >= max_requests:
            oldest_in_window = timestamps[0]
            retry_after = int(max(1, window_seconds - (now - oldest_in_window)))
            return True, 0, retry_after
        
        # Record this request
        if client_id not in self._requests:
            self._requests[client_id] = []
        self._requests[client_id].append(now)
        
        remaining = max_requests - len(self._requests[client_id])
        return False, remaining, 0


# Global Rate Limiter Instance
rate_limiter = SlidingWindowRateLimiter()


def get_client_identifier(request: Request) -> str:
    """Extracts client IP or forward headers for rate limiting."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Global middleware enforcing baseline rate limits across all API endpoints.
    Allows up to 180 requests per minute per IP.
    """
    async def dispatch(self, request: Request, call_next):
        # Exempt WebSocket upgrades and docs/health endpoints
        path = request.url.path
        if "/ws" in path or path in ("/docs", "/openapi.json", "/redoc", "/api/v1/health"):
            return await call_next(request)
        
        client_ip = get_client_identifier(request)
        key = f"global:{client_ip}"
        
        is_limited, remaining, retry_after = rate_limiter.is_rate_limited(
            client_id=key,
            max_requests=180,
            window_seconds=60
        )
        
        if is_limited:
            logger.warning(f"Rate limit exceeded for client {client_ip} on path {path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Please slow down your requests.",
                    "retry_after_seconds": retry_after
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": "180",
                    "X-RateLimit-Remaining": "0"
                }
            )
        
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = "180"
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response


def rate_limit_sensitive(max_requests: int = 25, window_seconds: int = 60):
    """
    FastAPI dependency for sensitive endpoints (Auth, SOS, Payment, Speech).
    """
    async def dependency(request: Request):
        client_ip = get_client_identifier(request)
        endpoint_key = f"sensitive:{request.url.path}:{client_ip}"
        
        is_limited, remaining, retry_after = rate_limiter.is_rate_limited(
            client_id=endpoint_key,
            max_requests=max_requests,
            window_seconds=window_seconds
        )
        
        if is_limited:
            logger.warning(f"Sensitive endpoint rate limit reached for {client_ip} on {request.url.path}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests to this endpoint. Please try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )
        return True
    return dependency
