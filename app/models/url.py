from typing import TYPE_CHECKING, List, Optional
from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.analytics import Analytics
    from app.models.qrcode import QRCode


class URL(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    original_url: str = Field(nullable=False)
    short_code: str = Field(nullable=False, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default=datetime.utcnow)
    clicks: int = Field(default=0)
    user_id: UUID = Field(foreign_key="user.id")
    user: "User" = Relationship(back_populates="urls")
    analytics: list["Analytics"] = Relationship(back_populates="url")
    qrcode: Optional["QRCode"] = Relationship(back_populates="url")
