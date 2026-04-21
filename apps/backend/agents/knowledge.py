import vertexai
from vertexai.generative_models import GenerationConfig, GenerativeModel

from core.config import settings
from services.vertex_search import build_search_tool, extract_citations

_SYSTEM = """\
You are Saksham, an assistant for Indian voter education.
Answer questions using the Election Commission of India documents provided as context.
Base your answer on the retrieved document content. Be concise and factual.
If the retrieved documents genuinely do not contain enough information to answer, say:
"I don't have a verified source for this — please check eci.gov.in directly."
Do not speculate or add information not present in the sources."""


class KnowledgeAgent:
    def __init__(self) -> None:
        vertexai.init(project=settings.gcp_project_id, location=settings.vertex_location)
        self._model = GenerativeModel(
            model_name=settings.vertex_model,
            system_instruction=_SYSTEM,
        )
        self._tool = build_search_tool(
            settings.gcp_project_id,
            settings.vertex_search_datastore_id,
        )

    async def run(self, message: str) -> dict:
        response = self._model.generate_content(
            contents=message,
            tools=[self._tool],
            generation_config=GenerationConfig(temperature=0),
        )
        text = (
            response.text
            if response.candidates
            else "I don't have a verified source for this — please check eci.gov.in directly."
        )
        return {"response": text, "citations": extract_citations(response), "agent": "knowledge"}
