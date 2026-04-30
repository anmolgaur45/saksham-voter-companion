"""Security headers middleware and 16 KiB body-size cap."""

from __future__ import annotations

import uuid

from fastapi import Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request

_BODY_LIMIT = 16_384

_CSP = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data: https:; "
    "font-src 'self' data:; "
    "connect-src 'self' https://*.googleapis.com https://*.gstatic.com; "
    "frame-ancestors 'none'; "
    "object-src 'none'; "
    "base-uri 'self'"
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                size = int(content_length)
            except (ValueError, TypeError):
                size = 0
            if size > _BODY_LIMIT:
                resp = Response(
                    content='{"detail":"Request body too large"}',
                    status_code=413,
                    media_type="application/json",
                )
                self._apply_headers(request, resp)
                return resp

        resp = await call_next(request)
        self._apply_headers(request, resp)
        return resp

    def _apply_headers(self, request: Request, response: Response) -> None:
        response.headers["Content-Security-Policy"] = _CSP
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(self), microphone=(), camera=(), payment=()"
        )
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"

        proto = request.headers.get("x-forwarded-proto", "http")
        if proto == "https":
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains; preload"
            )

        # Echo client's X-Request-ID if not already set by inner middleware (RequestIdMiddleware)
        if "X-Request-ID" not in response.headers:
            request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
            response.headers["X-Request-ID"] = request_id
