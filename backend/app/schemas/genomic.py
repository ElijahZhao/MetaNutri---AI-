from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class GenomicDataBase(BaseModel):
    gene_name: str
    snp_id: Optional[str] = None
    genotype: Optional[str] = None
    effect_score: Optional[float] = None
    trait_description: Optional[str] = None


class GenomicDataCreate(GenomicDataBase):
    pass


class GenomicDataResponse(GenomicDataBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class GenomicAnalysisRequest(BaseModel):
    user_id: UUID


class GenomicAnalysisResponse(BaseModel):
    user_id: UUID
    total_snps: int
    key_genes: list[str]
    nutrition_risks: list[dict]
