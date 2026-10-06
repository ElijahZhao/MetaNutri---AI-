"""Site-wide request rate limiting.

A small fixed-window limiter that guards every ``/api`` route (auth endpoints
additionally keep their own stricter brute-force limiter in ``app/api/auth.py``).
Counters live in Redis when it is reachable and otherwise fall back to an
in-process dict, mirroring the cache behaviour in ``app.core.redis``.

This is abuse protection for a free-tier deployment (request storms, scraping,
credential stuffing), not a precise quota system: behind multiple workers the
in-memory fallback is per-process.
"""
import logging
import time
from collections import deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.redis import get_redis

logger = logging.getLogger(__name__)

# Paths that must never be throttled: load balancer / uptime probes.
_EXEMPT_PATHS = {"/health", "/healthz", "/favicon.ico"}


def client_ip(request: Request) -> str:
    """Best-effort client IP, honouring the proxy header set by Render/Vercel."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    # In-memory fallback: key -> deque[monotonic timestamps]
    _hits: dict = {}

    async def dispatch(self, request: Request, call_next):
        scope, limit, window = self._resolve_limit(request)
        if limit is None or not self._should_limit(request):
            return await call_next(request)

        ip = client_ip(request)
        allowed, retry_after = self._consume(scope, ip, limit, window)
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down and try again shortly."},
                headers={"Retry-After": str(retry_after)},
            )
        return await call_next(request)

    @staticmethod
    def _should_limit(request: Request) -> bool:
        if not settings.RATE_LIMIT_ENABLED:
            return False
        # CORS preflight and probes are not user traffic.
        if request.method == "OPTIONS":
            return False
        path = request.url.path
        if path in _EXEMPT_PATHS:
            return False
        return path.startswith("/api")

    @staticmethod
    def _resolve_limit(request: Request):
        """Return (scope, limit, window_seconds); limit is None to skip limiting.

        Mutating methods get their own tighter budget than reads because they are
        the expensive (and abusable) ones.
        """
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            return "write", settings.RATE_LIMIT_WRITE_REQUESTS, settings.RATE_LIMIT_WINDOW_SECONDS
        return "read", settings.RATE_LIMIT_REQUESTS, settings.RATE_LIMIT_WINDOW_SECONDS

    def _consume(self, scope: str, ip: str, limit: int, window: int):
        """Register one hit. Returns (allowed, retry_after_seconds)."""
        key = f"ratelimit:global:{scope}:{ip}"
        r = get_redis()
        if r:
            try:
                return self._consume_redis(r, key, limit, window)
            except Exception:
                # A flaky Redis must never take the API down.
                logger.debug("Redis rate limit failed; using in-memory fallback", exc_info=True)
        return self._consume_memory(key, limit, window)

    @staticmethod
    def _consume_redis(r, key: str, limit: int, window: int):
        # Fixed window: count hits within the current window bucket and let the
        # key expire with it. Two round-trips, so the TTL is never left unset.
        bucket = int(time.time() // window)
        bucket_key = f"{key}:{bucket}"
        count = r.incr(bucket_key)
        if count == 1:
            r.expire(bucket_key, window)
        if count > limit:
            retry_after = window - int(time.time() % window)
            return False, max(retry_after, 1)
        return True, 0

    def _consume_memory(self, key: str, limit: int, window: int):
        now = time.monotonic()
        cutoff = now - window
        hits = self._hits.setdefault(key, deque())
        while hits and hits[0] <= cutoff:
            hits.popleft()
        if len(hits) >= limit:
            return False, max(int(window - (now - hits[0])) or 1, 1)
        hits.append(now)
        # Opportunistic cleanup so the dict cannot grow unbounded with dead keys.
        if len(self._hits) > 10_000:
            for stale_key in [k for k, v in self._hits.items() if not v or v[-1] <= cutoff]:
                self._hits.pop(stale_key, None)
        return True, 0
