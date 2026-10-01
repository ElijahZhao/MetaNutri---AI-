from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.db.session import engine, Base
from app.api import auth, users, food, genomic, microbiome, metabolomics, recommendation, predict, datasets, import_export, nutrition_alerts

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.warning(f"Database initialization failed (app will start without DB): {e}")
    yield
    try:
        await engine.dispose()
    except Exception:
        pass


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

_DEFAULT_CORS_ORIGINS = [
    "https://meta-nutri-ai.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or _DEFAULT_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(food.router)
app.include_router(genomic.router)
app.include_router(microbiome.router)
app.include_router(recommendation.router)
app.include_router(predict.router)
app.include_router(metabolomics.router)
app.include_router(datasets.router)
app.include_router(import_export.router)
app.include_router(nutrition_alerts.router)


@app.get("/health")
async def health_check():
    db_status = "not_tested"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error ({type(e).__name__}): {str(e)[:150]}"
    return {"status": "ok", "service": settings.PROJECT_NAME, "database": db_status}
