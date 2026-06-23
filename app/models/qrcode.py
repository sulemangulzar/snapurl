from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.url import URL


class QRCode(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    url_id: UUID = Field(foreign_key="url.id", nullable=False)
    qrcode_data: str = Field()  # Store as base64-encoded string or file path
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    url: Optional["URL"] = Relationship(back_populates="qrcode")
