"""Tests for authentication endpoints."""
import pytest
from tests.conftest import auth_headers, create_user, login_user

pytestmark = pytest.mark.asyncio


async def test_signup_success(client):
    res = await create_user(client)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "id" in data


async def test_signup_duplicate_email(client):
    await create_user(client)
    res = await create_user(client)  # Same email
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()


async def test_signup_empty_email(client):
    res = await client.post("/auth/signup", json={"name": "X", "email": "", "password": "pass123"})
    assert res.status_code == 422  # Pydantic validation (EmailStr)


async def test_login_success(client):
    await create_user(client)
    data = await login_user(client)
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


async def test_login_wrong_password(client):
    await create_user(client)
    res = await client.post(
        "/auth/login",
        data={"username": "test@example.com", "password": "wrongpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 401


async def test_login_unknown_user(client):
    res = await client.post(
        "/auth/login",
        data={"username": "nobody@example.com", "password": "pass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 401


async def test_me_authenticated(client):
    await create_user(client)
    headers = await auth_headers(client)
    res = await client.get("/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["email"] == "test@example.com"


async def test_me_unauthenticated(client):
    res = await client.get("/auth/me")
    assert res.status_code == 401


async def test_me_invalid_token(client):
    res = await client.get("/auth/me", headers={"Authorization": "Bearer this.is.garbage"})
    assert res.status_code == 401


async def test_refresh_token(client):
    await create_user(client)
    login_data = await login_user(client)
    refresh_token = login_data["refresh_token"]

    res = await client.post(
        "/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


async def test_refresh_with_access_token_fails(client):
    """Refresh endpoint must reject access tokens."""
    await create_user(client)
    login_data = await login_user(client)
    access_token = login_data["access_token"]

    res = await client.post(
        "/auth/refresh",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert res.status_code == 401
