from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
import random

from app.db.session import get_db
from app.models.recommendation import NutritionRecommendation
from app.models.food import FoodNutrition
from app.schemas.recommendation import (
    NutritionRecommendationResponse,
    PersonalizedRecommendationRequest,
    FoodScoreRequest,
    FoodScoreResponse
)
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/personalized", response_model=List[NutritionRecommendationResponse])
async def get_personalized(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(NutritionRecommendation)
        .where(NutritionRecommendation.user_id == current_user.id)
        .order_by(NutritionRecommendation.created_at.desc())
        .limit(10)
    )
    return result.scalars().all()


@router.post("/food-score", response_model=FoodScoreResponse)
async def food_score(
    req: FoodScoreRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(FoodNutrition).where(FoodNutrition.id == req.food_id))
    food = result.scalar_one_or_none()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    # Simple scoring algorithm
    score = 50.0
    if food.fiber_g and food.fiber_g > 5:
        score += 15
    if food.glycemic_index and food.glycemic_index < 55:
        score += 15
    if food.protein_g and food.protein_g > 10:
        score += 10
    if food.calories_kcal and food.calories_kcal < 200:
        score += 10
    score = min(100, max(0, score + random.uniform(-5, 5)))

    explanation = f"{food.food_name} has a nutrition score of {score:.1f} based on its fiber, protein, and glycemic profile."

    return FoodScoreResponse(
        food_id=food.id,
        food_name=food.food_name,
        score=round(score, 1),
        explanation=explanation
    )


@router.post("/meal-plan", response_model=NutritionRecommendationResponse)
async def generate_meal_plan(
    req: PersonalizedRecommendationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(FoodNutrition).limit(20))
    foods = result.scalars().all()

    selected = random.sample(foods, min(6, len(foods))) if len(foods) >= 6 else foods
    food_items = [{"name": f.food_name, "calories": float(f.calories_kcal or 0)} for f in selected]

    total_calories = sum(f["calories"] for f in food_items)
    rec = NutritionRecommendation(
        user_id=current_user.id,
        recommendation_type="meal_plan",
        food_items=food_items,
        nutrient_targets={"calories": req.calorie_target or 2000},
        confidence_score=0.75,
        explanation=f"Generated a balanced meal plan with {total_calories:.0f} kcal."
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    return rec

from fastapi import HTTPException
