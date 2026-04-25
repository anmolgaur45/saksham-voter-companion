from __future__ import annotations

import asyncio
import base64

from google.cloud import texttospeech

_client: texttospeech.TextToSpeechClient | None = None

_VOICE_MAP = {
    "hi": ("hi-IN", "hi-IN-Neural2-A"),
    "ta": ("ta-IN", "ta-IN-Neural2-A"),
    "bn": ("bn-IN", "bn-IN-Wavenet-A"),
}


def _get_client() -> texttospeech.TextToSpeechClient:
    global _client
    if _client is None:
        _client = texttospeech.TextToSpeechClient()
    return _client


async def synthesize_speech(text: str, language: str = "hi") -> str:
    """Synthesize text to MP3 audio using Cloud Text-to-Speech.

    Args:
        text: Text to synthesize. Should be under ~5000 characters.
        language: BCP-47 language code. Supported: "hi", "ta", "bn".
            Unrecognised codes fall back to Hindi.

    Returns:
        Base64-encoded MP3 audio string suitable for use in a data URI or
        direct Audio element playback after decoding.
    """
    lang_code, voice_name = _VOICE_MAP.get(language, ("hi-IN", "hi-IN-Neural2-A"))
    client = _get_client()

    def _synthesize() -> str:
        response = client.synthesize_speech(
            input=texttospeech.SynthesisInput(text=text),
            voice=texttospeech.VoiceSelectionParams(
                language_code=lang_code,
                name=voice_name,
            ),
            audio_config=texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3),
        )
        return base64.b64encode(response.audio_content).decode("utf-8")

    return await asyncio.get_running_loop().run_in_executor(None, _synthesize)
