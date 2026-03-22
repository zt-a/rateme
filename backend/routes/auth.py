import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.connection import get_session
from models.user import User
from models.refresh_token import RefreshToken
from schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse,
    RefreshRequest, ForgotPasswordRequest,
    ResetPasswordRequest, ChangePasswordRequest,
)
from utils.password_utils import hash_password, verify_password
from utils.jwt_utils import create_access_token, create_refresh_token
from utils.email_utils import send_confirm_email, send_reset_password_email
from dependencies.auth import get_current_user
from fastapi.responses import RedirectResponse
from config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


# ───────────────────────────── REGISTER ─────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, session: AsyncSession = Depends(get_session)):
    existing = await session.scalar(select(User).where(User.email == data.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    confirm_token = secrets.token_urlsafe(32)
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        meta={"confirm_token": confirm_token},
    )
    session.add(user)
    await session.commit()

    await send_confirm_email(user.email, confirm_token)
    return {"detail": "Registered. Please confirm your email."}


# ───────────────────────────── CONFIRM EMAIL ─────────────────────────────
@router.get("/confirm-email")
async def confirm_email(token: str, session: AsyncSession = Depends(get_session)):
    user = await session.scalar(
        select(User).where(User.meta["confirm_token"].astext == token)
    )

    if not user:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/confirm-email?status=error",
            status_code=302
        )

    if user.is_confirm:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/confirm-email?status=already",
            status_code=302
        )

    user.is_confirm = True
    user.meta.pop("confirm_token", None)
    await session.commit()

    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/confirm-email?status=success",
        status_code=302
    )
# ───────────────────────────── LOGIN ─────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, session: AsyncSession = Depends(get_session)):
    user = await session.scalar(select(User).where(User.email == data.email))
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active or user.deleted_at is not None:
        raise HTTPException(status_code=403, detail="Account is inactive")
    if not user.is_confirm:
        raise HTTPException(status_code=403, detail="Email not confirmed")

    # Создаём токены
    access_token = create_access_token(user.id)
    refresh_token_value = create_refresh_token()

    refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_value,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    session.add(refresh_token)

    user.last_login = datetime.now(timezone.utc)
    await session.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token_value)


# ───────────────────────────── REFRESH TOKEN ─────────────────────────────

@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, session: AsyncSession = Depends(get_session)):
    rt = await session.scalar(
        select(RefreshToken).where(RefreshToken.token == data.refresh_token)
    )
    if not rt or rt.is_revoked or rt.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Ротация: старый отзываем, создаём новый
    rt.is_revoked = True

    new_refresh_value = create_refresh_token()
    new_rt = RefreshToken(
        user_id=rt.user_id,
        token=new_refresh_value,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    session.add(new_rt)
    await session.commit()

    access_token = create_access_token(rt.user_id)
    return TokenResponse(access_token=access_token, refresh_token=new_refresh_value)


# ───────────────────────────── FORGOT PASSWORD ─────────────────────────────

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, session: AsyncSession = Depends(get_session)):
    user = await session.scalar(select(User).where(User.email == data.email))
    # Всегда возвращаем 200 — не раскрываем существование email
    if user and user.is_active and user.deleted_at is None:
        reset_token = secrets.token_urlsafe(32)
        reset_expires = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
        user.meta["reset_token"] = reset_token
        user.meta["reset_expires"] = reset_expires
        await session.commit()
        await send_reset_password_email(user.email, reset_token)

    return {"detail": "If this email exists, a reset link has been sent."}


# ───────────────────────────── RESET PASSWORD ─────────────────────────────

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, session: AsyncSession = Depends(get_session)):
    user = await session.scalar(
        select(User).where(User.meta["reset_token"].astext == data.token)
    )
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    expires_str = user.meta.get("reset_expires")
    if not expires_str or datetime.fromisoformat(expires_str) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token expired")

    user.hashed_password = hash_password(data.new_password)
    user.meta.pop("reset_token", None)
    user.meta.pop("reset_expires", None)

    # Отзываем все refresh токены пользователя
    refresh_tokens = await session.scalars(
        select(RefreshToken).where(RefreshToken.user_id == user.id, not RefreshToken.is_revoked)
    )
    for rt in refresh_tokens:
        rt.is_revoked = True

    await session.commit()
    return {"detail": "Password reset successfully"}


# ───────────────────────────── CHANGE PASSWORD ─────────────────────────────

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    current_user.hashed_password = hash_password(data.new_password)

    # Отзываем все refresh токены
    refresh_tokens = await session.scalars(
        select(RefreshToken).where(RefreshToken.user_id == current_user.id, not RefreshToken.is_revoked)
    )
    for rt in refresh_tokens:
        rt.is_revoked = True

    await session.commit()
    return {"detail": "Password changed successfully"}