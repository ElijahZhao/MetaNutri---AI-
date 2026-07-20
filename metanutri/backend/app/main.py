from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import engine, Base
from app.api import auth, users, food, genomic, microbiome, metabolomics, recommendation, predict, datasets


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
