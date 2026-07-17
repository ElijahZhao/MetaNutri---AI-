from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class NutritionRecommendationBase(BaseModel):
    recommendation_type: Optional[str] = None
    food_items: Optional[list] = None
    nutrient_targets: Optional[dict] = None
    confidence_score: Optional[float] = None
    explanation: Optional[str] = None


class NutritionRecommendationCreate(NutritionRecommendationBase):
    pass


class NutritionRecommendationResponse(NutritionRecommendationBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PersonalizedRecommendationRequest(BaseModel):
    user_id: UUID
    meal_type: Optional[str] = "general"
    calorie_target: Optional[float] = None


class FoodScoreRequest(BaseModel):
    user_id: UUID
    food_id: UUID


class FoodScoreResponse(BaseModel):
    food_id: UUID
    food_name: str
    score: float
    explanation: str
