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
    """Translate text to the given target language using Cloud Translation.

    Args:
        text: Source text to translate. Returned unchanged if empty.
        target_language: BCP-47 language code (e.g. "hi", "ta", "bn").
            Returned unchanged if "en".

    Returns:
        Translated text with HTML entities unescaped.
    """
    if target_language == "en" or not text:
        return text
    lang = _LANG_CODES.get(target_language, target_language)
    client = _get_client()
    result = await asyncio.get_event_loop().run_in_executor(
        None, lambda: client.translate(text, target_language=lang)
    )
    return html.unescape(result["translatedText"])


async def translate_to_english(text: str) -> str:
    """Translate arbitrary text to English for downstream English-only agents.

    Args:
        text: Source text in any language. Returned unchanged if empty.

    Returns:
        English translation with HTML entities unescaped.
    """
    if not text:
        return text
    client = _get_client()
    result = await asyncio.get_event_loop().run_in_executor(
        None, lambda: client.translate(text, target_language="en")
    )
    return html.unescape(result["translatedText"])
