from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.user import UserResponse, UserProfileCreate, UserProfileResponse
from app.core.security import get_current_active_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


from fastapi import HTTPException

@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    profile_in: UserProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()

    if profile:
        for field, value in profile_in.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
    else:
        profile = UserProfile(user_id=current_user.id, **profile_in.model_dump())
        db.add(profile)

    await db.commit()
    await db.refresh(profile)
    return profile
