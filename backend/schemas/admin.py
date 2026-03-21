from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Any, Dict


# ───────────── USER ─────────────

class AdminUserResponse(BaseModel):
    id: int
    email: str
    username: str | None
    phone: int | None
    balance: int
    is_moderator: bool
    is_admin: bool
    is_active: bool
    is_confirm: bool
    last_login: datetime | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    meta: Dict[str, Any]

    model_config = {"from_attributes": True}


class AdminUserCreateRequest(BaseModel):
    email: EmailStr
    password: str
    username: str | None = None
    phone: int | None = None
    is_moderator: bool = False
    is_admin: bool = False
    is_active: bool = True
    is_confirm: bool = True


class AdminUserUpdateRequest(BaseModel):
    email: EmailStr | None = None
    username: str | None = None
    phone: int | None = None
    balance: int | None = None
    is_moderator: bool | None = None
    is_admin: bool | None = None
    is_active: bool | None = None
    is_confirm: bool | None = None


class AdminSetRoleRequest(BaseModel):
    is_moderator: bool
    is_admin: bool


# ───────────── PERSON ─────────────

class AdminPersonCreateRequest(BaseModel):
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
    gender: str = "other"


class AdminPersonUpdateRequest(BaseModel):
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
    gender: str | None = None
    deleted_at: datetime | None = None  # для восстановления


# ───────────── COMMENT ─────────────

class AdminCommentUpdateRequest(BaseModel):
    text: str | None = None
    deleted_at: datetime | None = None