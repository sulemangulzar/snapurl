"""Tests for the public redirect endpoint."""
import pytest
from tests.conftest import auth_headers, create_user

pytestmark = pytest.mark.asyncio

VALID_URL = "https://example.com"


async def _create_link(client):
    await create_user(client)
    headers = await auth_headers(client)
    res = await client.post("/api/url/create", json={"original_url": VALID_URL}, headers=headers)
    return res.json()["short_code"]


async def test_redirect_success(client):
    short_code = await _create_link(client)
    # Follow=False so we can inspect the redirect response
    res = await client.get(f"/{short_code}", follow_redirects=False)
    assert res.status_code in (301, 302, 307, 308)
    assert VALID_URL in res.headers.get("location", "")


async def test_redirect_increments_click_count(client):
    await create_user(client)
    headers = await auth_headers(client)
    create_res = await client.post("/api/url/create", json={"original_url": VALID_URL}, headers=headers)
    short_code = create_res.json()["short_code"]

    # Hit the redirect endpoint 3 times
    for _ in range(3):
        await client.get(f"/{short_code}", follow_redirects=False)

    # Check click count via API
    res = await client.get(f"/api/url/{short_code}", headers=headers)
    assert res.json()["clicks"] == 3


async def test_redirect_unknown_short_code(client):
    res = await client.get("/nonexistent_code_xyz", follow_redirects=False)
    assert res.status_code == 404


async def test_health_endpoint(client):
    res = await client.get("/")
    assert res.status_code == 200
    assert b"healthy" in res.content
