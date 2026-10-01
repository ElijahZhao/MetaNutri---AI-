from pydantic_settings import BaseSettings
from typing import Optional
import logging
import os

logger = logging.getLogger("metanutri.config")

_DEFAULT_SECRET_KEY = "super-secret-key-change-in-production"


class Settings(BaseSettings):
    PROJECT_NAME: str = "MetaNutri"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-Powered Precision Nutrition Metabolic Digital Twin Platform"

    DATABASE_URL: str = "sqlite+aiosqlite:///./metanutri.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url
    SECRET_KEY: str = _DEFAULT_SECRET_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

if settings.SECRET_KEY == _DEFAULT_SECRET_KEY:
    logger.warning(
        "SECRET_KEY is set to the public default value. "
        "Set a strong, unique SECRET_KEY environment variable in production "
        "to prevent token forgery."
    )
    # Hard-fail in a real production deployment unless explicitly bypassed.
    # Allows local dev/docker builds marked with ALLOW_DEFAULT_SECRET_KEY=1.
    if os.getenv("ALLOW_DEFAULT_SECRET_KEY", "").lower() != "1":
        primary_env = os.environ.get("RENDER", "").lower()
        if primary_env in ("true", "1"):
            raise RuntimeError(
                "Refusing to start in production with the default SECRET_KEY. "
                "Set a strong SECRET_KEY environment variable on Render."
            )
