from fastapi import APIRouter

router = APIRouter()


@router.post("/api/booth")
async def booth() -> dict:
    return {"error": "not implemented"}
