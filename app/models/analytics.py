from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

from app.models.url import URL

if TYPE_CHECKING:
    from app.models.user import User


class Analytics(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    url_id: UUID = Field(foreign_key="url.id", nullable=False)
    user_id: Optional[UUID] = Field(default=None, foreign_key="user.id")

    clicked_at: datetime = Field(default_factory=datetime.utcnow)
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None

    url: Optional["URL"] = Relationship(back_populates="analytics")

    user: Optional["User"] = Relationship(back_populates="analytics")
