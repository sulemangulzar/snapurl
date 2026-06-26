"""
Shared pytest fixtures for SnapURL tests.

Uses an in-memory SQLite database so no real PostgreSQL instance is needed.
Rate limiting is disabled automatically in TESTING mode.
"""
import os

# Must be set BEFORE importing anything from the app so pydantic-settings picks it up.
os.environ.setdefault("TESTING", "true")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("ALLOWED_ORIGINS", '["http://localhost:5173"]')
os.environ.setdefault("BASE_URL", "http://localhost:8000")

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.database import get_session

# Import all models so SQLModel knows their schemas
import app.models.user  # noqa: F401
import app.models.url   # noqa: F401
import app.models.analytics  # noqa: F401

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(db_engine):
    """HTTPX async client wired to the FastAPI app with a test DB session."""
    session_factory = async_sessionmaker(
        bind=db_engine, class_=AsyncSession, expire_on_commit=False
    )

    async def override_get_session():
        async with session_factory() as session:
            yield session

    from main import app
    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ── Helpers ───────────────────────────────────────────────────────────────────

async def create_user(client, name="Test User", email="test@example.com", password="password123"):
    """Register a user and return the response JSON."""
    res = await client.post("/auth/signup", json={"name": name, "email": email, "password": password})
    return res


async def login_user(client, email="test@example.com", password="password123"):
    """Login and return the access token."""
    res = await client.post(
        "/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    return res.json()


async def auth_headers(client, email="test@example.com", password="password123"):
    """Return Authorization headers for a pre-registered user."""
    data = await login_user(client, email, password)
    return {"Authorization": f"Bearer {data['access_token']}"}

