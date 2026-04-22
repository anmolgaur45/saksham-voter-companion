from fastapi import APIRouter
from pydantic import BaseModel

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
    message: str
    session_id: str
    language: str = "en"
    agent_override: str | None = None


class Citation(BaseModel):
    title: str | None = None
    url: str | None = None


class ChatResponse(BaseModel):
    response: str
    agent: str
    citations: list[Citation] = []
    booth_query: str | None = None
    verdict: str | None = None


@router.post("/api/chat", response_model=ChatResponse)
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
    )
