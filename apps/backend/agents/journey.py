from __future__ import annotations

import vertexai
from vertexai.generative_models import GenerationConfig, GenerativeModel

from core.config import settings
from services.firestore import get_session, update_session

_STEPS = [
    "step_voter_type",
    "step_state",
    "step_registration",
    "step_booth",
    "step_polling_day",
]

_SYSTEM = """\
You are Saksham, a guide helping Indian citizens with the voter registration and election process.
You walk users through a 5-step onboarding checklist, one step at a time.

The steps in order are:
1. step_voter_type — Ask if they are a first-time voter
2. step_state — Ask which state they are in
3. step_registration — Explain how to check or complete voter registration (Form 6 from eci.gov.in)
4. step_booth — Tell them how to find their polling booth using this app
5. step_polling_day — Tell them what documents to bring on polling day

Be concise (under 80 words per response), warm, and practical.
Do not discuss political parties, candidates, or voting recommendations.
If the user has already completed a step based on context, move to the next one."""


class JourneyAgent:
    def __init__(self) -> None:
        vertexai.init(project=settings.gcp_project_id, location=settings.vertex_location)
        self._model = GenerativeModel(settings.vertex_model, system_instruction=_SYSTEM)

    async def run(self, session_id: str, message: str) -> dict:
        session = await get_session(session_id)
        completed: list[str] = session.get("completed_steps", [])
        pending = [s for s in _STEPS if s not in completed]

        current_step = pending[0] if pending else "step_polling_day"

        prompt = (
            f"Completed steps so far: {completed}\n"
            f"Current step to address: {current_step}\n"
            f"User message: {message}\n\n"
            "Respond to the user's message in the context of the current step. "
            "If their message satisfactorily answers or acknowledges the current step, "
            "briefly acknowledge it and then move to the next step's question."
        )

        cr = self._model.generate_content(
            contents=prompt,
            generation_config=GenerationConfig(temperature=0.3),
        )
        text = cr.text if cr.candidates else "Let's get started. Are you a first-time voter?"

        if pending and len(message.split()) >= 1:
            await update_session(session_id, {"completed_steps": completed + [current_step]})

        return {"response": text, "citations": [], "agent": "journey"}
