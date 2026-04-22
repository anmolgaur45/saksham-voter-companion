from fastapi import APIRouter, Query

from services.firestore import get_constituency_by_id, search_constituency

router = APIRouter()


@router.get("/api/booth")
async def booth(q: str = Query(..., description="Constituency ID or name")) -> dict:
    result = await get_constituency_by_id(q) or await search_constituency(q)
    if not result:
        return {"error": f"No polling booth data found for '{q}'"}
    return result
