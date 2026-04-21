from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gcp_project_id: str = ""
    gcp_region: str = "asia-south1"
    vertex_model: str = "gemini-2.5-flash"
    vertex_search_datastore_id: str = ""
    firestore_database: str = "saksham-voter-companion"
    log_level: str = "INFO"
    internal_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env.local", extra="ignore")


settings = Settings()
