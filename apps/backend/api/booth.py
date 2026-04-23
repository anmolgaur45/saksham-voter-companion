from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.firestore import get_constituency_by_id, search_constituency

router = APIRouter()


class LatLng(BaseModel):
    lat: float = Field(..., description="Latitude in decimal degrees")
    lng: float = Field(..., description="Longitude in decimal degrees")


class BoothModel(BaseModel):
    id: str = Field(..., description="Booth identifier")
    name: str = Field(..., description="Polling booth name")
    address: str = Field(..., description="Street address of the polling booth")
    lat: float = Field(..., description="Booth latitude")
    lng: float = Field(..., description="Booth longitude")


class ConstituencyResponse(BaseModel):
    id: str = Field(..., description="Constituency slug identifier")
    name: str = Field(..., description="Constituency display name")
    state: str = Field(..., description="State the constituency is in")
    center: LatLng = Field(..., description="Map center coordinates for the constituency")
    booths: list[BoothModel] = Field(..., description="Polling booths within the constituency")


@router.get(
    "/api/booth",
    response_model=ConstituencyResponse,
    summary="Look up polling booths for a constituency",
    description=(
        "Accepts a constituency ID (slug) or a partial name/city string. "
        "ID lookup is tried first; falls back to fuzzy search_keys matching. "
        "Returns 404 if no matching constituency is found."
    ),
)
async def booth(
    q: str = Query(..., description="Constituency ID or partial name/city"),
) -> ConstituencyResponse:
    result = await get_constituency_by_id(q) or await search_constituency(q)
    if not result:
        raise HTTPException(status_code=404, detail=f"No polling booth data found for '{q}'")
    return ConstituencyResponse(**result)
