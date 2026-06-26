"""
Shared rate limiter instance.
Defined here (inside the app package) so it can be imported by route modules
without creating a circular dependency on main.py.

When TESTING=true, the limiter is disabled so rate limits don't interfere with tests.
"""
import os

from slowapi import Limiter
from slowapi.util import get_remote_address

_is_testing = os.environ.get("TESTING", "false").lower() in ("1", "true", "yes")

limiter = Limiter(key_func=get_remote_address, enabled=not _is_testing)
