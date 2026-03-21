from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from db.connection import get_session
from dependencies.auth import get_moderator
from models.user import User
from models.person import Person, PersonReaction, PersonComment
from schemas.person import PersonResponse, CommentResponse, ReactionResponse
from schemas.admin import AdminPersonUpdateRequest, AdminCommentUpdateRequest

router = APIRouter(prefix="/moderator", tags=["moderator"])


# ═══════════════════════════════════════════════
#  HELPERS
# ═══════════════════════════════════════════════

def _person_query():
    return select(Person).options(
        selectinload(Person.photos),
        selectinload(Person.reactions),
        selectinload(Person.comments),
    )


# ═══════════════════════════════════════════════
#  PERSONS
# ═══════════════════════════════════════════════

@router.get("/persons", response_model=list[PersonResponse])
async def list_persons(
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
    skip: int = 0,
    limit: int = 50,
    include_deleted: bool = False,
):
    q = _person_query().offset(skip).limit(limit)
    if not include_deleted:
        q = q.where(Person.deleted_at.is_(None))
    result = await session.scalars(q)
    return result.all()


@router.get("/persons/{person_id}", response_model=PersonResponse)
async def get_person(
    person_id: int,
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
):
    person = await session.scalar(_person_query().where(Person.id == person_id))
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person


@router.patch("/persons/{person_id}/status", response_model=PersonResponse)
async def update_person_status(
    person_id: int,
    data: AdminPersonUpdateRequest,  # содержит status
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
):
    person = await session.scalar(_person_query().where(Person.id == person_id))
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    if data.status is not None:
        person.status = data.status
    if data.consent_note is not None:
        person.consent_note = data.consent_note
    if data.contact_email is not None:
        person.contact_email = data.contact_email

    person.updated_by = moderator.id
    await session.commit()
    await session.refresh(person)
    return person


# ═══════════════════════════════════════════════
#  COMMENTS
# ═══════════════════════════════════════════════

@router.get("/comments", response_model=list[CommentResponse])
async def list_comments(
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
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
    moderator: User = Depends(get_moderator),
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
    moderator: User = Depends(get_moderator),
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
    moderator: User = Depends(get_moderator),
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
    moderator: User = Depends(get_moderator),
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
    moderator: User = Depends(get_moderator),
):
    reaction = await session.get(PersonReaction, reaction_id)
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")

    await session.delete(reaction)
    await session.commit()
    return {"detail": "Reaction deleted"}