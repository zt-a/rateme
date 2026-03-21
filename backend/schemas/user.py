from pydantic import BaseModel
from datetime import datetime


class UserResponse(BaseModel):
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

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    username: str | None = None
    phone: int | None = None


class UserDeactivateRequest(BaseModel):
    """Мягкое удаление — только помечаем"""
    pass