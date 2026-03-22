from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.connection import get_session
from dependencies.auth import get_current_user
from models.user import User
from schemas.user import UserResponse, UserUpdateRequest
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.person import Person
from schemas.person import PersonListResponse

router = APIRouter(prefix="/users", tags=["users"])


# ───────────────────────────── GET ME ─────────────────────────────

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ───────────────────────────── UPDATE ME ─────────────────────────────

@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if data.username is not None:
        # Проверяем уникальность username
        from sqlalchemy import select
        existing = await session.scalar(
            select(User).where(User.username == data.username, User.id != current_user.id)
        )
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = data.username

    if data.phone is not None:
        current_user.phone = data.phone

    await session.commit()
    await session.refresh(current_user)
    return current_user


# ───────────────────────────── DEACTIVATE ME ─────────────────────────────

@router.delete("/me", status_code=status.HTTP_200_OK)
async def deactivate_me(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Мягкое удаление — помечаем deleted_at и is_active=False"""
    current_user.deleted_at = datetime.now(timezone.utc)
    current_user.is_active = False
    current_user.deleted_by = current_user.id

    await session.commit()
    return {"detail": "Account deactivated successfully"}


@router.get("/me/persons", response_model=list[PersonListResponse])
async def get_my_persons(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Персоны добавленные текущим пользователем"""
    result = await session.scalars(
        select(Person)
        .options(
            selectinload(Person.photos),
            selectinload(Person.reactions),
            selectinload(Person.comments),
        )
        .where(Person.submitted_by == current_user.id)
        .where(Person.deleted_at.is_(None))
        .order_by(Person.created_at.desc())
    )
    return result.all()