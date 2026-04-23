from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.tts import synthesize_speech

router = APIRouter()


class TtsRequest(BaseModel):
    text: str = Field(..., description="Text to synthesize; should be under ~5000 characters")
    language: str = Field("hi", description="BCP-47 language code (hi, ta, bn)")


class TtsResponse(BaseModel):
    audio: str = Field(..., description="Base64-encoded MP3 audio data")
    format: str = Field("mp3", description="Audio format identifier")


@router.post(
    "/api/tts",
    response_model=TtsResponse,
    summary="Synthesize text to speech",
    description=(
        "Converts text to MP3 audio using Cloud Text-to-Speech. "
        "Supported languages: Hindi (hi), Tamil (ta), Bengali (bn). "
        "Returns base64-encoded MP3 for direct browser playback."
    ),
)
async def tts(req: TtsRequest) -> TtsResponse:
    audio = await synthesize_speech(req.text, req.language)
    return TtsResponse(audio=audio)
