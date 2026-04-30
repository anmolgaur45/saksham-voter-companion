"""Firestore service for constituency lookup and anonymous session management."""

from __future__ import annotations

from typing import Any

from google.cloud import firestore

from core.config import settings

_client: firestore.AsyncClient | None = None


def get_client() -> firestore.AsyncClient:
    global _client
    if _client is None:
        _client = firestore.AsyncClient(database=settings.firestore_database)
    return _client


async def search_constituency(query: str) -> dict[str, Any] | None:
    """Search constituencies by partial name or search key match.

    Args:
        query: User-supplied location string (city name, constituency name, etc.).

    Returns:
        Firestore constituency document dict if a match is found, else None.
    """
    client = get_client()
    q = query.lower().strip()
    async for doc in client.collection("constituencies").stream():
        data = doc.to_dict()
        if data is not None and any(q in key for key in data.get("search_keys", [])):
            return data
    return None


async def get_constituency_by_id(constituency_id: str) -> dict[str, Any] | None:
    """Fetch a constituency document by its Firestore document ID.

    Args:
        constituency_id: The exact Firestore document ID (slug) for the constituency.

    Returns:
        Constituency document dict if found, else None.
    """
    client = get_client()
    doc = await client.collection("constituencies").document(constituency_id).get()
    return doc.to_dict() if doc.exists else None


async def get_session(session_id: str) -> dict[str, Any]:
    """Retrieve a user session document, returning an empty dict if it does not exist.

    Args:
        session_id: Browser-generated UUID identifying the anonymous session.

    Returns:
        Session document dict, or {} if the session has not been created yet.
    """
    client = get_client()
    doc = await client.collection("sessions").document(session_id).get()
    return doc.to_dict() or {}


async def update_session(session_id: str, data: dict[str, Any]) -> None:
    """Merge-update a session document, creating it if it does not exist.

    Args:
        session_id: Browser-generated UUID identifying the anonymous session.
        data: Partial document to merge into the session (existing keys are preserved).
    """
    client = get_client()
    await client.collection("sessions").document(session_id).set(data, merge=True)
