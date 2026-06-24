from app.schemas.analytics import AnalyticsResponse
from fastapi import APIRouter, Depends

from app.dependencies import UrlServiceDep, get_current_user
from app.models.user import User
from app.schemas.url import UrlCreate, UrlResponse, UrlUpdate

router = APIRouter(prefix="/api/url", tags=["URLs"])


@router.post("/create", response_model=UrlResponse)
async def create_short_code(
    data: UrlCreate,
    service: UrlServiceDep,
    current_user: User = Depends(get_current_user),
):
    try:
        return await service.create(data.original_url, current_user.id)
    except Exception as e:
        raise e


@router.get("/urls", response_model=list[UrlResponse])
async def all_urls(
    service: UrlServiceDep, current_user: User = Depends(get_current_user)
):
    try:
        return await service.get_all(current_user.id)
    except Exception as e:
        raise e


@router.get("/{short_code}", response_model=UrlResponse)
async def get_single_url(
    short_code: str,
    service: UrlServiceDep,
    current_user: User = Depends(get_current_user),
):
    try:
        return await service.get_url(short_code, current_user.id)
    except Exception as e:
        raise e


@router.delete("/{short_code}")
async def delete_url(
    short_code: str,
    service: UrlServiceDep,
    current_user: User = Depends(get_current_user),
):
    try:
        return await service.delete_url(short_code, current_user.id)
    except Exception as e:
        raise e


@router.put("/{short_code}", response_model=UrlResponse)
async def update_url(
    short_code: str,
    data: UrlUpdate,
    service: UrlServiceDep,
    current_user: User = Depends(get_current_user),
):
    try:
        return await service.update_url(short_code, current_user.id, data)
    except Exception as e:
        raise e


@router.get("/{short_code}/analytics", response_model=list[AnalyticsResponse])
async def get_analytics(
    short_code: str,
    service: UrlServiceDep,
    current_user: User = Depends(get_current_user),
):  
    try:
        return await service.get_analytics(short_code, current_user.id)
    except Exception as e:
        raise e