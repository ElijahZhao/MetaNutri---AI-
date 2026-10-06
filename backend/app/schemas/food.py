from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class FoodNutritionBase(BaseModel):
    food_name: str
    category: Optional[str] = None
    calories_kcal: Optional[float] = None
    protein_g: Optional[float] = None
    fat_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fiber_g: Optional[float] = None
    vitamins: Optional[dict] = None
    minerals: Optional[dict] = None
    glycemic_index: Optional[float] = None
    glycemic_load: Optional[float] = None


class FoodNutritionCreate(FoodNutritionBase):
    pass


class FoodNutritionResponse(FoodNutritionBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class FoodSearchResult(BaseModel):
    query: str
    results: list[FoodNutritionResponse]
    total: int
