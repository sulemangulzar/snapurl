from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.analytics import Analytics
    from app.models.user import User


class URL(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    original_url: str = Field(nullable=False)

    short_code: str = Field(nullable=False, unique=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)

    updated_at: datetime = Field(default_factory=datetime.utcnow)

    clicks: int = Field(default=0)

    user_id: UUID = Field(foreign_key="user.id")

    user: "User" = Relationship(back_populates="urls")

    analytics: list["Analytics"] = Relationship(back_populates="url")
