from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm

from app.dependencies import get_current_user, userServiceDep
from app.limiter import limiter
from app.models.user import User
from app.schemas.user import RegisterUser, UserUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
@limiter.limit("5/minute")
async def signup(request: Request, user: RegisterUser, service: userServiceDep):
    return await service.create(user)


@router.post("/login")
@limiter.limit("10/minute")
async def login(
    request: Request,
    service: userServiceDep,
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    return await service.login(form_data.username, form_data.password)


@router.post("/refresh")
@limiter.limit("20/minute")
async def refresh_token(request: Request, service: userServiceDep):
    return await service.refresh(request)


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }


@router.put("/me")
async def update_me(
    user_data: UserUpdate,
    service: userServiceDep,
    current_user: User = Depends(get_current_user)
):
    return await service.update(current_user.id, user_data)

