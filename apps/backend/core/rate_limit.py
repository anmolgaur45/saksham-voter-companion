"""Per-IP sliding-window rate limiter using in-memory deques. No external dependencies."""

from __future__ import annotations

import os
import time
from collections import deque
from threading import Lock

from fastapi import Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request

_WINDOW = 60  # seconds

_LIMITS: dict[str, int] = {
    "/api/chat": 30,
    "/api/tts": 20,
}

# path -> ip -> ordered timestamps of requests within the window
_buckets: dict[str, dict[str, deque[float]]] = {}
_lock = Lock()


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Bypass entirely in pytest to avoid interfering with test fixtures
        if os.getenv("PYTEST_CURRENT_TEST"):
            return await call_next(request)

        path = request.url.path
        limit = _LIMITS.get(path)
        if limit is None:
            return await call_next(request)

        ip = _get_client_ip(request)
        now = time.monotonic()

        with _lock:
            if path not in _buckets:
                _buckets[path] = {}
            if ip not in _buckets[path]:
                _buckets[path][ip] = deque()

            dq = _buckets[path][ip]
            # Evict timestamps outside the sliding window
            while dq and dq[0] < now - _WINDOW:
                dq.popleft()

            if len(dq) >= limit:
                retry_after = max(1, int(_WINDOW - (now - dq[0])))
                return Response(
                    content='{"detail":"Rate limit exceeded"}',
                    status_code=429,
                    media_type="application/json",
                    headers={"Retry-After": str(retry_after)},
                )

            dq.append(now)

        return await call_next(request)
