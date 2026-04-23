#!/usr/bin/env python3
"""Eval harness: runs 30 Q&A pairs against the chat API, scores with Gemini."""
from __future__ import annotations

import json
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path

import requests
import vertexai
import yaml
from vertexai.generative_models import GenerationConfig, GenerativeModel

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "saksham-voter-companion")
VERTEX_LOCATION = os.getenv("VERTEX_LOCATION", "us-central1")
VERTEX_MODEL = os.getenv("VERTEX_MODEL", "gemini-2.5-flash")
PASS_THRESHOLD = 7

_JUDGE_PROMPT = """\
You are evaluating a response from an election-information assistant.

Question: {question}
Expected keywords (at least half should appear): {keywords}
Expected citation source (should be cited): {citation}
Actual response: {response}
Citations returned: {citations}

Score each axis from 0 to 10:
- relevance: does the response address the question?
- accuracy: is the content factually correct and grounded in ECI documents?
- citation_correctness: does the response cite the expected source (or a clearly related one)?

Respond with JSON only:
{{"relevance": <int>, "accuracy": <int>, "citation_correctness": <int>, "notes": "<one sentence>"}}"""


def ask(question: str, session_id: str) -> dict:
    resp = requests.post(
        f"{BACKEND_URL}/api/chat",
        json={"message": question, "session_id": session_id, "language": "en"},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()


def judge(question: str, keywords: list[str], citation: str, response: str, citations: list[dict]) -> dict:
    prompt = _JUDGE_PROMPT.format(
        question=question,
        keywords=", ".join(keywords),
        citation=citation,
        response=response,
        citations=", ".join(c.get("title", "") for c in citations if c.get("title")),
    )
    model = GenerativeModel(VERTEX_MODEL)
    result = model.generate_content(
        contents=prompt,
        generation_config=GenerationConfig(
            response_mime_type="application/json",
            temperature=0,
        ),
    )
    return json.loads(result.text)


def main() -> None:
    root = Path(__file__).parent
    data = yaml.safe_load((root / "ground_truth.yaml").read_text())
    questions = data["questions"]

    vertexai.init(project=GCP_PROJECT_ID, location=VERTEX_LOCATION)

    rows: list[dict] = []
    passed = 0

    print(f"Running {len(questions)} questions against {BACKEND_URL}\n")

    for q in questions:
        qid = q["id"]
        question = q["question"]
        keywords = q["expected_answer_keywords"]
        citation = q["expected_citation_source"]
        session_id = str(uuid.uuid4())

        print(f"  {qid}: {question[:60]}...", end=" ", flush=True)

        try:
            answer = ask(question, session_id)
            response_text = answer.get("response", "")
            citations = answer.get("citations", [])
            scores = judge(question, keywords, citation, response_text, citations)
        except Exception as exc:
            print(f"ERROR: {exc}")
            scores = {"relevance": 0, "accuracy": 0, "citation_correctness": 0, "notes": str(exc)}
            response_text = ""
            citations = []

        all_pass = all(scores.get(k, 0) >= PASS_THRESHOLD for k in ("relevance", "accuracy", "citation_correctness"))
        if all_pass:
            passed += 1
        status = "PASS" if all_pass else "FAIL"
        print(f"{status}  (R={scores.get('relevance')} A={scores.get('accuracy')} C={scores.get('citation_correctness')})")

        rows.append({
            "id": qid,
            "category": q["category"],
            "question": question,
            "response": response_text,
            "citations": [c.get("title", "") for c in citations if c.get("title")],
            "scores": scores,
            "pass": all_pass,
        })

    total = len(rows)
    pass_rate = round(passed / total * 100, 1)
    print(f"\nResult: {passed}/{total} passed ({pass_rate}%)")

    _write_report(rows, passed, total, pass_rate, root / "reports")


def _write_report(rows: list[dict], passed: int, total: int, pass_rate: float, reports_dir: Path) -> None:
    reports_dir.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = reports_dir / f"{ts}.md"

    lines = [
        "# Eval Report",
        f"\nGenerated: {datetime.now().isoformat(timespec='seconds')}",
        f"\n**Pass rate: {passed}/{total} ({pass_rate}%)**  (threshold: all axes ≥ {PASS_THRESHOLD})\n",
        "## Summary by category\n",
    ]

    categories: dict[str, list[dict]] = {}
    for r in rows:
        categories.setdefault(r["category"], []).append(r)

    for cat, items in sorted(categories.items()):
        cat_pass = sum(1 for i in items if i["pass"])
        lines.append(f"- **{cat}**: {cat_pass}/{len(items)}")

    lines.append("\n## Per-question results\n")
    lines.append("| ID | Category | R | A | C | Pass | Notes |")
    lines.append("|---|---|---|---|---|---|---|")

    for r in rows:
        s = r["scores"]
        mark = "✓" if r["pass"] else "✗"
        lines.append(
            f"| {r['id']} | {r['category']} "
            f"| {s.get('relevance', '-')} | {s.get('accuracy', '-')} | {s.get('citation_correctness', '-')} "
            f"| {mark} | {s.get('notes', '')} |"
        )

    path.write_text("\n".join(lines))
    print(f"\nReport written to {path}")


if __name__ == "__main__":
    sys.exit(main())
