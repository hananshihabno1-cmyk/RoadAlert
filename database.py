"""
Lazy Supabase client.

The client is created on first use, not at import time.
This allows FastAPI to start and serve non-database endpoints
(e.g. health check, YOLO inference) even when Supabase credentials
are not yet configured.
"""

import logging
from typing import Optional

from supabase import Client, create_client

from config import settings

logger = logging.getLogger(__name__)

_client: Optional[Client] = None


class _LazySupabaseClient:
    """
    Transparent proxy that defers Supabase client creation until first use.

    The router imports ``supabase`` from this module and calls methods on it
    directly (e.g. ``supabase.table(...)``, ``supabase.storage``).
    This proxy intercepts every attribute access, creates the real client
    on demand, then forwards the call — requiring zero changes in the router.
    """

    def _get_client(self) -> Client:
        global _client
        if _client is None:
            url = settings.SUPABASE_URL.lower()
            if (
                not settings.SUPABASE_URL
                or "placeholder" in url
                or "your_supabase_url" in url
                or not url.startswith("http")
            ):
                raise RuntimeError(
                    "Supabase is not configured. "
                    "Set SUPABASE_URL and SUPABASE_KEY in your .env file."
                )
            logger.info("Initializing Supabase client...")
            _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("Supabase client ready.")
        return _client

    def __getattr__(self, name: str):
        return getattr(self._get_client(), name)


supabase: Client = _LazySupabaseClient()  # type: ignore[assignment]
