from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Supabase transaction-pooler (pgbouncer) does not support reused prepared
# statements across pooled connections, which asyncpg caches by default. Disable
# that cache to avoid "prepared statement already exists" errors.
_db_url = settings.SQLALCHEMY_DATABASE_URL
if "prepared_statement_cache_size=" not in _db_url:
    sep = "&" if "?" in _db_url else "?"
    _db_url = f"{_db_url}{sep}prepared_statement_cache_size=0"

_is_sqlite = _db_url.startswith("sqlite") or _db_url.startswith("sqlite+")

engine = create_async_engine(
    _db_url,
    echo=False,
    future=True,
    # pool_size / pool_recycle / server_settings are asyncpg (PostgreSQL)
    # concerns. SQLite uses NullPool and rejects these kwargs, so only pass
    # them for a PostgreSQL backend.
    **(
        {}
        if _is_sqlite
        else {
            "pool_pre_ping": True,
            "connect_args": {"server_settings": {"jit": "off"}},
            "pool_size": 5,
            "max_overflow": 10,
            "pool_recycle": 1800,
        }
    )
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
