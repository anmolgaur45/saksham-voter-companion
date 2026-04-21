from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.booth import router as booth_router
from api.chat import router as chat_router
from api.tts import router as tts_router
from core.config import settings
from core.exceptions import add_exception_handler
from core.logging import configure_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging(settings.log_level)
    yield


app = FastAPI(title="saksham-backend", version="0.1.0", lifespan=lifespan)

add_exception_handler(app)

app.include_router(chat_router)
app.include_router(booth_router)
app.include_router(tts_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
