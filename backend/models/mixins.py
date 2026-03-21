from datetime import datetime
from typing import Any, Dict
from sqlalchemy import BigInteger, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy import func

class IDMixin:
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class AuditMixin:
    created_by: Mapped[int | None] = mapped_column(nullable=True)
    updated_by: Mapped[int | None] = mapped_column(nullable=True)
    deleted_by: Mapped[int | None] = mapped_column(nullable=True)

class ActiveMixin:
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

class MetaMixin:
    meta: Mapped[Dict[str, Any]] = mapped_column(MutableDict.as_mutable(JSONB), default=dict, nullable=False)

class ConfirmMixin:
    is_confirm: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)