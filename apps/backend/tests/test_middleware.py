from unittest.mock import MagicMock

import pytest

from core.rate_limit import _get_client_ip

# --- SecurityHeadersMiddleware (via full app client) ---


@pytest.mark.asyncio
async def test_security_headers_returns_413_for_oversized_body(client):
    r = await client.get("/health", headers={"Content-Length": "20000"})
    assert r.status_code == 413
    assert r.json() == {"detail": "Request body too large"}


@pytest.mark.asyncio
async def test_security_headers_adds_hsts_for_https_requests(client):
    r = await client.get("/health", headers={"x-forwarded-proto": "https"})
    assert r.status_code == 200
    assert "strict-transport-security" in r.headers


# --- _get_client_ip unit tests ---


def test_get_client_ip_prefers_x_forwarded_for_header():
    request = MagicMock()
    request.headers.get.return_value = "1.2.3.4, 5.6.7.8"
    assert _get_client_ip(request) == "1.2.3.4"


def test_get_client_ip_falls_back_to_client_host():
    request = MagicMock()
    request.headers.get.return_value = None
    request.client.host = "9.9.9.9"
    assert _get_client_ip(request) == "9.9.9.9"
