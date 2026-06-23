from datetime import datetime
from typing import TYPE_CHECKING, List
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

from app.models.url import URL

if TYPE_CHECKING:
    from app.models.analytics import Analytics


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    name: str = Field(unique=True, nullable=False)
    email: str = Field(unique=True, nullable=False)
    hashed_password: str = Field(nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow)

    urls: list["URL"] = Relationship(back_populates="user")

    analytics: list["Analytics"] = Relationship(back_populates="user")
