from pydantic import BaseModel


class UrlCreate(BaseModel):
    original_url: str


class UrlResponse(BaseModel):
    original_url: str
    short_code: str
    clicks: int
