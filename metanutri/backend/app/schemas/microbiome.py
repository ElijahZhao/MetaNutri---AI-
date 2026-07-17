from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID


class MicrobiomeDataBase(BaseModel):
    taxon_level: Optional[str] = None
    taxon_name: str
    relative_abundance: Optional[float] = None
    health_score: Optional[float] = None
    sample_date: Optional[date] = None


class MicrobiomeDataCreate(MicrobiomeDataBase):
    pass


class MicrobiomeDataResponse(MicrobiomeDataBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class MicrobiomeAnalysisRequest(BaseModel):
    user_id: UUID


class MicrobiomeAnalysisResponse(BaseModel):
    user_id: UUID
    diversity_index: float
    top_taxa: list[dict]
    health_assessment: str
    dietary_suggestions: list[str]
