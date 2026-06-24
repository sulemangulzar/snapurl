from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, HttpUrl


class UrlCreate(BaseModel):
    original_url: str


class UrlResponse(BaseModel):
    id: UUID
    original_url: HttpUrl
    short_code: str
    clicks: int
    created_at: datetime


class UrlUpdate(BaseModel):
    original_url: HttpUrl
