from unittest.mock import MagicMock

from services.vertex_search import extract_citations


def test_extract_citations_returns_empty_when_no_candidates():
    response = MagicMock()
    response.candidates = None
    assert extract_citations(response) == []


def test_extract_citations_returns_empty_when_no_grounding_metadata():
    candidate = MagicMock()
    candidate.grounding_metadata = None
    response = MagicMock()
    response.candidates = [candidate]
    assert extract_citations(response) == []


def test_extract_citations_deduplicates_and_strips_gs_uris():
    def make_chunk(title, uri):
        ctx = MagicMock()
        ctx.title = title
        ctx.uri = uri
        chunk = MagicMock()
        chunk.retrieved_context = ctx
        return chunk

    meta = MagicMock()
    meta.grounding_chunks = [
        make_chunk("ECI Voter Guide", "https://eci.gov.in/guide.pdf"),
        make_chunk("Private Doc", "gs://bucket/private.pdf"),
        make_chunk("ECI Voter Guide", "https://eci.gov.in/guide.pdf"),  # duplicate
    ]
    candidate = MagicMock()
    candidate.grounding_metadata = meta
    response = MagicMock()
    response.candidates = [candidate]

    result = extract_citations(response)

    assert len(result) == 2
    assert result[0] == {"title": "ECI Voter Guide", "url": "https://eci.gov.in/guide.pdf"}
    assert result[1] == {"title": "Private Doc", "url": None}  # gs:// stripped
