from __future__ import annotations
from typing import TYPE_CHECKING, List
from datetime import datetime
from sqlalchemy import String, BigInteger, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base
from models.mixins import IDMixin, TimestampMixin, ActiveMixin, SoftDeleteMixin, AuditMixin, MetaMixin, ConfirmMixin

if TYPE_CHECKING:
    from models.person import PersonReaction, PersonComment 
    from models.refresh_tokens import RefreshToken

class User(Base, IDMixin, TimestampMixin, ActiveMixin, SoftDeleteMixin, AuditMixin, MetaMixin, ConfirmMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(256), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(1024), nullable=False)
    username: Mapped[str | None] = mapped_column(String(256), unique=True, nullable=True)
    phone: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    balance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_moderator: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(back_populates="user", cascade="all, delete-orphan")


    reactions: Mapped[List[PersonReaction]] = relationship(back_populates="user", cascade="all, delete-orphan")
    comments: Mapped[List["PersonComment"]] = relationship(back_populates="user")