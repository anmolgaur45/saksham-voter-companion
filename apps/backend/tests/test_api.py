import pytest


@pytest.mark.asyncio
async def test_health_endpoint_returns_ok(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_chat_endpoint_validates_message_length(client):
    r = await client.post(
        "/api/chat",
        json={
            "message": "x" * 5000,
            "session_id": "test-session",
        },
    )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_chat_endpoint_handles_basic_message(client):
    r = await client.post(
        "/api/chat",
        json={
            "message": "hello",
            "session_id": "test-session",
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert "response" in body
    assert "agent" in body


@pytest.mark.asyncio
async def test_constituency_history_unknown_returns_404(client):
    r = await client.get("/api/constituency/ZZUNKNOWNZZ/history")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_tts_endpoint_validates_text_length(client):
    r = await client.post(
        "/api/tts",
        json={
            "text": "x" * 6000,
            "language": "hi",
        },
    )
    assert r.status_code == 422
