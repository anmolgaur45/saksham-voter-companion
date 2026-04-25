from __future__ import annotations

from vertexai.generative_models import GenerationConfig, GenerativeModel

from core.config import settings
from services.vertex_search import build_search_tool, extract_citations

_SYSTEM = """\
You are a fact-checker for claims about the Indian election process.
Only verify factual claims about: voter registration, polling procedures, EVMs,
the Model Code of Conduct, ECI rules, or election timelines.
Refuse to verify claims about political parties, candidates, or vote predictions.

Respond in this exact format:
VERDICT: <TRUE | FALSE | PARTIALLY_TRUE | UNVERIFIABLE>
REASONING: <1-3 sentences citing the source document>

Base your verdict only on the retrieved ECI documents.
If the documents do not contain relevant information, use UNVERIFIABLE."""


class VerifierAgent:
    def __init__(self) -> None:
        self._model = GenerativeModel(
            model_name=settings.vertex_model,
            system_instruction=_SYSTEM,
        )
        self._tool = build_search_tool(
            settings.gcp_project_id,
            settings.vertex_search_datastore_id,
        )

    async def run(self, message: str) -> dict:
        """Fact-check a claim against ECI documents and return a structured verdict.

        Args:
            message: The claim to verify, in English.

        Returns:
            Dict with keys: response (str with VERDICT/REASONING), citations (list),
            agent ("verifier"), verdict (one of TRUE/FALSE/PARTIALLY_TRUE/UNVERIFIABLE).
        """
        response = self._model.generate_content(
            contents=f"Verify this claim: {message}",
            tools=[self._tool],
            generation_config=GenerationConfig(temperature=0),
        )
        text = response.text if response.candidates else "Unable to verify this claim."

        verdict = "UNVERIFIABLE"
        for v in ("TRUE", "FALSE", "PARTIALLY_TRUE", "UNVERIFIABLE"):
            if f"VERDICT: {v}" in text:
                verdict = v
                break

        return {
            "response": text,
            "citations": extract_citations(response),
            "agent": "verifier",
            "verdict": verdict,
        }
