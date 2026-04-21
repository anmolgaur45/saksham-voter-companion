# Saksham

Multi-agent assistant for Indian voter education. Answers questions about the election process using Election Commission of India sources, with citations on every response.

Built on Google Cloud: Vertex AI (Gemini 2.5 Flash), Vertex AI Search, ADK, Cloud Run, Firestore, Cloud Translation, Cloud Text-to-Speech, Maps Platform.

## Stack

- **Backend:** Python 3.12, FastAPI, Google ADK, Vertex AI Search
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui
- **Infra:** Cloud Run (two services), Firestore (asia-south1), Secret Manager

## Local development

```bash
# backend
cd apps/backend
uv sync
uv run uvicorn main:app --reload

# frontend (separate terminal)
cd apps/web
npm install
npm run dev
```

Copy `.env.example` to `apps/backend/.env.local` and `apps/web/.env.local` and fill in values. Backend defaults to port 8000, web to 3000.

## Deploy

```bash
bash scripts/deploy.sh
```

Requires `gcloud` CLI authenticated and `GCP_PROJECT_ID` set. See `docs/deployment.md` for IAM setup and first-deploy steps.

## Google Cloud services

| Service | Role |
|---|---|
| Vertex AI (Gemini 2.5 Flash) | LLM for all agents |
| Vertex AI Search | Grounded RAG over ECI documents |
| Google ADK | Multi-agent orchestration |
| Cloud Run | Hosts backend and web services |
| Maps Platform | Polling booth lookup and map rendering |
| Cloud Translation | Hindi, Tamil, Bengali, Telugu responses |
| Cloud Text-to-Speech | Hindi audio playback |
| Firestore | Session state and constituency data |
| Secret Manager | Credentials |
| Cloud Logging | Structured JSON logs |

## Data sources

ECI documents ingested into Vertex AI Search are listed in `data/eci-docs/SOURCES.md`.
