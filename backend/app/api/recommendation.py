from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

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
    # Fully deterministic: it used to add random.uniform(-5, 5) jitter, so the
    # same food scored differently on every request and the frontend showed a
    # different number each time it was clicked.
    score = min(100, max(0, score))

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
    result = await db.execute(select(FoodNutrition))
    foods = list(result.scalars().all())

    target = float(req.calorie_target or 2000)
    # Deterministic, target-aware selection: greedy from lowest-GI foods so the
    # plan approaches the calorie budget without blowing past it, with variety.
    chosen = []
    total = 0.0
    for f in sorted(foods, key=lambda x: (float(x.glycemic_index or 100), (x.category or ""))):
        cal = float(f.calories_kcal or 0)
        if cal <= 0:
            continue
        if total + cal > target * 1.25:
            continue
        chosen.append(f)
        total += cal
        if len(chosen) >= 8 or total >= target * 0.9:
            break

    # Ensure a protein source if none selected yet.
    has_protein = any(float(f.protein_g or 0) >= 15 for f in chosen)
    if not has_protein and len(foods) > len(chosen):
        food_by_protein = sorted(
            (f for f in foods if f not in chosen and float(f.protein_g or 0) >= 15),
            key=lambda x: -float(x.protein_g or 0),
        )
        if food_by_protein and total + float(food_by_protein[0].calories_kcal or 0) <= target * 1.35:
            chosen.append(food_by_protein[0])
            total += float(food_by_protein[0].calories_kcal or 0)

    food_items = [
        {"name": f.food_name, "calories": round(float(f.calories_kcal or 0), 1), "protein": float(f.protein_g or 0), "category": f.category}
        for f in chosen
    ]

    protein_total = sum(float(ft["protein"]) for ft in food_items)
    rec = NutritionRecommendation(
        user_id=current_user.id,
        recommendation_type="meal_plan",
        food_items=food_items,
        nutrient_targets={"calories": target, "target_protein_g": round(target * 0.25 / 4, 1)},
        confidence_score=0.75,
        explanation=(
            f"Generated a {len(food_items)}-item plan around {target:.0f} kcal ({total:.0f} kcal selected, "
            f"~{protein_total:.0f}g protein), prioritizing lower-GI foods for balanced blood glucose."
        ),
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    return rec
