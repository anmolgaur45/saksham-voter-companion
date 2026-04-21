import json
from enum import Enum

import vertexai
from vertexai.generative_models import GenerationConfig, GenerativeModel

from agents.knowledge import KnowledgeAgent
from core.config import settings

_CLASSIFIER_PROMPT = """\
Classify the user message into exactly one intent category.

Categories:
- knowledge: questions about the election process, voter registration, EVM, Model Code of Conduct, forms, timelines, polling day procedures, vote counting
- locator: finding a polling booth, constituency lookup, where to vote
- verifier: checking whether a claim or rumour about elections is true or false
- journey: first-time voter asking what steps to take, step-by-step onboarding
- greeting: hi, hello, thanks, bye
- out_of_scope: political party opinions, candidate recommendations, predictions, anything unrelated to elections

Respond with JSON only: {"intent": "<category>"}"""

_GREETING = (
    "Hello! I'm Saksham, your guide to the Indian election process. "
    "Ask me about voter registration, polling booths, EVMs, or how elections work."
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

    async def run(self, session_id: str, message: str) -> dict:
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
        if intent == Intent.greeting:
            return {"response": _GREETING, "citations": [], "agent": "orchestrator"}
        if intent == Intent.out_of_scope:
            return {"response": _OUT_OF_SCOPE, "citations": [], "agent": "orchestrator"}
        # Phase 3: locator, verifier, journey agents
        return {
            "response": "This feature is coming soon.",
            "citations": [],
            "agent": intent.value,
        }
