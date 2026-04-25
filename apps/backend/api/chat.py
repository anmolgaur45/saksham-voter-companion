from fastapi import APIRouter
from pydantic import BaseModel, Field

from agents.orchestrator import OrchestratorAgent
from services.translation import translate_text, translate_to_english

router = APIRouter()
_orchestrator: OrchestratorAgent | None = None


def _get_orchestrator() -> OrchestratorAgent:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = OrchestratorAgent()
    return _orchestrator


class ChatRequest(BaseModel):
    message: str = Field(..., max_length=4000, description="User message text")
    session_id: str = Field(..., max_length=200, description="Anonymous session UUID from the browser")
    language: str = Field(
        "en", max_length=10, description="BCP-47 language code for input and output (en, hi, ta, bn)"
    )
    agent_override: str | None = Field(
        None,
        max_length=50,
        description="Force routing to a specific agent (knowledge, locator, verifier, journey)",
    )


class Citation(BaseModel):
    title: str | None = Field(None, description="Source document title")
    url: str | None = Field(
        None, description="Browser-accessible source URL; null for private GCS paths"
    )


class ChatResponse(BaseModel):
    response: str = Field(
        ..., description="Agent response text, translated to the requested language"
    )
    agent: str = Field(..., description="Name of the agent that handled the request")
    citations: list[Citation] = Field(
        default_factory=list, description="ECI source citations from Vertex AI Search grounding"
    )
    booth_query: str | None = Field(
        None, description="Constituency ID for client-side booth map rendering (locator agent only)"
    )
    verdict: str | None = Field(
        None,
        description="Fact-check verdict (TRUE, FALSE, PARTIALLY_TRUE, UNVERIFIABLE — verifier agent only)",
    )
    grounded: bool | None = Field(
        None,
        description="True if response is grounded in ECI documents; False for fallback Gemini answers; null for non-knowledge agents",
    )


@router.post(
    "/api/chat",
    response_model=ChatResponse,
    summary="Send a message to the multi-agent system",
    description=(
        "Classifies intent, routes to the appropriate specialist agent, "
        "and returns a response optionally grounded in ECI documents. "
        "Input is translated to English before processing; output is translated "
        "back to the requested language."
    ),
)
async def chat(req: ChatRequest) -> ChatResponse:
    message = req.message
    if req.language != "en":
        message = await translate_to_english(message)
    result = await _get_orchestrator().run(
        req.session_id,
        message,
        agent_override=req.agent_override,
    )
    response_text = result["response"]
    if req.language != "en" and response_text:
        response_text = await translate_text(response_text, req.language)
    return ChatResponse(
        response=response_text,
        agent=result["agent"],
        citations=[Citation(**c) for c in result.get("citations", [])],
        booth_query=result.get("booth_query"),
        verdict=result.get("verdict"),
        grounded=result.get("grounded"),
    )
