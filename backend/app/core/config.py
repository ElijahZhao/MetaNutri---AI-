from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "MetaNutri"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-Powered Precision Nutrition Metabolic Digital Twin Platform"

    DATABASE_URL: str = "sqlite+aiosqlite:///./metanutri.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
