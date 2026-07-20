from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.genomic import GenomicData
from app.schemas.genomic import GenomicDataCreate, GenomicDataResponse, GenomicAnalysisResponse
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/api/genomic", tags=["genomic"])


@router.post("/upload", response_model=List[GenomicDataResponse], status_code=201)
async def upload_genomic(
    data_list: List[GenomicDataCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    genomic_entries = []
    for item in data_list:
        entry = GenomicData(user_id=current_user.id, **item.model_dump())
        db.add(entry)
        genomic_entries.append(entry)
    await db.commit()
    for entry in genomic_entries:
        await db.refresh(entry)
    return genomic_entries


@router.get("/user", response_model=List[GenomicDataResponse])
async def get_user_genomic(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(GenomicData).where(GenomicData.user_id == current_user.id))
    return result.scalars().all()


@router.post("/analysis", response_model=GenomicAnalysisResponse)
async def analyze_genomic(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(GenomicData).where(GenomicData.user_id == current_user.id))
    data = result.scalars().all()

    key_genes = list(set(d.gene_name for d in data if d.gene_name))
    nutrition_risks = []
    for d in data:
        if d.effect_score and d.effect_score > 0.5:
            nutrition_risks.append({
                "gene": d.gene_name,
                "snp": d.snp_id,
                "risk": "High",
                "description": d.trait_description
            })

    return GenomicAnalysisResponse(
        user_id=current_user.id,
        total_snps=len(data),
        key_genes=key_genes,
        nutrition_risks=nutrition_risks
    )
