from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.analytics import Analytics
from app.models.url import URL
from app.schemas.url import UrlUpdate
from app.utils import short_code_generation


class UrlService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        original_url: str,
        user_id: UUID,
    ):
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

    async def get_all(
        self,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0,
        query: str = "",
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ):
        from sqlmodel import or_

        stmt = select(URL).where(URL.user_id == user_id)
        
        if query:
            search_term = f"%{query}%"
            stmt = stmt.where(
                or_(
                    URL.short_code.ilike(search_term),
                    URL.original_url.ilike(search_term),
                )
            )

        if sort_by == "clicks":
            order_col = URL.clicks
        else:
            order_col = URL.created_at

        if sort_order == "asc":
            stmt = stmt.order_by(order_col.asc())
        else:
            stmt = stmt.order_by(order_col.desc())

        result = await self.session.execute(stmt.offset(offset).limit(limit))
        return result.scalars().all()

    async def get_url(self, short_code: str, user_id: UUID):
        result = await self.session.execute(
            select(URL).where(URL.short_code == short_code, URL.user_id == user_id)
        )
        url = result.scalar_one_or_none()

        if not url:
            raise HTTPException(status_code=404, detail="URL Not Found")

        return url

    async def redirect_to_url(self, short_code: str, ip_address: str, user_agent: str):
        # Step 1: Find the URL in the database using the short code
        result = await self.session.execute(
            select(URL).where(URL.short_code == short_code)
        )
        url = result.scalar_one_or_none()

        # Step 2: If no URL was found, return a 404 error
        if not url:
            raise HTTPException(status_code=404, detail="URL Not Found")

        # Step 3: Add 1 to the click counter
        url.clicks += 1

        # Step 4: Create a new analytics record to log who visited
        new_analytic = Analytics(
            url_id=url.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.session.add(new_analytic)

        # Step 5: Save both the updated click count AND the new analytics log at the same time
        await self.session.commit()

        return url

    async def delete_url(self, short_code: str, user_id: UUID):
        result = await self.session.execute(
            select(URL).where(URL.short_code == short_code, URL.user_id == user_id)
        )
        url = result.scalar_one_or_none()

        if not url:
            raise HTTPException(status_code=404, detail="URL Not Found")

        await self.session.delete(url)
        await self.session.commit()

        return {"message": "URL deleted successfully"}

    async def update_url(self, short_code: str, user_id: UUID, data: UrlUpdate):
        result = await self.session.execute(
            select(URL).where(URL.short_code == short_code, URL.user_id == user_id)
        )
        url = result.scalar_one_or_none()

        if not url:
            raise HTTPException(status_code=404, detail="URL Not Found")

        url.original_url = data.original_url  # type: ignore
        url.updated_at = datetime.now()

        await self.session.commit()
        await self.session.refresh(url)

        return url

    async def get_analytics(self, short_code: str, user_id: UUID):
        result = await self.session.execute(
            select(URL).where(URL.short_code == short_code, URL.user_id == user_id)
        )
        url = result.scalar_one_or_none()

        if not url:
            raise HTTPException(status_code=404, detail="URL Not Found")

        analytics_result = await self.session.execute(
            select(Analytics).where(Analytics.url_id == url.id)
        )
        return analytics_result.scalars().all()
