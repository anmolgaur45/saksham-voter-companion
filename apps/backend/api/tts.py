from fastapi import APIRouter
from pydantic import BaseModel

from services.tts import synthesize_speech

router = APIRouter()


class TtsRequest(BaseModel):
    text: str
    language: str = "hi"


@router.post("/api/tts")
async def tts(req: TtsRequest) -> dict:
    audio = await synthesize_speech(req.text, req.language)
    return {"audio": audio, "format": "mp3"}
