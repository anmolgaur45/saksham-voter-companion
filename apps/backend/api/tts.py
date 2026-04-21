from fastapi import APIRouter

router = APIRouter()


@router.post("/api/tts")
async def tts() -> dict:
    return {"error": "not implemented"}
