from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient


def _classifier_mock():
    """GenerativeModel mock whose generate_content returns greeting intent JSON."""
    m = MagicMock()
    m.generate_content.return_value = MagicMock(text='{"intent": "greeting"}')
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
        patch("agents.locator.GenerativeModel", return_value=gm),
        patch("agents.verifier.GenerativeModel", return_value=gm),
        patch("agents.journey.GenerativeModel", return_value=gm),
        patch("services.bigquery._get_client", return_value=bq),
        patch("services.firestore.get_session", new_callable=AsyncMock, return_value={}),
        patch(
            "services.firestore.get_constituency_by_id",
            new_callable=AsyncMock,
            return_value=None,
        ),
        patch(
            "services.firestore.search_constituency",
            new_callable=AsyncMock,
            return_value=None,
        ),
    ):
        import api.chat

        api.chat._orchestrator = None  # reset lazy singleton between fixture uses

        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            yield c
