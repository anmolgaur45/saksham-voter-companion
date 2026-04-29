"""Constituency election history endpoints backed by BigQuery."""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

import services.bigquery as bq_service

router = APIRouter()


class CandidateResult(BaseModel):
    candidate: str
    party: str
    votes: int
    vote_share: float
    is_winner: bool


class ElectionYear(BaseModel):
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


class ConstituencyHistory(BaseModel):
    constituency: str
    elections: list[ElectionYear]


def _to_response(pc_name: str, rows: list[bq_service.ElectionYear]) -> ConstituencyHistory:
    return ConstituencyHistory(
        constituency=pc_name,
        elections=[
            ElectionYear(
                year=e.year,
                winner=e.winner,
                party=e.party,
                votes=e.votes,
                vote_share=e.vote_share,
                margin=e.margin,
                margin_pct=e.margin_pct,
                turnout=e.turnout,
                total_candidates=e.total_candidates,
                top_candidates=[
                    CandidateResult(
                        candidate=c.candidate,
                        party=c.party,
                        votes=c.votes,
                        vote_share=c.vote_share,
                        is_winner=c.is_winner,
                    )
                    for c in e.top_candidates
                ],
            )
            for e in rows
        ],
    )


@router.get(
    "/api/constituency/search",
    response_model=list[str],
    summary="Search constituency names",
    description="Returns constituency names containing the query string (case-insensitive). Cached after first call.",
)
async def search_constituencies(
    q: str = Query(default="", min_length=1, max_length=200),
) -> list[str]:
    return await bq_service.search_constituencies(q)


@router.get(
    "/api/constituency/{pc_name}/history",
    response_model=ConstituencyHistory,
    summary="Get election history for a Lok Sabha constituency",
    description=(
        "Returns winner and top candidates for general elections (2004, 2009, 2014, 2019) "
        "for the given constituency. Name match is case-insensitive."
    ),
)
async def get_history(pc_name: str) -> ConstituencyHistory:
    results = await bq_service.get_constituency_history(pc_name)
    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"No election data found for constituency '{pc_name}'. "
            "Check spelling — use the official ECI constituency name.",
        )
    return _to_response(pc_name, results)
