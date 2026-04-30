from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_timeline_returns_english_phases(client):
    r = await client.get("/api/timeline")
    assert r.status_code == 200
    phases = r.json()
    assert isinstance(phases, list)
    assert len(phases) > 0
    assert "id" in phases[0]
    assert "title" in phases[0]


@pytest.mark.asyncio
async def test_timeline_phase_by_id_returns_correct_phase(client):
    r = await client.get("/api/timeline/electoral-roll-revision")
    assert r.status_code == 200
    phase = r.json()
    assert phase["id"] == "electoral-roll-revision"
    assert "title" in phase
    assert "what_happens" in phase


@pytest.mark.asyncio
async def test_timeline_phase_by_id_returns_404_for_unknown_id(client):
    r = await client.get("/api/timeline/nonexistent-phase-id")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_timeline_returns_translated_phases_for_hindi(client):
    # Covers _translate_phase and the non-English _get_phases cache-miss path.
    # translate_text is mocked to return the source text unchanged.
    with patch("api.timeline.translate_text", new_callable=AsyncMock, side_effect=lambda t, _: t):
        r = await client.get("/api/timeline?lang=hi")
    assert r.status_code == 200
    phases = r.json()
    assert len(phases) > 0
    assert "id" in phases[0]
