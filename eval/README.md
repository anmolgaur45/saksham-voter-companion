# Eval Harness

Runs 30 Q&A pairs against the Knowledge Agent and scores with Gemini-as-judge.

Each question is scored on three axes (0–10): relevance, accuracy, citation correctness.
Pass threshold: all axes ≥ 7. Results are written to `eval/reports/<timestamp>.md`.

## Setup

```bash
pip install pyyaml requests google-cloud-aiplatform
```

## Run

```bash
# backend must be running on port 8000
python eval/run_eval.py
```

Override defaults:

```bash
BACKEND_URL=https://your-cloud-run-url python eval/run_eval.py
```
