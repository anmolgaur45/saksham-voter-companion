#!/bin/bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-saksham-voter-companion}"
REGION="asia-south1"

echo "project: $PROJECT_ID"
gcloud builds submit \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --config=cloudbuild.yaml \
  .
