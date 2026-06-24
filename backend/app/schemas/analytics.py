from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    url_id: UUID
    ip_address: str
    user_agent: str
    clicked_at: datetime
