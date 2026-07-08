from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from scalar_fastapi import get_scalar_api_reference
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes import qrcode, url, user
from app.config import settings
from app.database import get_session
from app.limiter import limiter
from app.services.url import UrlService


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tables are managed by Alembic migrations only — do NOT call create_all_tables() here.
    yield


app = FastAPI(
    title="SnapURL API",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )


app.include_router(user.router)
app.include_router(url.router)
app.include_router(qrcode.router)


@app.get("/")
def health():
    return Response("healthy")


@app.get("/{short_code}", include_in_schema=False)
@limiter.limit("60/minute")
async def redirect_to_original(
    request: Request,
    short_code: str,
    session: AsyncSession = Depends(get_session),
):
    service = UrlService(session)
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    url_obj = await service.redirect_to_url(short_code, ip_address, user_agent)
    target = url_obj.original_url

    if not target.startswith(("http://", "https://")):
        target = f"https://{target}"

    return RedirectResponse(target)
