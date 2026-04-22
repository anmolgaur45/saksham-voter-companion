from __future__ import annotations

from google.cloud import firestore

from core.config import settings

_client: firestore.AsyncClient | None = None


def get_client() -> firestore.AsyncClient:
    global _client
    if _client is None:
        _client = firestore.AsyncClient(database=settings.firestore_database)
    return _client


async def search_constituency(query: str) -> dict | None:
    client = get_client()
    q = query.lower().strip()
    async for doc in client.collection("constituencies").stream():
        data = doc.to_dict()
        if any(q in key for key in data.get("search_keys", [])):
            return data
    return None


async def get_constituency_by_id(constituency_id: str) -> dict | None:
    client = get_client()
    doc = await client.collection("constituencies").document(constituency_id).get()
    return doc.to_dict() if doc.exists else None


async def get_session(session_id: str) -> dict:
    client = get_client()
    doc = await client.collection("sessions").document(session_id).get()
    return doc.to_dict() if doc.exists else {}


async def update_session(session_id: str, data: dict) -> None:
    client = get_client()
    await client.collection("sessions").document(session_id).set(data, merge=True)
