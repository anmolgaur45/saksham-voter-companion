#!/bin/bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-saksham-voter-companion}"
REGION="asia-south1"

# Load local env for substitution values (never committed)
if [ -f apps/web/.env.local ]; then
  export $(grep -v '^#' apps/web/.env.local | xargs)
fi
if [ -f apps/backend/.env.local ]; then
  export $(grep -v '^#' apps/backend/.env.local | xargs)
fi

MAPS_KEY="${NEXT_PUBLIC_MAPS_API_KEY:-}"
DATASTORE_ID="${VERTEX_SEARCH_DATASTORE_ID:-}"
FIRESTORE_DB="${FIRESTORE_DATABASE:-saksham-voter-companion}"
COMMIT_SHA="$(git rev-parse HEAD)"

echo "project:    $PROJECT_ID"
echo "region:     $REGION"
echo "datastore:  $DATASTORE_ID"
echo "firestore:  $FIRESTORE_DB"
echo "commit:     $COMMIT_SHA"

gcloud builds submit \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --config=cloudbuild.yaml \
  --substitutions="COMMIT_SHA=${COMMIT_SHA},_MAPS_API_KEY=${MAPS_KEY},_VERTEX_SEARCH_DATASTORE_ID=${DATASTORE_ID},_FIRESTORE_DATABASE=${FIRESTORE_DB}" \
  .
