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
    # No user_id: the endpoint scopes everything to the authenticated user, and
    # the frontend never had a real UUID to send (it sent "me", which the UUID
    # type rejected with a 422).
    meal_type: Optional[str] = "general"
    calorie_target: Optional[float] = None


class FoodScoreRequest(BaseModel):
    # No user_id for the same reason as above.
    food_id: UUID


class FoodScoreResponse(BaseModel):
    food_id: UUID
    food_name: str
    score: float
    explanation: str
