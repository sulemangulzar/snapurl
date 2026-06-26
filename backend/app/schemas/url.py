import ipaddress
import re
from datetime import datetime
from urllib.parse import urlparse
from uuid import UUID

from pydantic import BaseModel, field_validator

# Schemes that must never be shortened
_BLOCKED_SCHEMES = {"javascript", "data", "vbscript", "file", "blob"}

# Private / loopback / link-local CIDR ranges
_PRIVATE_RANGES = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
]


def _validate_url(v: str) -> str:
    v = v.strip()

    # Check for blocked schemes BEFORE any normalization
    raw_lower = v.lower()
    for blocked in _BLOCKED_SCHEMES:
        if raw_lower.startswith(f"{blocked}:"):
            raise ValueError(f"URL scheme '{blocked}:' is not allowed.")

    # Prepend scheme if missing so urlparse works
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+\-.]*://", v):
        v = f"https://{v}"

    try:
        parsed = urlparse(v)
    except Exception:
        raise ValueError("Invalid URL format.")

    scheme = (parsed.scheme or "").lower()
    if scheme in _BLOCKED_SCHEMES:
        raise ValueError(f"URL scheme '{scheme}:' is not allowed.")

    if scheme not in ("http", "https"):
        raise ValueError("Only http and https URLs are allowed.")

    hostname = parsed.hostname or ""
    if not hostname:
        raise ValueError("URL must contain a valid hostname.")

    # Block localhost by name
    if hostname.lower() in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
        raise ValueError("Shortening local/internal addresses is not allowed.")

    # Block private IPs
    try:
        addr = ipaddress.ip_address(hostname)
        for private_range in _PRIVATE_RANGES:
            if addr in private_range:
                raise ValueError("Shortening private IP addresses is not allowed.")
    except ValueError as e:
        # If it's our own raised ValueError, re-raise it
        if "Shortening" in str(e):
            raise
        # Otherwise hostname is a domain name, which is fine

    return v



class UrlCreate(BaseModel):
    original_url: str

    @field_validator("original_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        return _validate_url(v)


class UrlResponse(BaseModel):
    id: UUID
    original_url: str
    short_code: str
    clicks: int
    created_at: datetime


class UrlUpdate(BaseModel):
    original_url: str

    @field_validator("original_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        return _validate_url(v)

