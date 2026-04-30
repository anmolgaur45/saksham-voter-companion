from contextlib import ExitStack
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from agents.orchestrator import OrchestratorAgent


def _build_agent(gm, session_data=None, journey_session=None):
    """Set up OrchestratorAgent with all external calls mocked.

    Returns (ExitStack, agent) — caller must close the stack.
    """
    if session_data is None:
        session_data = {}

    stack = ExitStack()
    stack.enter_context(patch("vertexai.init"))
    stack.enter_context(patch("agents.orchestrator.GenerativeModel", return_value=gm))
    stack.enter_context(patch("agents.knowledge.GenerativeModel", return_value=gm))
    stack.enter_context(patch("agents.knowledge.build_search_tool", return_value=MagicMock()))
    stack.enter_context(patch("agents.locator.GenerativeModel", return_value=gm))
    stack.enter_context(patch("agents.verifier.GenerativeModel", return_value=gm))
    stack.enter_context(patch("agents.verifier.build_search_tool", return_value=MagicMock()))
    stack.enter_context(patch("agents.journey.GenerativeModel", return_value=gm))
    stack.enter_context(
        patch("agents.orchestrator.get_session", new_callable=AsyncMock, return_value=session_data)
    )
    if journey_session is not None:
        stack.enter_context(
            patch(
                "agents.journey.get_session", new_callable=AsyncMock, return_value=journey_session
            )
        )
        stack.enter_context(patch("agents.journey.update_session", new_callable=AsyncMock))

    agent = OrchestratorAgent()
    return stack, agent


@pytest.mark.asyncio
async def test_orchestrator_returns_out_of_scope_response():
    gm = MagicMock()
    gm.generate_content_async = AsyncMock(return_value=MagicMock(text='{"intent": "out_of_scope"}'))
    stack, agent = _build_agent(gm)
    with stack:
        result = await agent.run(session_id="s1", message="which party should I vote for?")
    assert result["agent"] == "orchestrator"
    assert "parties" in result["response"].lower() or "official" in result["response"].lower()


@pytest.mark.asyncio
async def test_orchestrator_uses_knowledge_fallback_on_classify_exception():
    # First call: invalid intent → ValueError in _classify → returns None → fallback to knowledge
    # Second + third calls: knowledge primary (no citations) then knowledge fallback
    gm = MagicMock()
    gm.generate_content_async = AsyncMock(
        side_effect=[
            MagicMock(text='{"intent": "not_a_real_intent"}'),
            MagicMock(text="Register using Form 6 at eci.gov.in."),
            MagicMock(text="Fallback: visit eci.gov.in for details."),
        ]
    )
    stack, agent = _build_agent(gm)
    with stack:
        result = await agent.run(session_id="s1", message="how do I register?")
    assert result["agent"] == "knowledge"


@pytest.mark.asyncio
async def test_orchestrator_stays_in_journey_for_greeting_during_active_journey():
    # Classifier returns greeting; journey_active=True → stays in journey (no break-out)
    gm = MagicMock()
    gm.generate_content_async = AsyncMock(
        side_effect=[
            MagicMock(text='{"intent": "greeting"}'),
            MagicMock(text="Let's continue. Are you a first-time voter?"),
        ]
    )
    stack, agent = _build_agent(
        gm,
        session_data={"journey_active": True},
        journey_session={"completed_steps": []},
    )
    with stack:
        result = await agent.run(session_id="s1", message="okay")
    assert result["agent"] == "journey"
