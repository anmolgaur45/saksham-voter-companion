# Deployment

Two Cloud Run services: `saksham-backend` (internal, no public access) and `saksham-web` (public). Both are deployed via Cloud Build from the repo root.

---

## Prerequisites

### APIs

Enable these in the GCP project before the first deploy:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  firestore.googleapis.com \
  translate.googleapis.com \
  texttospeech.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com \
  --project=saksham-voter-companion
```

### Artifact Registry

Create the Docker repository once:

```bash
gcloud artifacts repositories create saksham \
  --repository-format=docker \
  --location=asia-south1 \
  --project=saksham-voter-companion
```

### Service account

Create the runtime service account and grant roles:

```bash
gcloud iam service-accounts create saksham-runtime \
  --project=saksham-voter-companion

for role in \
  roles/aiplatform.user \
  roles/datastore.user \
  roles/secretmanager.secretAccessor \
  roles/logging.logWriter \
  roles/cloudtranslate.user \
  roles/texttospeech.user; do
  gcloud projects add-iam-policy-binding saksham-voter-companion \
    --member="serviceAccount:saksham-runtime@saksham-voter-companion.iam.gserviceaccount.com" \
    --role="$role"
done
```

Grant Cloud Build the ability to deploy Cloud Run and act as the runtime SA:

```bash
PROJECT_NUMBER=$(gcloud projects describe saksham-voter-companion --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding saksham-voter-companion \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/run.admin"

gcloud iam service-accounts add-iam-policy-binding \
  saksham-runtime@saksham-voter-companion.iam.gserviceaccount.com \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/iam.serviceAccountUser"
```

### IAM: web service invoking the backend

The web service's runtime SA needs `roles/run.invoker` on the backend service. Run this once after the backend service exists (i.e., after the first deploy):

```bash
gcloud run services add-iam-policy-binding saksham-backend \
  --region=asia-south1 \
  --member="serviceAccount:saksham-runtime@saksham-voter-companion.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --project=saksham-voter-companion
```

---

## Deploy

```bash
export GCP_PROJECT_ID=saksham-voter-companion
bash scripts/deploy.sh
```

`deploy.sh` calls `gcloud builds submit`, which runs `cloudbuild.yaml`. The build:

1. Builds and pushes the backend Docker image to Artifact Registry.
2. Deploys `saksham-backend` with `--no-allow-unauthenticated`.
3. Reads the deployed backend URL and writes it to `/workspace/backend_url`.
4. Builds and pushes the web Docker image.
5. Deploys `saksham-web` with `--allow-unauthenticated`, injecting `BACKEND_URL` from step 3.

On first deploy, the backend service won't exist yet — that's fine, Cloud Run creates it in step 2.

---

## Local development

Backend:

```bash
cd apps/backend
uv sync
uv run uvicorn main:app --reload
```

Frontend (separate terminal):

```bash
cd apps/web
npm install
npm run dev
```

Copy `.env.example` to `apps/backend/.env.local` and `apps/web/.env.local` and fill in values. Backend defaults to port 8000, web to 3000. With `BACKEND_URL=http://localhost:8000`, the frontend skips ID token auth and calls the backend directly.

---

## Environment variables

See `.env.example` at the repo root for all required names and placeholder values.

For production, backend env vars are injected via `--set-env-vars` in `cloudbuild.yaml`. Secrets (API keys, service account keys if any) should be stored in Secret Manager and mounted via `--set-secrets`.
