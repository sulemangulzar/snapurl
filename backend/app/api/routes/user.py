from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.dependencies import userServiceDep
from app.schemas.user import RegisterUser

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
async def signup(user: RegisterUser, service: userServiceDep):
    try:
        return await service.create(user)
    except Exception as e:
        raise e


@router.post("/login")
async def login(
    service: userServiceDep,
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    try:
        return await service.login(form_data.username, form_data.password)
    except Exception as e:
        raise e
