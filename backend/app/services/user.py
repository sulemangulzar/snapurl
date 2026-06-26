from uuid import UUID

import jwt
from fastapi import HTTPException, Request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.jwt import create_access_token, create_refresh_token, decode_token
from app.core.security import hashed_password, verify_password
from app.models.user import User
from app.schemas.user import RegisterUser, UserUpdate

class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, credentials: RegisterUser):
        try:
            if not credentials.email:
                raise HTTPException(status_code=400, detail="Email cannot be empty")

            result = await self.session.execute(
                select(User).where(User.email == credentials.email)
            )

            existing_user = result.scalar_one_or_none()

            if existing_user:
                raise HTTPException(status_code=400, detail="User already exists")

            user = User(
                name=credentials.name,
                email=str(credentials.email),
                hashed_password=hashed_password(credentials.password),
            )

            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)

            return {"id": user.id, "name": user.name, "email": user.email}
        except HTTPException:
            raise
        except SQLAlchemyError:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail="Database error while creating user")

    async def login(self, email, password):
        try:
            if not email:
                raise HTTPException(status_code=400, detail="Email cannot be empty")

            result = await self.session.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

            if not user or not verify_password(password, user.hashed_password):
                raise HTTPException(
                    status_code=401,
                    detail="Invalid email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            access_token = create_access_token({"sub": str(user.id)})
            refresh_token = create_refresh_token({"sub": str(user.id)})

            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
            }
        except HTTPException:
            raise
        except SQLAlchemyError:
            raise HTTPException(status_code=500, detail="Database error during login")

    async def refresh(self, request: Request):
        """Issue a new access token given a valid refresh token in the Authorization header."""
        credentials_exception = HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise credentials_exception

        token = auth_header.removeprefix("Bearer ").strip()

        try:
            payload = decode_token(token)
        except jwt.InvalidTokenError:
            raise credentials_exception

        if payload.get("type") != "refresh":
            raise credentials_exception

        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception

        user = await self.get_by_id(UUID(user_id))
        if user is None:
            raise credentials_exception

        new_access_token = create_access_token({"sub": str(user.id)})
        return {"access_token": new_access_token, "token_type": "bearer"}

    async def get_by_id(self, user_id: UUID):
        try:
            result = await self.session.execute(select(User).where(User.id == user_id))
            return result.scalar_one_or_none()
        except SQLAlchemyError:
            raise HTTPException(status_code=500, detail="Database error while fetching user")

    async def update(self, user_id: UUID, data: "UserUpdate"):
        try:
            user = await self.get_by_id(user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            if data.name is not None:
                user.name = data.name
            if data.email is not None:
                # Check for duplicate email if they are changing it
                if data.email != user.email:
                    result = await self.session.execute(select(User).where(User.email == str(data.email)))
                    if result.scalar_one_or_none():
                        raise HTTPException(status_code=400, detail="Email already registered")
                user.email = str(data.email)

            await self.session.commit()
            await self.session.refresh(user)

            return {"id": user.id, "name": user.name, "email": user.email}
        except HTTPException:
            raise
        except SQLAlchemyError:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail="Database error while updating user")


