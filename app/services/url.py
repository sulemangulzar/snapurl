from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.url import URL
from app.utils import short_code_generation


class UrlService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, original_url: str, user_id: UUID):
        short_code = None

        # Try 5 times to generate a unique short code
        for _ in range(5):
            code = short_code_generation()

            result = await self.session.execute(
                select(URL).where(URL.short_code == code)
            )

            existing = result.scalar_one_or_none()

            if existing is None:
                short_code = code
                break

        if short_code is None:
            raise HTTPException(
                status_code=500, detail="Could not generate unique short code"
            )

        new_url = URL(
            original_url=original_url,
            short_code=short_code,
            user_id=user_id,
        )

        self.session.add(new_url)
        await self.session.commit()
        await self.session.refresh(new_url)

        return new_url
