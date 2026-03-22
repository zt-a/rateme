from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from utils.jwt_utils import decode_access_token
from utils.email_utils import send_email, get_contact_email_body, get_agreed_email_body, get_rejected_email_body
from db.connection import get_session
from dependencies.auth import get_current_user, get_moderator
from models.user import User
from models.person import Person, PersonReaction, PersonComment, ReactionType, PersonStatus
from schemas.person import (
    PersonCreateRequest, PersonUpdateRequest, PersonResponse, PersonListResponse,
    PersonStatusUpdate, PersonListPageResponse, PersonPublicResponse,
    ReactionRequest, ReactionResponse,
    CommentCreateRequest, CommentUpdateRequest, CommentResponse,
)

from dependencies.auth import get_current_user_optional
from typing import Union

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from config import settings

router = APIRouter(prefix="/persons", tags=["persons"])

security = HTTPBearer(auto_error=False)

def _person_query():
    return select(Person).options(
        selectinload(Person.photos),
        selectinload(Person.reactions),
        selectinload(Person.comments),
    )


def _check_not_deleted(person: Person):
    if person.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Person not found")


# ═══════════════════════════════════════════════
#  PERSONS CRUD
# ═══════════════════════════════════════════════

@router.get("", response_model=PersonListPageResponse)
async def list_persons(
    session: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 20,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    total = await session.scalar(
        select(func.count(Person.id))
        .where(Person.deleted_at.is_(None))
        .where(Person.status == PersonStatus.PUBLISHED)
    ) or 0

    result = await session.scalars(
        _person_query()
        .where(Person.deleted_at.is_(None))
        .where(Person.status == PersonStatus.PUBLISHED)
        .offset(skip).limit(limit)
    )
    persons = result.all()

    user_id = None
    if credentials:
        try:
            user_id = decode_access_token(credentials.credentials)
        except Exception:
            pass

    user_reactions = {}
    if user_id:
        person_ids = [p.id for p in persons]
        reactions = await session.scalars(
            select(PersonReaction).where(
                PersonReaction.person_id.in_(person_ids),
                PersonReaction.user_id == user_id
            )
        )
        for reaction in reactions.all():
            user_reactions[reaction.person_id] = reaction.type.value

    result_list = []
    for person in persons:
        data = PersonListResponse.model_validate(person)
        data.user_reaction = user_reactions.get(person.id, None)
        result_list.append(data)

    page = skip // limit

    return PersonListPageResponse(
        items=result_list,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )

@router.get("/{person_id}", response_model=Union[PersonResponse, PersonPublicResponse])
async def get_person(
    person_id: int,
    session: AsyncSession = Depends(get_session),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    current_user: User | None = Depends(get_current_user_optional),
):
    person = await session.scalar(_person_query().where(Person.id == person_id))
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    _check_not_deleted(person)

    user_reaction = None
    if credentials:
        try:
            user_id = decode_access_token(credentials.credentials)
            reaction = await session.scalar(
                select(PersonReaction).where(
                    PersonReaction.person_id == person_id,
                    PersonReaction.user_id == user_id
                )
            )
            if reaction:
                user_reaction = reaction.type.value
        except Exception:
            pass

    # Модераторы и админы видят все данные
    is_privileged = current_user and (current_user.is_moderator or current_user.is_admin)

    if is_privileged:
        data = PersonResponse.model_validate(person)
    else:
        data = PersonPublicResponse.model_validate(person)

    data.user_reaction = user_reaction
    return data

@router.post("", response_model=PersonResponse, status_code=status.HTTP_201_CREATED)
async def create_person(
    data: PersonCreateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Любой авторизованный пользователь — уходит на модерацию"""
    person = Person(
        **data.model_dump(),
        status=PersonStatus.PENDING,
        submitted_by=current_user.id,
        created_by=current_user.id,
    )
    session.add(person)
    await session.commit()
    await session.refresh(person)
    person = await session.scalar(_person_query().where(Person.id == person.id))
    return person


@router.patch("/{person_id}/status", response_model=PersonResponse)
async def update_person_status(
    person_id: int,
    data: PersonStatusUpdate,
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
):
    """Смена статуса — только модераторы"""
    person = await session.scalar(_person_query().where(Person.id == person_id))
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    old_status = person.status
    person.status = data.status

    if data.consent_note is not None:
        person.consent_note = data.consent_note
    if data.contact_email is not None:
        person.contact_email = data.contact_email

    await session.commit()
    person = await session.scalar(_person_query().where(Person.id == person_id))

    # Отправляем email при смене статуса
    email = person.contact_email or person.email
    if email and data.status != old_status:
        site_url = f"{settings.APP_URL}/persons/{person_id}"
        if data.status == PersonStatus.CONTACTED:
            await send_email(
                email,
                "Ваш профиль на RateMe",
                get_contact_email_body(person.name, site_url)
            )
        elif data.status == PersonStatus.AGREED:
            await send_email(
                email,
                "Профиль опубликован — RateMe",
                get_agreed_email_body(person.name)
            )
        elif data.status == PersonStatus.REJECTED:
            await send_email(
                email,
                "Профиль будет удалён — RateMe",
                get_rejected_email_body(person.name)
            )

    return person


@router.patch("/{person_id}", response_model=PersonResponse)
async def update_person(
    person_id: int,
    data: PersonUpdateRequest,
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
):
    """Только модераторы и админы"""
    person = await session.scalar(_person_query().where(Person.id == person_id))
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    _check_not_deleted(person)

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(person, field, value)
    person.updated_by = moderator.id

    await session.commit()
    await session.refresh(person)
    person = await session.scalar(_person_query().where(Person.id == person.id))
    return person


@router.delete("/{person_id}", status_code=status.HTTP_200_OK)
async def delete_person(
    person_id: int,
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
):
    """Мягкое удаление — только модераторы и админы"""
    person = await session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    _check_not_deleted(person)

    person.deleted_at = datetime.now(timezone.utc)
    person.deleted_by = moderator.id
    await session.commit()
    return {"detail": "Person deactivated"}


# ═══════════════════════════════════════════════
#  REACTIONS
# ═══════════════════════════════════════════════

@router.post("/{person_id}/reactions", response_model=ReactionResponse)
async def react_to_person(
    person_id: int,
    data: ReactionRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    person = await session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    _check_not_deleted(person)

    existing = await session.scalar(
        select(PersonReaction).where(
            PersonReaction.person_id == person_id,
            PersonReaction.user_id == current_user.id,
        )
    )

    if existing:
        if existing.type == data.type:
            await session.delete(existing)
            await session.commit()
            return existing
        else:
            existing.type = data.type
            await session.commit()
            await session.refresh(existing)
            return existing

    reaction = PersonReaction(
        person_id=person_id,
        user_id=current_user.id,
        type=data.type,
    )
    session.add(reaction)
    await session.commit()
    await session.refresh(reaction)
    return reaction


@router.delete("/{person_id}/reactions", status_code=status.HTTP_200_OK)
async def remove_reaction(
    person_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    reaction = await session.scalar(
        select(PersonReaction).where(
            PersonReaction.person_id == person_id,
            PersonReaction.user_id == current_user.id,
        )
    )
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")

    await session.delete(reaction)
    await session.commit()
    return {"detail": "Reaction removed"}


# ═══════════════════════════════════════════════
#  COMMENTS
# ═══════════════════════════════════════════════

@router.get("/{person_id}/comments", response_model=list[CommentResponse])
async def list_comments(
    person_id: int,
    session: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 50,
):
    result = await session.scalars(
        select(PersonComment)
        .where(
            PersonComment.person_id == person_id,
            PersonComment.deleted_at.is_(None),
        )
        .offset(skip).limit(limit)
    )
    return result.all()


@router.post("/{person_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    person_id: int,
    data: CommentCreateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    person = await session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    _check_not_deleted(person)

    comment = PersonComment(
        person_id=person_id,
        user_id=current_user.id,
        text=data.text,
    )
    session.add(comment)
    await session.commit()
    await session.refresh(comment)
    return comment


@router.patch("/{person_id}/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    person_id: int,
    comment_id: int,
    data: CommentUpdateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    comment = await session.get(PersonComment, comment_id)
    if not comment or comment.person_id != person_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id and not current_user.is_moderator and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed")

    comment.text = data.text
    await session.commit()
    await session.refresh(comment)
    return comment


@router.delete("/{person_id}/comments/{comment_id}", status_code=status.HTTP_200_OK)
async def delete_comment(
    person_id: int,
    comment_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    comment = await session.get(PersonComment, comment_id)
    if not comment or comment.person_id != person_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id and not current_user.is_moderator and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed")

    comment.deleted_at = datetime.now(timezone.utc)
    await session.commit()
    return {"detail": "Comment deleted"}


@router.get("/ratings/top", response_model=list[PersonListResponse])
async def get_ratings(
    session: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 20,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    from sqlalchemy import func, case

    rating_subq = (
        select(
            PersonReaction.person_id,
            (
                func.sum(case((PersonReaction.type == ReactionType.LIKE, 1), else_=0)) -
                func.sum(case((PersonReaction.type == ReactionType.DISLIKE, 1), else_=0))
            ).label("rating")
        )
        .group_by(PersonReaction.person_id)
        .subquery()
    )

    result = await session.scalars(
        _person_query()
        .where(Person.deleted_at.is_(None))
        .where(Person.status == PersonStatus.PUBLISHED)  # только опубликованные
        .outerjoin(rating_subq, Person.id == rating_subq.c.person_id)
        .order_by(func.coalesce(rating_subq.c.rating, 0).desc())
        .offset(skip)
        .limit(limit)
    )
    persons = result.all()

    user_id = None
    if credentials:
        try:
            user_id = decode_access_token(credentials.credentials)
        except Exception:
            pass

    user_reactions = {}
    if user_id:
        person_ids = [p.id for p in persons]
        reactions = await session.scalars(
            select(PersonReaction).where(
                PersonReaction.person_id.in_(person_ids),
                PersonReaction.user_id == user_id
            )
        )
        for reaction in reactions.all():
            user_reactions[reaction.person_id] = reaction.type.value

    result_list = []
    for person in persons:
        data = PersonListResponse.model_validate(person)
        data.user_reaction = user_reactions.get(person.id, None)
        result_list.append(data)

    return result_list