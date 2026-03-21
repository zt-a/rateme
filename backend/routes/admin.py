from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from db.connection import get_session
from dependencies.auth import get_admin
from models.user import User
from models.person import Person, PersonReaction, PersonComment
from models.refresh_token import RefreshToken
from utils.password_utils import hash_password
from schemas.admin import (
    AdminUserResponse, AdminUserCreateRequest, AdminUserUpdateRequest, AdminSetRoleRequest,
    AdminPersonCreateRequest, AdminPersonUpdateRequest,
    AdminCommentUpdateRequest,
)
from schemas.person import PersonResponse, CommentResponse, ReactionResponse

router = APIRouter(prefix="/admin", tags=["admin"])


# ═══════════════════════════════════════════════
#  USERS
# ═══════════════════════════════════════════════

@router.get("/users", response_model=list[AdminUserResponse])
async def list_users(
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
    skip: int = 0,
    limit: int = 50,
    include_deleted: bool = False,
):
    q = select(User).offset(skip).limit(limit)
    if not include_deleted:
        q = q.where(User.deleted_at.is_(None))
    result = await session.scalars(q)
    return result.all()


@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def get_user(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/users", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: AdminUserCreateRequest,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    existing = await session.scalar(select(User).where(User.email == data.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        username=data.username,
        phone=data.phone,
        is_moderator=data.is_moderator,
        is_admin=data.is_admin,
        is_active=data.is_active,
        is_confirm=data.is_confirm,
        created_by=admin.id,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: int,
    data: AdminUserUpdateRequest,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    user.updated_by = admin.id

    await session.commit()
    await session.refresh(user)
    return user


@router.patch("/users/{user_id}/role", response_model=AdminUserResponse)
async def set_user_role(
    user_id: int,
    data: AdminSetRoleRequest,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    """Повысить до модератора/админа или понизить до обычного юзера"""
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    user.is_moderator = data.is_moderator
    user.is_admin = data.is_admin
    user.updated_by = admin.id

    await session.commit()
    await session.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: int,
    hard: bool = False,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    """hard=false — мягкое удаление, hard=true — полное удаление из БД"""
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    if hard:
        await session.delete(user)
    else:
        user.deleted_at = datetime.now(timezone.utc)
        user.is_active = False
        user.deleted_by = admin.id

    await session.commit()
    return {"detail": "User deleted", "hard": hard}


@router.post("/users/{user_id}/restore", response_model=AdminUserResponse)
async def restore_user(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    """Восстановить мягко удалённого пользователя"""
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.deleted_at = None
    user.is_active = True
    user.updated_by = admin.id

    await session.commit()
    await session.refresh(user)
    return user


@router.delete("/users/{user_id}/sessions", status_code=status.HTTP_200_OK)
async def revoke_user_sessions(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    """Отозвать все refresh токены пользователя (принудительный logout)"""
    tokens = await session.scalars(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            not RefreshToken.is_revoked,
        )
    )
    for token in tokens:
        token.is_revoked = True

    await session.commit()
    return {"detail": "All sessions revoked"}


# ═══════════════════════════════════════════════
#  PERSONS
# ═══════════════════════════════════════════════

def _person_query():
    return select(Person).options(
        selectinload(Person.photos),
        selectinload(Person.reactions),
        selectinload(Person.comments),
    )


@router.get("/persons", response_model=list[PersonResponse])
async def list_persons(
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
    skip: int = 0,
    limit: int = 50,
    include_deleted: bool = False,
):
    q = _person_query().offset(skip).limit(limit)
    if not include_deleted:
        q = q.where(Person.deleted_at.is_(None))
    result = await session.scalars(q)
    return result.all()


@router.post("/persons", response_model=PersonResponse, status_code=status.HTTP_201_CREATED)
async def create_person(
    data: AdminPersonCreateRequest,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    person = Person(**data.model_dump(), created_by=admin.id)
    session.add(person)
    await session.commit()
    await session.refresh(person)
    person = await session.scalar(_person_query().where(Person.id == person.id))
    return person


@router.get("/persons/{person_id}", response_model=PersonResponse)
async def get_person(
    person_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    person = await session.scalar(_person_query().where(Person.id == person_id))
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person


@router.patch("/persons/{person_id}", response_model=PersonResponse)
async def update_person(
    person_id: int,
    data: AdminPersonUpdateRequest,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    person = await session.scalar(_person_query().where(Person.id == person_id))
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(person, field, value)
    person.updated_by = admin.id

    await session.commit()
    person = await session.scalar(_person_query().where(Person.id == person_id))
    return person


@router.delete("/persons/{person_id}", status_code=status.HTTP_200_OK)
async def delete_person(
    person_id: int,
    hard: bool = False,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    person = await session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    if hard:
        await session.delete(person)
    else:
        person.deleted_at = datetime.now(timezone.utc)
        person.deleted_by = admin.id

    await session.commit()
    return {"detail": "Person deleted", "hard": hard}


@router.post("/persons/{person_id}/restore", response_model=PersonResponse)
async def restore_person(
    person_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    person = await session.scalar(_person_query().where(Person.id == person_id))
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    person.deleted_at = None
    person.updated_by = admin.id

    await session.commit()
    person = await session.scalar(_person_query().where(Person.id == person_id))
    return person


# ═══════════════════════════════════════════════
#  COMMENTS
# ═══════════════════════════════════════════════

@router.get("/comments", response_model=list[CommentResponse])
async def list_comments(
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
    skip: int = 0,
    limit: int = 50,
    include_deleted: bool = False,
    person_id: int | None = None,
    user_id: int | None = None,
):
    q = select(PersonComment).offset(skip).limit(limit)
    if not include_deleted:
        q = q.where(PersonComment.deleted_at.is_(None))
    if person_id:
        q = q.where(PersonComment.person_id == person_id)
    if user_id:
        q = q.where(PersonComment.user_id == user_id)
    result = await session.scalars(q)
    return result.all()


@router.patch("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    data: AdminCommentUpdateRequest,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    comment = await session.get(PersonComment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if data.text is not None:
        comment.text = data.text
    if data.deleted_at is not None:
        comment.deleted_at = data.deleted_at

    await session.commit()
    await session.refresh(comment)
    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_200_OK)
async def delete_comment(
    comment_id: int,
    hard: bool = False,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    comment = await session.get(PersonComment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if hard:
        await session.delete(comment)
    else:
        comment.deleted_at = datetime.now(timezone.utc)

    await session.commit()
    return {"detail": "Comment deleted", "hard": hard}


@router.post("/comments/{comment_id}/restore", response_model=CommentResponse)
async def restore_comment(
    comment_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    comment = await session.get(PersonComment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment.deleted_at = None
    await session.commit()
    await session.refresh(comment)
    return comment


# ═══════════════════════════════════════════════
#  REACTIONS
# ═══════════════════════════════════════════════

@router.get("/reactions", response_model=list[ReactionResponse])
async def list_reactions(
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
    skip: int = 0,
    limit: int = 50,
    person_id: int | None = None,
    user_id: int | None = None,
):
    q = select(PersonReaction).offset(skip).limit(limit)
    if person_id:
        q = q.where(PersonReaction.person_id == person_id)
    if user_id:
        q = q.where(PersonReaction.user_id == user_id)
    result = await session.scalars(q)
    return result.all()


@router.delete("/reactions/{reaction_id}", status_code=status.HTTP_200_OK)
async def delete_reaction(
    reaction_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin),
):
    reaction = await session.get(PersonReaction, reaction_id)
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")

    await session.delete(reaction)
    await session.commit()
    return {"detail": "Reaction deleted"}
