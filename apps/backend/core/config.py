"""Application settings loaded from environment variables and .env.local."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gcp_project_id: str = Field("", description="GCP project ID for all Google Cloud services")
    gcp_region: str = Field("asia-south1", description="GCP region for Cloud Run and Firestore")
    vertex_location: str = Field("us-central1", description="Vertex AI endpoint region")
    vertex_model: str = Field("gemini-2.5-flash", description="Pinned Gemini model string")
    vertex_search_datastore_id: str = Field(
        "", description="Vertex AI Search datastore ID for ECI documents"
    )
    firestore_database: str = Field(
        "saksham-voter-companion", description="Firestore database name"
    )
    log_level: str = Field(
        "INFO", description="Structlog minimum level (DEBUG, INFO, WARNING, ERROR)"
    )
    bigquery_dataset: str = Field(
        "election_history", description="BigQuery dataset for constituency election history"
    )
    internal_api_key: str = Field("", description="Shared secret for API key auth fallback")

    model_config = SettingsConfigDict(env_file=".env.local", extra="ignore")


settings = Settings()
