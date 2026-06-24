from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.services.url import UrlService
from app.services.user import UserService

oauth_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_user_service(session: SessionDep) -> UserService:
    return UserService(session)


userServiceDep = Annotated[UserService, Depends(get_user_service)]


async def get_current_user(
    token=Depends(oauth_scheme), session: AsyncSession = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=401, detail="Could not validate credentials"
    )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user_service = UserService(session)
    user = await user_service.get_by_id(UUID(user_id))

    if user is None:
        raise credentials_exception

    return user


def get_url_service(session: AsyncSession = Depends(get_session)):
    return UrlService(session)


UrlServiceDep = Annotated[UrlService, Depends(get_url_service)]
