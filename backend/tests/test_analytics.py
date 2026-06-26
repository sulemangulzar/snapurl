"""Tests for the analytics endpoint."""
import pytest
from tests.conftest import auth_headers, create_user

pytestmark = pytest.mark.asyncio

VALID_URL = "https://example.com"


async def _setup_link(client):
    await create_user(client)
    headers = await auth_headers(client)
    res = await client.post("/api/url/create", json={"original_url": VALID_URL}, headers=headers)
    return res.json()["short_code"], headers


async def test_analytics_empty_before_clicks(client):
    short_code, headers = await _setup_link(client)
    res = await client.get(f"/api/url/{short_code}/analytics", headers=headers)
    assert res.status_code == 200
    assert res.json() == []


async def test_analytics_records_created_on_redirect(client):
    short_code, headers = await _setup_link(client)

    # Trigger 2 redirects
    await client.get(f"/{short_code}", follow_redirects=False)
    await client.get(f"/{short_code}", follow_redirects=False)

    res = await client.get(f"/api/url/{short_code}/analytics", headers=headers)
    assert res.status_code == 200
    records = res.json()
    assert len(records) == 2
    for record in records:
        assert "clicked_at" in record
        assert "ip_address" in record
        assert "user_agent" in record


async def test_analytics_not_accessible_by_other_user(client):
    short_code, _ = await _setup_link(client)

    await create_user(client, email="other@example.com")
    other_headers = await auth_headers(client, email="other@example.com")

    res = await client.get(f"/api/url/{short_code}/analytics", headers=other_headers)
    assert res.status_code == 404


async def test_analytics_unauthenticated(client):
    short_code, _ = await _setup_link(client)
    res = await client.get(f"/api/url/{short_code}/analytics")
    assert res.status_code == 401
