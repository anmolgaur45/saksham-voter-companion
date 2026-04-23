from contextlib import asynccontextmanager

from fastapi import FastAPI
from pydantic import BaseModel, Field

from api.booth import router as booth_router
from api.chat import router as chat_router
from api.constituency import router as constituency_router
from api.i18n import router as i18n_router
from api.timeline import router as timeline_router
from api.tts import router as tts_router
from core.config import settings
from core.exceptions import add_exception_handler
from core.logging import RequestIdMiddleware, configure_logging


@asynccontextmanager
async def lifespan(_app: FastAPI):
    configure_logging(settings.log_level)
    yield


app = FastAPI(title="saksham-backend", version="0.1.0", lifespan=lifespan)

app.add_middleware(RequestIdMiddleware)
add_exception_handler(app)

app.include_router(chat_router)
app.include_router(booth_router)
app.include_router(tts_router)
app.include_router(timeline_router)
app.include_router(i18n_router)
app.include_router(constituency_router)


class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status string")


@app.get("/health", response_model=HealthResponse, summary="Health check")
async def health() -> HealthResponse:
    return HealthResponse(status="ok")
