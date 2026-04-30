from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from agents.knowledge import KnowledgeAgent
from agents.locator import LocatorAgent
from agents.verifier import VerifierAgent

# --- LocatorAgent ---


@pytest.mark.asyncio
async def test_locator_returns_not_found_when_constituency_missing():
    gm = MagicMock()
    gm.generate_content_async = AsyncMock(return_value=MagicMock(text='{"location": "Chennai"}'))
    with (
        patch("agents.locator.GenerativeModel", return_value=gm),
        patch("agents.locator.search_constituency", new_callable=AsyncMock, return_value=None),
    ):
        agent = LocatorAgent()
        result = await agent.run("find polling booths in Chennai")
    assert result["agent"] == "locator"
    assert "couldn't find" in result["response"].lower()


@pytest.mark.asyncio
async def test_locator_returns_booth_data_when_constituency_found():
    gm = MagicMock()
    gm.generate_content_async = AsyncMock(
        return_value=MagicMock(text='{"location": "Mumbai North"}')
    )
    fake_constituency = {
        "id": "mumbai-north",
        "name": "Mumbai North",
        "state": "Maharashtra",
        "center": {"lat": 19.12, "lng": 72.84},
        "booths": [
            {"id": "b1", "name": "Booth 1", "address": "123 Main St", "lat": 19.12, "lng": 72.84}
        ],
    }
    with (
        patch("agents.locator.GenerativeModel", return_value=gm),
        patch(
            "agents.locator.search_constituency",
            new_callable=AsyncMock,
            return_value=fake_constituency,
        ),
    ):
        agent = LocatorAgent()
        result = await agent.run("find polling booths in Mumbai North")
    assert result["agent"] == "locator"
    assert "Mumbai North" in result["response"]
    assert result["booth_query"] == "mumbai-north"


@pytest.mark.asyncio
async def test_locator_handles_malformed_json_from_model():
    gm = MagicMock()
    gm.generate_content_async = AsyncMock(return_value=MagicMock(text="not valid json {{{"))
    with patch("agents.locator.GenerativeModel", return_value=gm):
        agent = LocatorAgent()
        result = await agent.run("find booths")
    assert result["agent"] == "locator"
    assert "please tell me" in result["response"].lower()


# --- VerifierAgent ---


@pytest.mark.asyncio
async def test_verifier_extracts_true_verdict_from_response():
    gm = MagicMock()
    gm.generate_content_async = AsyncMock(
        return_value=MagicMock(text="VERDICT: TRUE\nREASONING: EVMs use paper audit trails.")
    )
    with (
        patch("agents.verifier.GenerativeModel", return_value=gm),
        patch("agents.verifier.build_search_tool", return_value=MagicMock()),
    ):
        agent = VerifierAgent()
        result = await agent.run("EVMs are tamper-proof")
    assert result["agent"] == "verifier"
    assert result["verdict"] == "TRUE"


# --- KnowledgeAgent ---


@pytest.mark.asyncio
async def test_knowledge_returns_grounded_true_when_citations_present():
    gm = MagicMock()
    gm.generate_content_async = AsyncMock(
        return_value=MagicMock(text="Submit Form 6 at eci.gov.in to register.")
    )
    fake_citations = [{"title": "ECI Voter Guide", "url": "https://eci.gov.in/guide.pdf"}]
    with (
        patch("agents.knowledge.GenerativeModel", return_value=gm),
        patch("agents.knowledge.build_search_tool", return_value=MagicMock()),
        patch("agents.knowledge.extract_citations", return_value=fake_citations),
    ):
        agent = KnowledgeAgent()
        result = await agent.run("how do I register to vote?")
    assert result["agent"] == "knowledge"
    assert result["grounded"] is True
    assert len(result["citations"]) == 1
