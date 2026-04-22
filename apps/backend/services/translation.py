from __future__ import annotations

import asyncio
import html

from google.cloud import translate_v2 as translate

_client: translate.Client | None = None

_LANG_CODES = {"hi": "hi", "ta": "ta", "bn": "bn"}


def _get_client() -> translate.Client:
    global _client
    if _client is None:
        _client = translate.Client()
    return _client


async def translate_text(text: str, target_language: str) -> str:
    if target_language == "en" or not text:
        return text
    lang = _LANG_CODES.get(target_language, target_language)
    client = _get_client()
    result = await asyncio.get_event_loop().run_in_executor(
        None, lambda: client.translate(text, target_language=lang)
    )
    return html.unescape(result["translatedText"])


async def translate_to_english(text: str) -> str:
    if not text:
        return text
    client = _get_client()
    result = await asyncio.get_event_loop().run_in_executor(
        None, lambda: client.translate(text, target_language="en")
    )
    return html.unescape(result["translatedText"])
