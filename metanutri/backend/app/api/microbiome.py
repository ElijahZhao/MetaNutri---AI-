from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
import math

from app.db.session import get_db
from app.models.microbiome import MicrobiomeData
from app.schemas.microbiome import MicrobiomeDataCreate, MicrobiomeDataResponse, MicrobiomeAnalysisResponse
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/api/microbiome", tags=["microbiome"])


@router.post("/upload", response_model=List[MicrobiomeDataResponse], status_code=201)
async def upload_microbiome(
    data_list: List[MicrobiomeDataCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    entries = []
    for item in data_list:
        entry = MicrobiomeData(user_id=current_user.id, **item.model_dump())
        db.add(entry)
        entries.append(entry)
    await db.commit()
    for entry in entries:
        await db.refresh(entry)
    return entries


@router.get("/user", response_model=List[MicrobiomeDataResponse])
async def get_user_microbiome(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(MicrobiomeData).where(MicrobiomeData.user_id == current_user.id))
    return result.scalars().all()


@router.post("/analysis", response_model=MicrobiomeAnalysisResponse)
async def analyze_microbiome(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(MicrobiomeData).where(MicrobiomeData.user_id == current_user.id))
    data = result.scalars().all()

    # Shannon diversity index
    abundances = [d.relative_abundance for d in data if d.relative_abundance and d.relative_abundance > 0]
    total = sum(abundances)
    diversity = 0.0
    if total > 0:
        proportions = [a / total for a in abundances]
        diversity = -sum(p * math.log(p) for p in proportions if p > 0)

    top_taxa = sorted(
        [{"name": d.taxon_name, "abundance": float(d.relative_abundance or 0)} for d in data],
        key=lambda x: x["abundance"],
        reverse=True
    )[:10]

    health_score = sum(d.health_score or 0 for d in data) / len(data) if data else 0
    assessment = "Healthy" if health_score > 0.7 else "Moderate" if health_score > 0.4 else "Needs Improvement"

    suggestions = []
    if health_score <= 0.7:
        suggestions.append("Increase dietary fiber intake to support beneficial bacteria")
        suggestions.append("Consider fermented foods like yogurt and kimchi")
    if diversity < 1.5:
        suggestions.append(" diversify plant-based food sources")

    return MicrobiomeAnalysisResponse(
        user_id=current_user.id,
        diversity_index=round(diversity, 3),
        top_taxa=top_taxa,
        health_assessment=assessment,
        dietary_suggestions=suggestions
    )
