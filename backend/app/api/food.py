from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from uuid import UUID

from app.db.session import get_db
from app.models.food import FoodNutrition
from app.schemas.food import FoodNutritionResponse, FoodSearchResult
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/api/foods", tags=["foods"])


@router.get("/search", response_model=FoodSearchResult)
async def search_foods(
    q: str = Query(..., min_length=1),
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    stmt = select(FoodNutrition).where(FoodNutrition.food_name.ilike(f"%{q}%"))
    if category:
        stmt = stmt.where(FoodNutrition.category == category)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar()

    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    foods = result.scalars().all()

    return FoodSearchResult(query=q, results=foods, total=total)


@router.get("/{food_id}", response_model=FoodNutritionResponse)
async def get_food(
    food_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(FoodNutrition).where(FoodNutrition.id == food_id))
    food = result.scalar_one_or_none()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    return food
