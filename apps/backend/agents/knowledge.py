from vertexai.generative_models import GenerationConfig, GenerativeModel

from core.config import settings
from services.vertex_search import build_search_tool, extract_citations

_SYSTEM = """\
You are Saksham, an assistant for Indian voter education.
Answer questions using the Election Commission of India documents provided as context.
Be brief: give the essential answer only. Skip preamble, exhaustive lists, and repetition.
Base your answer on the retrieved document content. Be factual and direct.
If the retrieved documents genuinely do not contain enough information to answer, say:
"I don't have a verified source for this — please check eci.gov.in directly."
Do not speculate or add information not present in the sources."""

_FALLBACK_SYSTEM = """\
You are Saksham, an assistant for Indian voter education.
Answer the user's question about Indian elections, voter registration, the Election Commission
of India, polling procedures, EVMs, Model Code of Conduct, or related electoral processes.
Be concise (under 120 words). Use bullet points for lists where helpful.
Stick strictly to Indian elections and voting topics. If the question is unrelated, say you can only help with Indian elections.
Do not discuss political parties, candidates, or voting recommendations.
Your answer is based on general knowledge, not official ECI documents. Advise the user to confirm specific procedural details at eci.gov.in."""


class KnowledgeAgent:
    def __init__(self) -> None:
        self._model = GenerativeModel(
            model_name=settings.vertex_model,
            system_instruction=_SYSTEM,
        )
        self._fallback_model = GenerativeModel(
            model_name=settings.vertex_model,
            system_instruction=_FALLBACK_SYSTEM,
        )
        self._tool = build_search_tool(
            settings.gcp_project_id,
            settings.vertex_search_datastore_id,
        )

    async def run(self, message: str) -> dict:
        """Answer an election-related question, grounded in ECI documents.

        Attempts Vertex AI Search grounding first. Falls back to ungrounded
        Gemini if grounding returns no citations or produces empty text.

        Args:
            message: User question in English.

        Returns:
            Dict with keys: response (str), citations (list), agent ("knowledge"),
            grounded (bool — True if ECI sources were retrieved).
        """
        response = self._model.generate_content(
            contents=message,
            tools=[self._tool],
            generation_config=GenerationConfig(temperature=0),
        )
        citations = extract_citations(response)
        text = response.text if response.candidates else ""

        if citations and text.strip() and "I don't have a verified source" not in text:
            return {
                "response": text,
                "citations": citations,
                "agent": "knowledge",
                "grounded": True,
            }

        # Grounding returned no sources — fall back to ungrounded Gemini
        fb = self._fallback_model.generate_content(
            contents=message,
            generation_config=GenerationConfig(temperature=0.2),
        )
        fb_text = (
            fb.text
            if fb.candidates
            else "I don't have enough information on this. Please check eci.gov.in directly."
        )
        return {"response": fb_text, "citations": [], "agent": "knowledge", "grounded": False}
