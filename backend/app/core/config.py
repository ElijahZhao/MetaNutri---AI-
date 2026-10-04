from pydantic_settings import BaseSettings
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

    # Comma-separated list of allowed browser origins (no trailing slash), e.g.
    # "https://meta-nutri-ai.vercel.app,http://localhost:3000"
    CORS_ORIGINS: str = ""

    @property
    def cors_origins(self) -> list:
        raw = self.CORS_ORIGINS.strip()
        if not raw:
            return []
        return [o.strip() for o in raw.split(",") if o.strip()]

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

    # Access tokens are short-lived and delivered as an httpOnly cookie; the
    # longer-lived refresh token (also httpOnly) silently mints new access
    # tokens. Keep ACCESS_TOKEN_EXPIRE_MINUTES small in production.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 14

    # Auth cookies. Secure must stay True in production (HTTPS); set
    # COOKIE_SECURE=false only for local http development.
    COOKIE_SECURE: bool = True
    # "lax" works because the frontend proxies /api on its own origin, so the
    # cookie is first-party. Use "none" only if you must call the API cross-site.
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: str = ""

    # Password-reset delivery. When False (the secure default) the API never
    # returns the reset token in the /forgot-password response, so knowing an
    # email address is not enough to reset that account. Reset then requires a
    # real email channel to deliver the token. Set True only for local
    # development where no mail service is configured.
    PASSWORD_RESET_RETURN_TOKEN: bool = False

    # Site-wide rate limiting (applied to every /api route by middleware).
    # Auth endpoints keep a stricter per-username limit in app/api/auth.py.
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 120
    RATE_LIMIT_WRITE_REQUESTS: int = 40
    RATE_LIMIT_WINDOW_SECONDS: int = 60

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

if settings.COOKIE_SAMESITE.strip().lower() == "none":
    # SameSite=None removes the only CSRF defence this project has: there is no
    # CSRF token and no Origin/Referer check (see docs/AUDITS.md §3).
    # The frontend proxies /api on its own origin, so "lax" always works here;
    # "none" is only needed for a genuinely cross-site API, which this project
    # does not use. Refuse to start unless the operator explicitly accepts the
    # risk and has added a compensating control.
    if os.getenv("ALLOW_INSECURE_SAMESITE_NONE", "").lower() != "1":
        raise RuntimeError(
            "COOKIE_SAMESITE=none disables the project's only CSRF protection "
            "and no compensating control (token / Origin check) exists. Keep it "
            "at 'lax', or set ALLOW_INSECURE_SAMESITE_NONE=1 once you have added "
            "one."
        )
