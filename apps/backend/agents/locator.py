from __future__ import annotations

import json

from vertexai.generative_models import GenerationConfig, GenerativeModel

from core.config import settings
from services.firestore import search_constituency

_EXTRACT_PROMPT = """\
Extract the location from the user's message.
The location could be a constituency name, city name, or pincode.
Respond with JSON only: {"location": "<extracted location or null if not found>"}"""

_NOT_FOUND = (
    "I couldn't find polling booth data for that location. "
    "I currently have data for 20 major constituencies: "
    "New Delhi, Mumbai South, Chennai Central, Kolkata North, Lucknow, "
    "Ahmedabad East, Thiruvananthapuram, Amritsar, Jaipur, Bangalore South, "
    "Visakhapatnam, Hyderabad, Bhopal, Patna Sahib, Bhubaneswar, "
    "Guwahati, Ranchi, Faridabad, Shimla, and Dehradun."
)


class LocatorAgent:
    def __init__(self) -> None:
        self._model = GenerativeModel(settings.vertex_model)

    async def run(self, message: str) -> dict:
        """Extract a location from the user message and look up polling booths.

        Uses Gemini to extract a location string, then fuzzy-matches it against
        the Firestore constituencies collection.

        Args:
            message: User message in English, expected to contain a location.

        Returns:
            Dict with keys: response (str), citations ([]), agent ("locator"),
            and optionally booth_query (str constituency ID for map rendering).
        """
        cr = self._model.generate_content(
            contents=f"{_EXTRACT_PROMPT}\n\nUser: {message}",
            generation_config=GenerationConfig(
                response_mime_type="application/json",
                temperature=0,
            ),
        )
        try:
            location: str | None = json.loads(cr.text).get("location")
        except Exception:
            location = None

        if not location:
            return {
                "response": "Please tell me which constituency or city you want to find polling booths for.",
                "citations": [],
                "agent": "locator",
            }

        constituency = await search_constituency(location)
        if not constituency:
            return {"response": _NOT_FOUND, "citations": [], "agent": "locator"}

        n = len(constituency.get("booths", []))
        return {
            "response": (
                f"I found {n} polling booth{'s' if n != 1 else ''} in "
                f"{constituency['name']}, {constituency['state']}. "
                "View them on the map below."
            ),
            "citations": [],
            "agent": "locator",
            "booth_query": constituency["id"],
        }
