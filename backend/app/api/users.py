from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.user import UserResponse, UserProfileCreate, UserProfileResponse, ChangePasswordRequest
from app.core.security import get_current_active_user, verify_password, get_password_hash
from app.core.redis import invalidate_user_token, invalidate_refresh_token

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(req.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    if len(req.new_password) < 8:
        raise HTTPException(status_code=422, detail="New password must be at least 8 characters")
    if not (any(c.isalpha() for c in req.new_password) and any(c.isdigit() for c in req.new_password)):
        raise HTTPException(status_code=422, detail="New password must contain both letters and numbers")

    current_user.password_hash = get_password_hash(req.new_password)
    await db.commit()

    # Revoke existing sessions so the new password is actually enforced.
    invalidate_user_token(str(current_user.id))
    invalidate_refresh_token(str(current_user.id))
    return {"message": "Password updated successfully. Please log in again."}


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
