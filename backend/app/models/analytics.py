from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.url import URL
    from app.models.user import User


class Analytics(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    url_id: UUID = Field(foreign_key="url.id", nullable=False)

    user_id: UUID | None = Field(default=None, foreign_key="user.id")

    clicked_at: datetime = Field(default_factory=datetime.utcnow)

    user_agent: str | None = None
    ip_address: str | None = None

    url: "URL" = Relationship(back_populates="analytics")

    user: "User" = Relationship(back_populates="analytics")
