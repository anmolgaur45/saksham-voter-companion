from unittest.mock import AsyncMock, MagicMock, patch

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


@pytest.mark.asyncio
async def test_chat_with_locator_override(client):
    r = await client.post(
        "/api/chat",
        json={
            "message": "find polling booths in Delhi",
            "session_id": "test-session",
            "agent_override": "locator",
        },
    )
    assert r.status_code == 200
    assert r.json()["agent"] == "locator"


@pytest.mark.asyncio
async def test_chat_with_verifier_override(client):
    r = await client.post(
        "/api/chat",
        json={
            "message": "EVMs can be tampered remotely",
            "session_id": "test-session",
            "agent_override": "verifier",
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["agent"] == "verifier"
    assert "verdict" in body


@pytest.mark.asyncio
async def test_chat_with_journey_override(client):
    with (
        patch(
            "agents.journey.get_session",
            new_callable=AsyncMock,
            return_value={"completed_steps": []},
        ),
        patch("agents.journey.update_session", new_callable=AsyncMock),
    ):
        r = await client.post(
            "/api/chat",
            json={
                "message": "guide me through voter registration",
                "session_id": "test-journey",
                "agent_override": "journey",
            },
        )
    assert r.status_code == 200
    assert r.json()["agent"] == "journey"


@pytest.mark.asyncio
async def test_tts_endpoint_synthesizes_audio(client):
    tts_client = MagicMock()
    tts_client.synthesize_speech.return_value = MagicMock(audio_content=b"FAKEAUDIO")
    with patch("services.tts._get_client", return_value=tts_client):
        r = await client.post("/api/tts", json={"text": "मतदाता पहचान पत्र", "language": "hi"})
    assert r.status_code == 200
    body = r.json()
    assert "audio" in body
    assert body["format"] == "mp3"


@pytest.mark.asyncio
async def test_constituency_history_returns_rows(client):
    from services.bigquery import CandidateResult, ElectionYear

    fake_rows = [
        ElectionYear(
            year=2019,
            winner="Test Winner",
            party="TEST",
            votes=100_000,
            vote_share=45.0,
            margin=5_000,
            margin_pct=5.0,
            turnout=65.0,
            total_candidates=10,
            top_candidates=[
                CandidateResult(
                    candidate="Test Winner",
                    party="TEST",
                    votes=100_000,
                    vote_share=45.0,
                    is_winner=True,
                )
            ],
        )
    ]
    with patch(
        "services.bigquery.get_constituency_history",
        new_callable=AsyncMock,
        return_value=fake_rows,
    ):
        r = await client.get("/api/constituency/New%20Delhi/history")
    assert r.status_code == 200
    body = r.json()
    assert body["constituency"] == "New Delhi"
    assert len(body["elections"]) == 1
    assert body["elections"][0]["year"] == 2019
    assert body["elections"][0]["winner"] == "Test Winner"


@pytest.mark.asyncio
async def test_chat_with_knowledge_override(client):
    r = await client.post(
        "/api/chat",
        json={
            "message": "how do I register to vote?",
            "session_id": "test-session",
            "agent_override": "knowledge",
        },
    )
    assert r.status_code == 200
    assert r.json()["agent"] == "knowledge"


@pytest.mark.asyncio
async def test_booth_returns_404_when_constituency_not_found(client):
    r = await client.get("/api/booth?q=nonexistent-place")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_translate_batch_returns_input_unchanged_for_english(client):
    r = await client.post(
        "/api/translate",
        json={"texts": ["hello", "world"], "lang": "en"},
    )
    assert r.status_code == 200
    assert r.json()["translated"] == ["hello", "world"]


@pytest.mark.asyncio
async def test_orchestrator_invalid_agent_override_falls_back_to_knowledge(client):
    r = await client.post(
        "/api/chat",
        json={
            "message": "how do I register?",
            "session_id": "test-session",
            "agent_override": "bogus_agent",
        },
    )
    assert r.status_code == 200
    assert r.json()["agent"] == "knowledge"


@pytest.mark.asyncio
async def test_chat_translates_non_english_request(client):
    with (
        patch(
            "api.chat.translate_to_english",
            new_callable=AsyncMock,
            return_value="how do I register?",
        ),
        patch("api.chat.translate_text", new_callable=AsyncMock, return_value="कैसे रजिस्टर करें?"),
    ):
        r = await client.post(
            "/api/chat",
            json={
                "message": "मैं कैसे रजिस्टर करूं?",
                "session_id": "test-session",
                "language": "hi",
            },
        )
    assert r.status_code == 200
    assert r.json()["response"] == "कैसे रजिस्टर करें?"


@pytest.mark.asyncio
async def test_constituency_search_returns_list(client):
    r = await client.get("/api/constituency/search?q=Delhi")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_global_exception_handler_returns_500_json():
    # Uses synchronous TestClient with raise_server_exceptions=False so the
    # 500 JSONResponse from global_handler is returned rather than re-raised.
    from fastapi import FastAPI
    from starlette.testclient import TestClient

    from core.exceptions import add_exception_handler

    minimal_app = FastAPI()
    add_exception_handler(minimal_app)

    @minimal_app.get("/error")
    def _error():
        raise RuntimeError("kaboom")

    with TestClient(minimal_app, raise_server_exceptions=False) as tc:
        r = tc.get("/error")
    assert r.status_code == 500
    assert r.json() == {"error": "internal server error"}
