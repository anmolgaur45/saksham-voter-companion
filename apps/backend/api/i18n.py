import asyncio

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.translation import translate_text

router = APIRouter()


class TranslateRequest(BaseModel):
    texts: list[str] = Field(..., description="Strings to translate, returned in the same order")
    lang: str = Field(..., description="BCP-47 target language code (hi, ta, bn)")


class TranslateResponse(BaseModel):
    translated: list[str] = Field(..., description="Translated strings, same order as input")


@router.post(
    "/api/translate",
    response_model=TranslateResponse,
    summary="Batch translate strings",
    description=(
        "Translates an array of strings to the requested language using Cloud Translation. "
        "All strings are translated concurrently. Returns input unchanged for lang='en'."
    ),
)
async def translate_batch(body: TranslateRequest) -> TranslateResponse:
    """Translate a list of strings to the target language.

    Args:
        body: Request containing texts and target language code.

    Returns:
        TranslateResponse with translated strings in input order.
    """
    if body.lang == "en" or not body.texts:
        return TranslateResponse(translated=body.texts)
    results = list(
        await asyncio.gather(*[translate_text(t, body.lang) for t in body.texts])
    )
    return TranslateResponse(translated=results)
