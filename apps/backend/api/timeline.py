import asyncio
import json
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.translation import translate_text

router = APIRouter()

_DATA_PATH = Path(__file__).parent.parent / "data" / "timeline_phases.json"

# Populated on first request per language; "en" is never stored (loaded directly)
_PHASE_CACHE: dict[str, list["TimelinePhase"]] = {}


class TimelinePhase(BaseModel):
    id: str = Field(..., description="URL-safe slug identifier for the phase")
    title: str = Field(..., description="Display name of the election phase")
    short_description: str = Field(..., description="One-sentence summary of the phase")
    duration: str | None = Field(None, description="Typical duration (e.g. '7 days', '48 hours')")
    what_happens: str = Field(..., description="Plain-language explanation of what occurs in this phase")
    what_citizens_can_do: list[str] = Field(..., description="Actions a citizen can take during this phase")
    what_is_restricted: list[str] = Field(..., description="Activities prohibited during this phase")
    icon_name: str = Field(..., description="Lucide icon name used for UI rendering")
    source_citation: str | None = Field(None, description="ECI source document and page reference")


@lru_cache(maxsize=1)
def _load_phases() -> list[TimelinePhase]:
    """Load and cache timeline phases from the seed JSON file.

    Returns:
        Ordered list of TimelinePhase objects representing the Indian general election cycle.
    """
    with _DATA_PATH.open(encoding="utf-8") as f:
        return [TimelinePhase(**p) for p in json.load(f)]


async def _translate_phase(phase: TimelinePhase, lang: str) -> TimelinePhase:
    """Translate all user-visible text fields of a phase concurrently.

    Args:
        phase: Source phase in English.
        lang: BCP-47 target language code.

    Returns:
        New TimelinePhase with translated text; id, icon_name, source_citation unchanged.
    """
    all_texts = [
        phase.title,
        phase.short_description,
        phase.duration or "",
        phase.what_happens,
        *phase.what_citizens_can_do,
        *phase.what_is_restricted,
    ]
    results = list(await asyncio.gather(*[translate_text(t, lang) for t in all_texts]))
    n_do = len(phase.what_citizens_can_do)
    title = results[0]
    short_desc = results[1]
    duration = results[2] if phase.duration else None
    what_happens = results[3]
    citizen_do = results[4 : 4 + n_do]
    restricted = results[4 + n_do :]
    return TimelinePhase(
        id=phase.id,
        title=title,
        short_description=short_desc,
        duration=duration,
        what_happens=what_happens,
        what_citizens_can_do=citizen_do,
        what_is_restricted=restricted,
        icon_name=phase.icon_name,
        source_citation=phase.source_citation,
    )


async def _get_phases(lang: str) -> list[TimelinePhase]:
    """Return phases in the requested language, using an in-memory cache.

    Args:
        lang: BCP-47 language code. "en" returns the raw JSON phases.

    Returns:
        Translated (or English) phase list.
    """
    if lang == "en":
        return _load_phases()
    if lang not in _PHASE_CACHE:
        phases = _load_phases()
        _PHASE_CACHE[lang] = list(
            await asyncio.gather(*[_translate_phase(p, lang) for p in phases])
        )
    return _PHASE_CACHE[lang]


@router.get(
    "/api/timeline",
    response_model=list[TimelinePhase],
    summary="Get all election timeline phases",
    description=(
        "Returns the ordered list of phases in an Indian general election cycle. "
        "Pass ?lang= to receive translated content (hi, ta, bn). "
        "Translated results are cached in memory after the first request per language."
    ),
)
async def get_timeline(lang: str = "en") -> list[TimelinePhase]:
    return await _get_phases(lang)


@router.get(
    "/api/timeline/{phase_id}",
    response_model=TimelinePhase,
    summary="Get a single election phase by ID",
    description="Returns full detail for a specific election phase identified by its slug.",
)
async def get_phase(phase_id: str, lang: str = "en") -> TimelinePhase:
    for phase in await _get_phases(lang):
        if phase.id == phase_id:
            return phase
    raise HTTPException(status_code=404, detail=f"Phase '{phase_id}' not found")
