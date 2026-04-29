"""BigQuery service for constituency election history queries from the results_combined table."""

import asyncio
from dataclasses import dataclass

from google.cloud import bigquery

from core.config import settings

_client: bigquery.Client | None = None


def _get_client() -> bigquery.Client:
    global _client
    if _client is None:
        _client = bigquery.Client(project=settings.gcp_project_id)
    return _client


@dataclass
class CandidateResult:
    candidate: str
    party: str
    votes: int
    vote_share: float
    is_winner: bool


@dataclass
class ElectionYear:
    year: int
    winner: str
    party: str
    votes: int
    vote_share: float
    margin: int
    margin_pct: float
    turnout: float
    total_candidates: int
    top_candidates: list[CandidateResult]


_constituency_names: list[str] | None = None


def _fetch_constituency_names() -> list[str]:
    client = _get_client()
    dataset = f"{settings.gcp_project_id}.{settings.bigquery_dataset}"
    query = f"""
    SELECT DISTINCT Constituency_Name
    FROM `{dataset}.results_combined`
    WHERE Year IN (2004, 2009, 2014, 2019)
    ORDER BY Constituency_Name
    """
    rows = list(client.query(query).result())
    return [row.Constituency_Name for row in rows]


async def get_all_constituency_names() -> list[str]:
    """Return sorted list of all distinct constituency names. Cached after first call."""
    global _constituency_names
    if _constituency_names is not None:
        return _constituency_names
    names = await asyncio.get_running_loop().run_in_executor(None, _fetch_constituency_names)
    _constituency_names = names
    return _constituency_names


async def search_constituencies(q: str, limit: int = 20) -> list[str]:
    """Return constituency names containing q (case-insensitive), up to limit results."""
    q_upper = q.upper().strip()
    if not q_upper:
        return []
    names = await get_all_constituency_names()
    matches = [n for n in names if q_upper in n.upper()]
    return matches[:limit]


def _fetch_constituency_history(pc_name: str) -> list[ElectionYear]:
    client = _get_client()
    dataset = f"{settings.gcp_project_id}.{settings.bigquery_dataset}"

    query = f"""
    WITH general_elections AS (
        SELECT *
        FROM `{dataset}.results_combined`
        WHERE Year IN (2004, 2009, 2014, 2019)
          AND UPPER(Constituency_Name) = UPPER(@pc_name)
    )
    SELECT
        Year,
        Candidate,
        Party,
        Votes,
        Vote_Share_Percentage,
        Position,
        Margin,
        Margin_Percentage,
        Turnout_Percentage,
        N_Cand
    FROM general_elections
    ORDER BY Year, Position
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("pc_name", "STRING", pc_name)]
    )
    rows = list(client.query(query, job_config=job_config).result())

    years: dict[int, ElectionYear] = {}
    for row in rows:
        year = int(row.Year)
        if year not in years:
            years[year] = ElectionYear(
                year=year,
                winner="",
                party="",
                votes=0,
                vote_share=0.0,
                margin=0,
                margin_pct=0.0,
                turnout=float(row.Turnout_Percentage or 0),
                total_candidates=int(row.N_Cand or 0),
                top_candidates=[],
            )
        entry = years[year]
        is_winner = int(row.Position) == 1
        if is_winner:
            entry.winner = row.Candidate
            entry.party = row.Party
            entry.votes = int(row.Votes or 0)
            entry.vote_share = float(row.Vote_Share_Percentage or 0)
            entry.margin = int(row.Margin or 0)
            entry.margin_pct = float(row.Margin_Percentage or 0)
        if len(entry.top_candidates) < 5:
            entry.top_candidates.append(
                CandidateResult(
                    candidate=row.Candidate,
                    party=row.Party,
                    votes=int(row.Votes or 0),
                    vote_share=float(row.Vote_Share_Percentage or 0),
                    is_winner=is_winner,
                )
            )

    return sorted(years.values(), key=lambda e: e.year)


async def get_constituency_history(pc_name: str) -> list[ElectionYear]:
    """Return election results for a constituency across general elections 2004–2019.

    Queries winners and top 5 candidates per election year. Constituency name match is
    case-insensitive.
    """
    return await asyncio.get_running_loop().run_in_executor(
        None, _fetch_constituency_history, pc_name
    )
