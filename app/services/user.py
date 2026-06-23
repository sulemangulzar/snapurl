from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.jwt import create_access_token
from app.core.security import hashed_password, verify_password
from app.models.user import User
from app.schemas.user import RegisterUser


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, credentials: RegisterUser):
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

        return user

    async def login(self, email, password):
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        # Use a vague message to prevent email enumeration attacks
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = create_access_token({"sub": str(user.id)})

        return {"access_token": token, "token_type": "bearer"}

    async def get_by_id(self, user_id: UUID):
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
