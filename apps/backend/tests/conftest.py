from unittest.mock import AsyncMock, MagicMock, patch

import pytest_asyncio
from httpx import ASGITransport, AsyncClient


def _classifier_mock():
    """GenerativeModel mock returning greeting intent JSON for both sync and async calls."""
    mock_response = MagicMock(text='{"intent": "greeting"}')
    m = MagicMock()
    m.generate_content.return_value = mock_response
    m.generate_content_async = AsyncMock(return_value=mock_response)
    return m


def _bq_client_mock():
    """BigQuery client mock that always returns an empty result set."""
    m = MagicMock()
    m.query.return_value.result.return_value = iter([])
    return m


@pytest_asyncio.fixture
async def client():
    gm = _classifier_mock()
    bq = _bq_client_mock()

    with (
        patch("vertexai.init"),
        patch("agents.orchestrator.GenerativeModel", return_value=gm),
        patch("agents.knowledge.GenerativeModel", return_value=gm),
        patch("agents.knowledge.build_search_tool", return_value=MagicMock()),
        patch("agents.locator.GenerativeModel", return_value=gm),
        patch("agents.verifier.GenerativeModel", return_value=gm),
        patch("agents.verifier.build_search_tool", return_value=MagicMock()),
        patch("agents.journey.GenerativeModel", return_value=gm),
        patch("services.bigquery._get_client", return_value=bq),
        patch("agents.orchestrator.get_session", new_callable=AsyncMock, return_value={}),
        patch(
            "api.booth.get_constituency_by_id",
            new_callable=AsyncMock,
            return_value=None,
        ),
        patch(
            "api.booth.search_constituency",
            new_callable=AsyncMock,
            return_value=None,
        ),
    ):
        import api.chat

        api.chat._orchestrator = None  # reset lazy singleton between fixture uses

        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            yield c
