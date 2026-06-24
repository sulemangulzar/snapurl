from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.analytics import Analytics
from app.models.url import URL
from app.schemas.url import UrlUpdate
from app.utils import short_code_generation


class UrlService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, original_url: str, user_id: UUID):
        try:
            short_code = None

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
        except HTTPException:
            raise
        except SQLAlchemyError:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail="Database error while creating URL")

    async def get_all(self, user_id: UUID):
        try:
            result = await self.session.execute(select(URL).where(URL.user_id == user_id))
            urls = result.scalars().all()

            if not urls:
                raise HTTPException(status_code=404, detail="Urls Not Found")

            return urls
        except HTTPException:
            raise
        except SQLAlchemyError:
            raise HTTPException(status_code=500, detail="Database error while fetching URLs")

    async def get_url(self, short_code: str, user_id: UUID):
        try:
            result = await self.session.execute(
                select(URL).where(URL.short_code == short_code, URL.user_id == user_id)
            )
            url = result.scalar_one_or_none()

            if not url:
                raise HTTPException(status_code=404, detail="URL Not Found")

            return url
        except HTTPException:
            raise
        except SQLAlchemyError:
            raise HTTPException(status_code=500, detail="Database error while fetching URL")

    async def redirect_to_url(self, short_code: str, ip_address: str, user_agent: str):
        try:
            result = await self.session.execute(
                select(URL).where(URL.short_code == short_code)
            )
            url = result.scalar_one_or_none()

            if not url:
                raise HTTPException(status_code=404, detail="URL Not Found")

            url.clicks += 1

            new_analytic = Analytics(
                url_id=url.id,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            self.session.add(new_analytic)

            await self.session.commit()

            return url
        except HTTPException:
            raise
        except SQLAlchemyError:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail="Database error during redirect")

    async def delete_url(self, short_code: str, user_id: UUID):
        try:
            result = await self.session.execute(
                select(URL).where(URL.short_code == short_code, URL.user_id == user_id)
            )
            url = result.scalar_one_or_none()

            if not url:
                raise HTTPException(status_code=404, detail="URL Not Found")

            await self.session.delete(url)
            await self.session.commit()

            return {"message": "URL deleted successfully"}
        except HTTPException:
            raise
        except SQLAlchemyError:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail="Database error while deleting URL")

    async def update_url(self, short_code: str, user_id: UUID, data: UrlUpdate):
        try:
            result = await self.session.execute(
                select(URL).where(URL.short_code == short_code, URL.user_id == user_id)
            )
            url = result.scalar_one_or_none()

            if not url:
                raise HTTPException(status_code=404, detail="URL Not Found")

            url.original_url = data.original_url
            url.updated_at = datetime.utcnow()

            await self.session.commit()
            await self.session.refresh(url)

            return url
        except HTTPException:
            raise
        except SQLAlchemyError:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail="Database error while updating URL")

    async def get_analytics(self,short_code : str, user_id :UUID):
        try:
            result = await self.session.execute(
                select(URL).where(URL.short_code == short_code, URL.user_id == user_id)
            )
            url = result.scalar_one_or_none()

            if not url:
                raise HTTPException(status_code=404, detail="URL Not Found")

            result = await self.session.execute(
                select(Analytics).where(Analytics.url_id == url.id)
            )
            analytics = result.scalars().all()

            return analytics
        except HTTPException:
            raise
        except SQLAlchemyError:
            raise HTTPException(status_code=500, detail="Database error while fetching analytics")