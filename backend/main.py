from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request, Response
from fastapi.responses import RedirectResponse
from scalar_fastapi import get_scalar_api_reference
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes import url, user
from app.database import create_all_tables, get_session
from app.services.url import UrlService


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_all_tables()
    yield


app = FastAPI(
    title="SnapURL API",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )


app.include_router(user.router)
app.include_router(url.router)


@app.get("/")
def health():
    return Response("healthy")


@app.get("/{short_code}", include_in_schema=False)
async def redirect_to_original(
    request: Request,
    short_code: str,
    session: AsyncSession = Depends(get_session),
):
    # Extract visitor's IP address and browser info from the request
    # request.client can sometimes be None (e.g. behind a proxy), so we use a fallback
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    service = UrlService(session)
    url = await service.redirect_to_url(short_code, ip_address, user_agent)

    # Send the visitor to the original destination URL
    return RedirectResponse(url.original_url)
