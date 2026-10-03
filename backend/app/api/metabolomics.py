from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from typing import List, Optional
from datetime import date

from app.core.security import get_current_active_user
from app.models.user import User
from app.models.metabolomics import MetabolomicsData
from app.db.session import get_db

router = APIRouter(prefix="/api/metabolomics", tags=["metabolomics"])


class MetabolomicsDataCreate(BaseModel):
    metabolite_name: str
    pathway_name: Optional[str] = None
    concentration: float
    unit: Optional[str] = "μM"
    z_score: Optional[float] = None
    significance: Optional[float] = None
    sample_date: Optional[date] = None


class MetabolomicsDataResponse(BaseModel):
    id: str
    metabolite_name: str
    pathway_name: Optional[str]
    concentration: float
    unit: Optional[str]
    z_score: Optional[float]
    significance: Optional[float]
    sample_date: Optional[date]
    created_at: str


@router.post("/upload", response_model=List[MetabolomicsDataResponse])
async def upload_metabolomics_data(
    data: List[MetabolomicsDataCreate],
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db)
):
    try:
        results = []
        for item in data:
            record = MetabolomicsData(
                user_id=str(current_user.id),
                metabolite_name=item.metabolite_name,
                pathway_name=item.pathway_name,
                concentration=item.concentration,
                unit=item.unit,
                z_score=item.z_score,
                significance=item.significance,
                sample_date=item.sample_date,
            )
            db.add(record)
            results.append(record)
        await db.commit()
        return [MetabolomicsDataResponse(
            id=r.id,
            metabolite_name=r.metabolite_name,
            pathway_name=r.pathway_name,
            concentration=float(r.concentration) if r.concentration is not None else 0.0,
            unit=r.unit,
            z_score=float(r.z_score) if r.z_score else None,
            significance=float(r.significance) if r.significance else None,
            sample_date=r.sample_date,
            created_at=str(r.created_at),
        ) for r in results]
    except Exception as e:
        # AsyncSession.rollback() is a coroutine: calling it without await left
        # the coroutine un-run, so nothing was actually rolled back here.
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user", response_model=List[MetabolomicsDataResponse])
async def get_user_metabolomics(
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db)
):
    result = await db.execute(select(MetabolomicsData).where(MetabolomicsData.user_id == str(current_user.id)))
    records = result.scalars().all()
    return [MetabolomicsDataResponse(
        id=r.id,
        metabolite_name=r.metabolite_name,
        pathway_name=r.pathway_name,
        concentration=float(r.concentration) if r.concentration is not None else 0.0,
        unit=r.unit,
        z_score=float(r.z_score) if r.z_score else None,
        significance=float(r.significance) if r.significance else None,
        sample_date=r.sample_date,
        created_at=str(r.created_at),
    ) for r in records]


@router.get("/analysis")
async def analyze_metabolomics(
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db)
):
    result = await db.execute(select(MetabolomicsData).where(MetabolomicsData.user_id == str(current_user.id)))
    records = result.scalars().all()
    
    if not records:
        return {
            "total_metabolites": 0,
            "pathways": [],
            "summary": {
                "upregulated": 0,
                "downregulated": 0,
                "normal": 0,
            },
            "insights": ["暂无代谢组数据，请先上传数据。"],
        }
    
    pathway_counts = {}
    upregulated = 0
    downregulated = 0
    normal = 0
    
    for record in records:
        if record.pathway_name:
            pathway_counts[record.pathway_name] = pathway_counts.get(record.pathway_name, 0) + 1
        if record.z_score:
            z = float(record.z_score)
            if z > 1:
                upregulated += 1
            elif z < -1:
                downregulated += 1
            else:
                normal += 1
    
    # Deterministic pathway summary. This demo ships no reference pathway
    # database, so neither figure is a real statistical test: enrichment_score is
    # the observed/expected count ratio and p_value is a deterministic, monotone
    # function of it. Both used to be np.random.uniform draws, so the same upload
    # reported different numbers — and a different "p-value" — on every request.
    pathways = []
    expected = len(records) / len(pathway_counts) if pathway_counts else 0.0
    for pathway, count in pathway_counts.items():
        enrichment = count / expected if expected else 1.0
        pathways.append({
            "name": pathway,
            "metabolite_count": count,
            "enrichment_score": round(float(enrichment), 4),
            "p_value": round(float(1.0 / (1.0 + enrichment)), 4),
        })
    
    insights = []
    if upregulated > downregulated:
        insights.append("检测到多个代谢物上调，可能存在代谢活性增强。")
    if downregulated > upregulated:
        insights.append("检测到多个代谢物下调，建议关注能量代谢通路。")
    if "糖酵解" in pathway_counts:
        insights.append("糖酵解通路代谢物丰富，建议关注碳水化合物摄入。")
    if "三羧酸循环" in pathway_counts:
        insights.append("三羧酸循环通路活跃，表明能量代谢正常。")
    
    return {
        "total_metabolites": len(records),
        "pathways": pathways,
        "summary": {
            "upregulated": upregulated,
            "downregulated": downregulated,
            "normal": normal,
        },
        "insights": insights,
    }


@router.delete("/{data_id}")
async def delete_metabolomics_data(
    data_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db)
):
    result = await db.execute(select(MetabolomicsData).where(
        MetabolomicsData.id == data_id,
        MetabolomicsData.user_id == str(current_user.id)
    ))
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    await db.delete(record)
    await db.commit()
    return {"message": "Deleted successfully"}