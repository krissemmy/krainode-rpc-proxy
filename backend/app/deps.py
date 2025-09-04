"""FastAPI dependencies for KraiNode."""

from fastapi import Depends
from .config import get_settings, Settings


def get_settings_dependency() -> Settings:
    """Dependency to get application settings."""
    return get_settings()
