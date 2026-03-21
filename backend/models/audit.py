from __future__ import annotations
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from typing import Any, Dict
from enum import Enum
from sqlalchemy import String, DateTime, BigInteger, ForeignKey, Index, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.mutable import MutableDict
from db.base import Base

class ActionType(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True, nullable=True)
    action: Mapped[ActionType] = mapped_column(SQLEnum(ActionType), index=True, nullable=False)
    table_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    row_id: Mapped[int | None] = mapped_column(BigInteger, index=True, nullable=True)
    old_data: Mapped[Dict[str, Any] | None] = mapped_column(MutableDict.as_mutable(JSONB), nullable=True)
    new_data: Mapped[Dict[str, Any] | None] = mapped_column(MutableDict.as_mutable(JSONB), nullable=True)
    ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)

    __table_args__ = (
        Index("ix_audit_table_row", "table_name", "row_id"),
    )