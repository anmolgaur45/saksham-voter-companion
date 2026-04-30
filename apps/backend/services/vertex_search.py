"""Vertex AI Search utilities: grounding tool construction and citation extraction."""

from typing import Any

from vertexai.generative_models import Tool, grounding


def build_search_tool(project_id: str, datastore_id: str) -> Tool:
    """Build a Vertex AI Search grounding tool for a given datastore.

    Args:
        project_id: GCP project ID that owns the datastore.
        datastore_id: Vertex AI Search datastore ID (not the full resource path).

    Returns:
        A Tool configured for retrieval-augmented generation over the datastore.
    """
    path = (
        f"projects/{project_id}/locations/global"
        f"/collections/default_collection/dataStores/{datastore_id}"
    )
    return Tool.from_retrieval(grounding.Retrieval(grounding.VertexAISearch(datastore=path)))


def extract_citations(response: Any) -> list[dict[str, str | None]]:
    """Extract unique, browser-accessible citations from a grounded Gemini response.

    Args:
        response: A GenerativeModel response object with optional grounding metadata.

    Returns:
        Deduplicated list of {"title": str | None, "url": str | None} dicts.
        gs:// URIs are stripped (private GCS paths not browser-accessible).
        Returns [] if no grounding metadata is present.
    """
    if not getattr(response, "candidates", None):
        return []
    meta = getattr(response.candidates[0], "grounding_metadata", None)
    if not meta:
        return []
    seen: set[str] = set()
    results: list[dict[str, str | None]] = []
    for chunk in getattr(meta, "grounding_chunks", []):
        ctx = getattr(chunk, "retrieved_context", None)
        if ctx:
            title: str | None = getattr(ctx, "title", None) or None
            url: str | None = getattr(ctx, "uri", None) or None
            # gs:// URIs are private GCS paths, not browser-accessible
            clean_url = url if (url and url.startswith("http")) else None
            key = title or clean_url or ""
            if key and key not in seen:
                seen.add(key)
                results.append({"title": title, "url": clean_url})
    return results
