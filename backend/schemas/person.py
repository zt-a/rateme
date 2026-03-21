from pydantic import BaseModel
from datetime import date, datetime
from enum import Enum


class PersonStatus(str, Enum):
    PENDING = "pending"
    CONTACTED = "contacted"
    AGREED = "agreed"
    REJECTED = "rejected"
    PUBLISHED = "published"


class PersonStatusUpdate(BaseModel):
    status: PersonStatus
    consent_note: str | None = None
    contact_email: str | None = None


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class ReactionType(str, Enum):
    LIKE = "like"
    DISLIKE = "dislike"


# ───────────── PHOTO ─────────────
class PersonPhotoResponse(BaseModel):
    id: int
    file_path: str
    created_at: datetime
    model_config = {"from_attributes": True}


# ───────────── PERSON ─────────────
class PersonCreateRequest(BaseModel):
    name: str
    full_name: str
    phone: int | None = None
    email: str | None = None
    description: str | None = None
    instagram: str | None = None
    telegram: str | None = None
    birth_year: int | None = None
    birthday: date | None = None
    study_place: str | None = None
    work_place: str | None = None
    relationship_status: str | None = None
    gender: Gender = Gender.OTHER


class PersonUpdateRequest(BaseModel):
    name: str | None = None
    full_name: str | None = None
    phone: int | None = None
    email: str | None = None
    description: str | None = None
    instagram: str | None = None
    telegram: str | None = None
    birth_year: int | None = None
    birthday: date | None = None
    study_place: str | None = None
    work_place: str | None = None
    relationship_status: str | None = None
    gender: Gender | None = None


class PersonResponse(BaseModel):
    id: int
    name: str
    full_name: str
    phone: int | None
    email: str | None
    description: str | None
    instagram: str | None
    telegram: str | None
    birth_year: int | None
    birthday: date | None
    study_place: str | None
    work_place: str | None
    relationship_status: str | None
    gender: Gender
    likes_count: int
    dislikes_count: int
    rating: int
    photos: list[PersonPhotoResponse]
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    status: PersonStatus = PersonStatus.PUBLISHED
    contact_email: str | None = None
    consent_note: str | None = None
    user_reaction: str | None = None
    model_config = {"from_attributes": True}


class PersonListResponse(BaseModel):
    id: int
    name: str
    full_name: str
    gender: Gender
    likes_count: int
    dislikes_count: int
    rating: int
    photos: list[PersonPhotoResponse]
    status: PersonStatus = PersonStatus.PUBLISHED
    user_reaction: str | None = None
    model_config = {"from_attributes": True}


# ───────────── REACTION ─────────────
class ReactionRequest(BaseModel):
    type: ReactionType


class ReactionResponse(BaseModel):
    id: int
    type: ReactionType
    user_id: int
    person_id: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ───────────── COMMENT ─────────────
class CommentCreateRequest(BaseModel):
    text: str


class CommentUpdateRequest(BaseModel):
    text: str


class CommentResponse(BaseModel):
    id: int
    text: str
    user_id: int
    person_id: int
    created_at: datetime
    deleted_at: datetime | None
    model_config = {"from_attributes": True}