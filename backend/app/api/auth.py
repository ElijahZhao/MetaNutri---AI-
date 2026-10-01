from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from datetime import timedelta
import secrets
import time

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token,
    ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest,
)
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_active_user
from app.core.config import settings
from app.core.redis import (
    cache_user_token, get_user_token, invalidate_user_token,
    set_password_reset_token, get_password_reset_user_id, clear_password_reset_token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# --- In-memory rate limiting for auth endpoints (brute-force protection) ---
# key: "<ip>:<username>" (login) -> list of monotonic timestamps
_LOGIN_ATTEMPTS = {}
_LOGIN_MAX_ATTEMPTS = 5          # max attempts per window
_LOGIN_WINDOW_SECONDS = 60       # window length
_LOGIN_BURST_MAX = 20            # overall burst cap per IP regardless of username
_LOGIN_BURST_WINDOW = 300
_IP_LOGIN_BURST = {}


def _prune_and_count(records, window: float, now: float):
    cutoff = now - window
    records = [t for t in records if t > cutoff]
    return records


def _check_login_rate_limit(request: Request, username: str):
    now = time.monotonic()
    client_ip = request.client.host if request.client else "unknown"

    # Overall burst guard per IP (prevents distributed username stuffing).
    burst = _prune_and_count(_IP_LOGIN_BURST.get(client_ip, []), _LOGIN_BURST_WINDOW, now)
    burst.append(now)
    _IP_LOGIN_BURST[client_ip] = burst
    if len(burst) > _LOGIN_BURST_MAX:
        raise HTTPException(status_code=429, detail="Too many login attempts. Please try again later.")

    key = f"{client_ip}:{username}"
    records = _prune_and_count(_LOGIN_ATTEMPTS.get(key, []), _LOGIN_WINDOW_SECONDS, now)
    records.append(now)
    _LOGIN_ATTEMPTS[key] = records
    if len(records) > _LOGIN_MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many failed attempts. Please try again later.")


def _record_success(key_ip_prefix: str):
    client_ip = key_ip_prefix
    _IP_LOGIN_BURST.pop(client_ip, None)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, request: Request, db: AsyncSession = Depends(get_db)):
    _check_login_rate_limit(request, f"register:{user_in.username}")
    result = await db.execute(
        select(User).where((User.email == user_in.email) | (User.username == user_in.username))
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = User(
        email=user_in.email,
        username=user_in.username,
        password_hash=get_password_hash(user_in.password)
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already registered")
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    _check_login_rate_limit(request, user_in.username)
    result = await db.execute(select(User).where(User.username == user_in.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    _record_success(request.client.host if request.client else "unknown")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    cache_user_token(str(user.id), access_token, expires_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    invalidate_user_token(str(current_user.id))
    return {"message": "Successfully logged out"}


def _validate_password_strength(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=422, detail="New password must be at least 8 characters")
    has_letter = any(c.isalpha() for c in password)
    has_digit = any(c.isdigit() for c in password)
    if not (has_letter and has_digit):
        raise HTTPException(status_code=422, detail="New password must contain both letters and numbers")


def _frontend_base() -> str:
    import os
    return os.getenv("FRONTEND_URL", "").rstrip("/")


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    req: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    # Reuse the login rate limiter to blunt password-reset spam / email probing.
    _check_login_rate_limit(request, f"forgot:{req.email}")

    token = secrets.token_urlsafe(32)
    message = "If an account exists for that email, a password reset token has been issued."

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    # No-email mode: no mail service configured, so return the reset token to
    # the caller (typically logged/displayed in dev). Once email is wired in,
    # send the token via email and stop returning it here.
    if user:
        set_password_reset_token(token, str(user.id))
        base = _frontend_base()
        reset_url = f"{base}/forgot-password?token={token}" if base else None
        return ForgotPasswordResponse(message=message, reset_token=token, reset_url=reset_url)

    return ForgotPasswordResponse(message=message)


@router.post("/reset-password")
async def reset_password(
    req: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    _validate_password_strength(req.new_password)

    user_id = get_password_reset_user_id(req.token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        clear_password_reset_token(req.token)
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.password_hash = get_password_hash(req.new_password)
    await db.commit()

    # Token is single-use and all existing sessions are invalidated.
    clear_password_reset_token(req.token)
    invalidate_user_token(str(user.id))
    return {"message": "Password has been reset. You can now log in."}
