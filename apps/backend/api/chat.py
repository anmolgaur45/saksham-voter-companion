from fastapi import APIRouter
from pydantic import BaseModel

from agents.orchestrator import OrchestratorAgent

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


class Citation(BaseModel):
    title: str | None = None
    url: str | None = None


class ChatResponse(BaseModel):
    response: str
    agent: str
    citations: list[Citation] = []


@router.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    result = await _get_orchestrator().run(req.session_id, req.message)
    return ChatResponse(
        response=result["response"],
        agent=result["agent"],
        citations=[Citation(**c) for c in result.get("citations", [])],
    )
