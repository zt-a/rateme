from enum import Enum
from sqlalchemy import String, Text, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base
from models.mixins import IDMixin, TimestampMixin
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.user import User
    from models.person import Person

class ReportType(str, Enum):
    REMOVAL_REQUEST = "removal_request"  # запрос на удаление
    COMPLAINT = "complaint"              # жалоба
    INCORRECT_DATA = "incorrect_data"   # неверные данные
    OTHER = "other"                     # другое

class ReportStatus(str, Enum):
    PENDING = "pending"      # на рассмотрении
    REVIEWED = "reviewed"    # рассмотрено
    RESOLVED = "resolved"    # решено
    REJECTED = "rejected"    # отклонено

class Report(Base, IDMixin, TimestampMixin):
    __tablename__ = "reports"

    person_id: Mapped[int | None] = mapped_column(
        ForeignKey("persons.id"), nullable=True
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[str] = mapped_column(String(256), nullable=False)
    type: Mapped[ReportType] = mapped_column(
        SQLEnum(ReportType), nullable=False, default=ReportType.OTHER
    )
    status: Mapped[ReportStatus] = mapped_column(
        SQLEnum(ReportStatus), nullable=False, default=ReportStatus.PENDING
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)

    person: Mapped["Person | None"] = relationship("Person")
    user: Mapped["User | None"] = relationship("User")