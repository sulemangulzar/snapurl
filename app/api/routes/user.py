from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.dependencies import userServiceDep
from app.schemas.user import RegisterUser

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
async def signup(user: RegisterUser, service: userServiceDep):
    return await service.create(user)


@router.post("/login")
async def login(
    service: userServiceDep,
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    return await service.login(form_data.username, form_data.password)
