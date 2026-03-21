from enum import Enum
from sqlalchemy import String, Enum as SQLEnum, Text, Date, ForeignKey, UniqueConstraint, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base
from models.mixins import IDMixin, TimestampMixin, MetaMixin, SoftDeleteMixin, AuditMixin
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from models.user import User

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class ReactionType(str, Enum):
    LIKE = "like"
    DISLIKE = "dislike"

class PersonStatus(str, Enum):
    PENDING = "pending"
    CONTACTED = "contacted"
    AGREED = "agreed"
    REJECTED = "rejected"
    PUBLISHED = "published"


class PersonPhoto(Base, IDMixin, TimestampMixin):
    __tablename__ = "person_photos"

    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    person_id: Mapped[int] = mapped_column(ForeignKey("persons.id"), nullable=False)

    # Связь обратно к Person
    person: Mapped["Person"] = relationship("Person", back_populates="photos")

class Person(Base, IDMixin, TimestampMixin, MetaMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = "persons"

    name: Mapped[str] = mapped_column(String(256), nullable=False, default="Неизвестно")
    full_name: Mapped[str] = mapped_column(String(512), nullable=False, default="Неизвестно")
    phone: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    email: Mapped[str | None] = mapped_column(String(256), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    instagram: Mapped[str | None] = mapped_column(String(256), nullable=True)
    telegram: Mapped[str | None] = mapped_column(String(256), nullable=True)

    birth_year: Mapped[int | None] = mapped_column(nullable=True)
    birthday: Mapped[Date | None] = mapped_column(Date, nullable=True)

    study_place: Mapped[str | None] = mapped_column(String(512), nullable=True)
    work_place: Mapped[str | None] = mapped_column(String(512), nullable=True)
    relationship_status: Mapped[str | None] = mapped_column(String(256), nullable=True)

    gender: Mapped[Gender] = mapped_column(SQLEnum(Gender), nullable=False, default=Gender.OTHER)
    # SQLAlchemy Enum с явным значением
    status: Mapped[PersonStatus] = mapped_column(
        SQLEnum(PersonStatus, name="personstatus", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        default=PersonStatus.PUBLISHED
    )  
    contact_email: Mapped[str | None] = mapped_column(String(256), nullable=True)
    consent_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    photos: Mapped[List[PersonPhoto]] = relationship(
        "PersonPhoto",
        back_populates="person",
        cascade="all, delete-orphan"
    )
    reactions: Mapped[List["PersonReaction"]] = relationship(back_populates="person", cascade="all, delete-orphan")
    comments: Mapped[List["PersonComment"]] = relationship(
        back_populates="person",
        cascade="all, delete-orphan"
    )
    @property
    def likes_count(self) -> int:
        return sum(1 for r in self.reactions if r.type == ReactionType.LIKE)

    @property
    def dislikes_count(self) -> int:
        return sum(1 for r in self.reactions if r.type == ReactionType.DISLIKE)

    @property
    def rating(self) -> int:
        return self.likes_count - self.dislikes_count



class PersonReaction(Base, IDMixin, TimestampMixin):
    __tablename__ = "person_reactions"

    person_id: Mapped[int] = mapped_column(ForeignKey("persons.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    type: Mapped[ReactionType] = mapped_column(SQLEnum(ReactionType), nullable=False)

    person: Mapped[Person] = relationship(back_populates="reactions")
    user: Mapped["User"] = relationship(back_populates="reactions")

    __table_args__ = (
        UniqueConstraint("person_id", "user_id", name="uq_person_user_reaction"),
    )


class PersonComment(Base, IDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "person_comments"

    person_id: Mapped[int] = mapped_column(ForeignKey("persons.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    person: Mapped["Person"] = relationship(back_populates="comments")
    user: Mapped["User"] = relationship(back_populates="comments")