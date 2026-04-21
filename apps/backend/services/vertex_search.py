from vertexai.generative_models import Tool, grounding


def build_search_tool(project_id: str, datastore_id: str) -> Tool:
    path = (
        f"projects/{project_id}/locations/global"
        f"/collections/default_collection/dataStores/{datastore_id}"
    )
    return Tool.from_retrieval(
        grounding.Retrieval(grounding.VertexAISearch(datastore=path))
    )


def extract_citations(response: object) -> list[dict[str, str | None]]:
    if not getattr(response, "candidates", None):
        return []
    meta = getattr(response.candidates[0], "grounding_metadata", None)  # type: ignore[union-attr]
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
