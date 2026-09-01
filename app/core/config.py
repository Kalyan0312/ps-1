import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Resolve root directory path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(ROOT_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        enable_decoding=False
    )

    # Core Application
    PROJECT_NAME: str = "Cooperative Gig Platform"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "cooperative-gig-dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Server
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, list):
            return v

        if isinstance(v, str):
            v = v.strip()

            if v.startswith("["):
                return json.loads(v)

            return [i.strip() for i in v.split(",") if i.strip()]

        return ["*"]

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "gig_user"
    POSTGRES_PASSWORD: str = "gig_password"
    POSTGRES_DB: str = "cooperative_gig"

    DATABASE_URL: str = "postgresql+asyncpg://gig_user:gig_password@localhost:5432/cooperative_gig"
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://gig_user:gig_password@localhost:5432/cooperative_gig"

    # External Integrations
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    GOOGLE_CLOUD_PROJECT: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    FIREBASE_CREDENTIALS_PATH: str = ""
    FORECASTING_MODEL_TYPE: str = "baseline"
    WS_HEARTBEAT_INTERVAL: int = 30


settings = Settings()
