"""Tests for URL CRUD endpoints."""
import pytest
from tests.conftest import auth_headers, create_user

pytestmark = pytest.mark.asyncio

VALID_URL = "https://example.com/some/very/long/path"


async def _setup(client):
    await create_user(client)
    return await auth_headers(client)


async def test_create_url(client):
    headers = await _setup(client)
    res = await client.post("/api/url/create", json={"original_url": VALID_URL}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "short_code" in data
    assert data["original_url"] == VALID_URL
    assert data["clicks"] == 0


async def test_create_url_without_scheme(client):
    """URL without scheme should be accepted and normalised."""
    headers = await _setup(client)
    res = await client.post("/api/url/create", json={"original_url": "example.com"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["original_url"].startswith("https://")


async def test_create_url_javascript_scheme_blocked(client):
    headers = await _setup(client)
    res = await client.post(
        "/api/url/create",
        json={"original_url": "javascript:alert(1)"},
        headers=headers,
    )
    assert res.status_code == 422


async def test_create_url_private_ip_blocked(client):
    headers = await _setup(client)
    res = await client.post(
        "/api/url/create",
        json={"original_url": "http://192.168.1.1/admin"},
        headers=headers,
    )
    assert res.status_code == 422


async def test_create_url_localhost_blocked(client):
    headers = await _setup(client)
    res = await client.post(
        "/api/url/create",
        json={"original_url": "http://localhost:8000/secret"},
        headers=headers,
    )
    assert res.status_code == 422


async def test_list_urls(client):
    headers = await _setup(client)
    await client.post("/api/url/create", json={"original_url": VALID_URL}, headers=headers)
    await client.post("/api/url/create", json={"original_url": "https://google.com"}, headers=headers)

    res = await client.get("/api/url/urls", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 2


async def test_list_urls_pagination(client):
    headers = await _setup(client)
    for i in range(5):
        await client.post("/api/url/create", json={"original_url": f"https://example.com/{i}"}, headers=headers)

    res = await client.get("/api/url/urls?limit=3&offset=0", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 3

    res2 = await client.get("/api/url/urls?limit=3&offset=3", headers=headers)
    assert res2.status_code == 200
    assert len(res2.json()) == 2


async def test_list_urls_unauthenticated(client):
    res = await client.get("/api/url/urls")
    assert res.status_code == 401


async def test_get_single_url(client):
    headers = await _setup(client)
    create_res = await client.post("/api/url/create", json={"original_url": VALID_URL}, headers=headers)
    short_code = create_res.json()["short_code"]

    res = await client.get(f"/api/url/{short_code}", headers=headers)
    assert res.status_code == 200
    assert res.json()["short_code"] == short_code


async def test_get_single_url_not_found(client):
    headers = await _setup(client)
    res = await client.get("/api/url/nonexistent123", headers=headers)
    assert res.status_code == 404


async def test_update_url(client):
    headers = await _setup(client)
    create_res = await client.post("/api/url/create", json={"original_url": VALID_URL}, headers=headers)
    short_code = create_res.json()["short_code"]

    res = await client.put(
        f"/api/url/{short_code}",
        json={"original_url": "https://updated.com"},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["original_url"] == "https://updated.com"


async def test_update_url_not_owner(client):
    """User B cannot update User A's links."""
    await create_user(client, email="user_a@example.com")
    headers_a = await auth_headers(client, email="user_a@example.com")

    create_res = await client.post("/api/url/create", json={"original_url": VALID_URL}, headers=headers_a)
    short_code = create_res.json()["short_code"]

    # Create and login as User B
    await create_user(client, email="user_b@example.com")
    headers_b = await auth_headers(client, email="user_b@example.com")

    res = await client.put(
        f"/api/url/{short_code}",
        json={"original_url": "https://hacked.com"},
        headers=headers_b,
    )
    assert res.status_code == 404


async def test_delete_url(client):
    headers = await _setup(client)
    create_res = await client.post("/api/url/create", json={"original_url": VALID_URL}, headers=headers)
    short_code = create_res.json()["short_code"]

    res = await client.delete(f"/api/url/{short_code}", headers=headers)
    assert res.status_code == 200

    # Confirm it's gone
    get_res = await client.get(f"/api/url/{short_code}", headers=headers)
    assert get_res.status_code == 404


async def test_delete_url_not_owner(client):
    await create_user(client, email="owner@example.com")
    headers_owner = await auth_headers(client, email="owner@example.com")
    create_res = await client.post("/api/url/create", json={"original_url": VALID_URL}, headers=headers_owner)
    short_code = create_res.json()["short_code"]

    await create_user(client, email="attacker@example.com")
    headers_attacker = await auth_headers(client, email="attacker@example.com")

    res = await client.delete(f"/api/url/{short_code}", headers=headers_attacker)
    assert res.status_code == 404
