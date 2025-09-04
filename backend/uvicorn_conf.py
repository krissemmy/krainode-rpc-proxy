"""Uvicorn configuration for KraiNode."""

import os
from uvicorn import Config


def get_uvicorn_config():
    """Get uvicorn configuration."""
    return Config(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        log_level=os.getenv("LOG_LEVEL", "info").lower(),
        access_log=True,
        reload=os.getenv("RELOAD", "false").lower() == "true"
    )
