from __future__ import annotations

import json
import time
from enum import StrEnum

import structlog
import vertexai
from vertexai.generative_models import GenerationConfig, GenerativeModel

from agents.journey import JourneyAgent
from agents.knowledge import KnowledgeAgent
from agents.locator import LocatorAgent
from agents.verifier import VerifierAgent
from core.config import settings
from services.firestore import get_session

_log = structlog.get_logger()

_CLASSIFIER_PROMPT = """\
Classify the user message into exactly one intent category.

Categories:
- knowledge: factual questions about elections — voter registration process, EVM, Model Code of Conduct, forms, eligibility, timelines, polling day procedures, vote counting. Use this for ANY "how do I" or "what is" question about elections.
- locator: finding a polling booth or constituency — includes bare city/constituency names like "Chennai", "Lucknow", "Mumbai", "Delhi", or any place name given as a follow-up to a location question
- verifier: asking whether a specific claim or rumour is true or false
- journey: user explicitly asks to be guided through a checklist or says "guide me", "walk me through", "what are the steps for me" (NOT a general how-to question)
- greeting: hi, hello, thanks, bye, what can you do, okay, yes, no (short acknowledgements with no election content)
- out_of_scope: political party opinions, candidate recommendations, election predictions, clearly unrelated topics

When in doubt between knowledge and journey, choose knowledge.
A bare place name (city or constituency) = locator.
Short acknowledgements (yes, no, okay, sure, got it) = greeting.

Respond with JSON only: {"intent": "<category>"}"""

_GREETING = (
    "Hello! I'm Saksham, your guide to the Indian election process. "
    "Ask me about voter registration, polling booths, EVMs, or how elections work. "
    "You can also ask me to verify a claim, or say 'guide me' to start the voter onboarding checklist."
)
_OUT_OF_SCOPE = (
    "I can only help with official information about the election process — "
    "registration, polling procedures, forms, and ECI rules. "
    "I'm not able to discuss parties, candidates, or voting recommendations."
)


class Intent(StrEnum):
    knowledge = "knowledge"
    locator = "locator"
    verifier = "verifier"
    journey = "journey"
    greeting = "greeting"
    out_of_scope = "out_of_scope"


class OrchestratorAgent:
    def __init__(self) -> None:
        vertexai.init(project=settings.gcp_project_id, location=settings.vertex_location)
        self._classifier = GenerativeModel(settings.vertex_model)
        self._knowledge = KnowledgeAgent()
        self._locator = LocatorAgent()
        self._verifier = VerifierAgent()
        self._journey = JourneyAgent()

    async def run(
        self,
        session_id: str,
        message: str,
        agent_override: str | None = None,
    ) -> dict:
        """Classify intent and dispatch to the appropriate specialist agent.

        If a journey session is active, keeps routing to the Journey agent
        unless the message clearly signals a different intent (knowledge,
        locator, or verifier).

        Args:
            session_id: Anonymous session UUID used for journey state lookup.
            message: User message in English.
            agent_override: Optional intent string to skip classification.

        Returns:
            Agent response dict; shape varies by agent but always contains
            response (str), citations (list), and agent (str).
        """
        structlog.contextvars.bind_contextvars(session_id=session_id)
        t0 = time.monotonic()

        if agent_override:
            try:
                intent = Intent(agent_override)
            except ValueError:
                intent = Intent.knowledge
        else:
            # If an active journey session exists, keep routing there unless
            # the message is clearly a different intent (locator/verifier/knowledge question)
            session = await get_session(session_id)
            if session.get("journey_active"):
                cr = self._classifier.generate_content(
                    contents=f"{_CLASSIFIER_PROMPT}\n\nUser: {message}",
                    generation_config=GenerationConfig(
                        response_mime_type="application/json",
                        temperature=0,
                    ),
                )
                try:
                    classified = Intent(json.loads(cr.text).get("intent", "journey"))
                except Exception:
                    classified = Intent.journey
                # Only break out of journey for explicit different intents
                if classified in (Intent.knowledge, Intent.locator, Intent.verifier):
                    intent = classified
                else:
                    intent = Intent.journey
            else:
                cr = self._classifier.generate_content(
                    contents=f"{_CLASSIFIER_PROMPT}\n\nUser: {message}",
                    generation_config=GenerationConfig(
                        response_mime_type="application/json",
                        temperature=0,
                    ),
                )
                try:
                    intent = Intent(json.loads(cr.text).get("intent", "knowledge"))
                except Exception:
                    intent = Intent.knowledge

        _log.info("dispatch", agent_name=intent.value)

        if intent == Intent.knowledge:
            result = await self._knowledge.run(message)
        elif intent == Intent.locator:
            result = await self._locator.run(message)
        elif intent == Intent.verifier:
            result = await self._verifier.run(message)
        elif intent == Intent.journey:
            result = await self._journey.run(session_id, message)
        elif intent == Intent.greeting:
            result = {"response": _GREETING, "citations": [], "agent": "orchestrator"}
        elif intent == Intent.out_of_scope:
            result = {"response": _OUT_OF_SCOPE, "citations": [], "agent": "orchestrator"}
        else:
            result = {
                "response": "This feature is coming soon.",
                "citations": [],
                "agent": intent.value,
            }

        _log.info("done", agent_name=intent.value, latency_ms=round((time.monotonic() - t0) * 1000))
        return result
