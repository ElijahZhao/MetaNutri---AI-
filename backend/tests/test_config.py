"""Unit tests for app.core.config.Settings derived properties."""

from app.core.config import Settings


def test_cors_origins_splits_and_trims():
    settings = Settings(CORS_ORIGINS=" https://a.example , http://localhost:3000 ,")
    assert settings.cors_origins == ["https://a.example", "http://localhost:3000"]


def test_cors_origins_empty_by_default():
    settings = Settings(CORS_ORIGINS="")
    assert settings.cors_origins == []


def test_postgres_url_is_rewritten_to_asyncpg():
    settings = Settings(DATABASE_URL="postgresql://u:p@h:5432/db")
    assert settings.SQLALCHEMY_DATABASE_URL == "postgresql+asyncpg://u:p@h:5432/db"


def test_postgres_scheme_alias_is_rewritten():
    settings = Settings(DATABASE_URL="postgres://u:p@h:5432/db")
    assert settings.SQLALCHEMY_DATABASE_URL == "postgresql+asyncpg://u:p@h:5432/db"


def test_sqlite_url_is_left_alone():
    settings = Settings(DATABASE_URL="sqlite+aiosqlite:///./x.db")
    assert settings.SQLALCHEMY_DATABASE_URL == "sqlite+aiosqlite:///./x.db"
