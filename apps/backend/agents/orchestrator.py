from __future__ import annotations

import json
from enum import Enum

import vertexai
from vertexai.generative_models import GenerationConfig, GenerativeModel

from agents.journey import JourneyAgent
from agents.knowledge import KnowledgeAgent
from agents.locator import LocatorAgent
from agents.verifier import VerifierAgent
from core.config import settings

_CLASSIFIER_PROMPT = """\
Classify the user message into exactly one intent category.

Categories:
- knowledge: factual questions about elections — voter registration process, EVM, Model Code of Conduct, forms, eligibility, timelines, polling day procedures, vote counting. Use this for ANY "how do I" or "what is" question about elections.
- locator: finding a specific polling booth or constituency, "where do I vote", "show me on map"
- verifier: asking whether a specific claim or rumour is true or false
- journey: user explicitly asks to be guided through a checklist or says "guide me", "walk me through", "what are the steps for me" (NOT a general how-to question)
- greeting: hi, hello, thanks, bye, what can you do
- out_of_scope: political party opinions, candidate recommendations, election predictions, unrelated topics

When in doubt between knowledge and journey, choose knowledge.

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


class Intent(str, Enum):
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
        if agent_override:
            try:
                intent = Intent(agent_override)
            except ValueError:
                intent = Intent.knowledge
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

        if intent == Intent.knowledge:
            return await self._knowledge.run(message)
        if intent == Intent.locator:
            return await self._locator.run(message)
        if intent == Intent.verifier:
            return await self._verifier.run(message)
        if intent == Intent.journey:
            return await self._journey.run(session_id, message)
        if intent == Intent.greeting:
            return {"response": _GREETING, "citations": [], "agent": "orchestrator"}
        if intent == Intent.out_of_scope:
            return {"response": _OUT_OF_SCOPE, "citations": [], "agent": "orchestrator"}
        return {"response": "This feature is coming soon.", "citations": [], "agent": intent.value}
