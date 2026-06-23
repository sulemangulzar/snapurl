from fastapi import APIRouter, Depends

from app.dependencies import SessionDep, get_current_user
from app.models.user import User
from app.schemas.url import UrlCreate, UrlResponse
from app.services.url import UrlService

router = APIRouter(prefix="/api/url", tags=["URLs"])


@router.post("/create", response_model=UrlResponse)
async def create_short_code(
    data: UrlCreate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    service = UrlService(session)
    return await service.create(data.original_url, current_user.id)
