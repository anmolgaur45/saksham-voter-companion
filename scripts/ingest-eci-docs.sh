#!/bin/bash
# Phase 2: uploads PDFs from data/eci-docs/ to Vertex AI Search datastore
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-saksham-voter-companion}"
DATASTORE_ID="${VERTEX_SEARCH_DATASTORE_ID:?set VERTEX_SEARCH_DATASTORE_ID}"
REGION="global"
DOCS_DIR="$(dirname "$0")/../data/eci-docs"

echo "Ingesting ECI docs from $DOCS_DIR into datastore $DATASTORE_ID"
# Implementation added in Phase 2
