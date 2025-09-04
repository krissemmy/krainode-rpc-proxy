"""Configuration management for KraiNode."""

import json
import os
from typing import Dict, List, Optional

from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Core service settings
    service_name: str = Field(default="krainode", env="SERVICE_NAME")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    allowed_origins: List[str] = Field(default=["*"], env="ALLOWED_ORIGINS")
    
    # Rate limiting
    rate_limit_rps: float = Field(default=5.0, env="RATE_LIMIT_RPS")
    
    # Chains configuration (JSON string)
    chains_json: str = Field(
        default='{"ethereum":"https://ethereum-rpc.publicnode.com"}',
        env="CHAINS_JSON"
    )
    
    # HTTP client settings
    request_timeout_seconds: float = Field(default=20.0, env="REQUEST_TIMEOUT_SECONDS")
    
    # Parsed chains (computed property)
    _chains: Optional[Dict[str, str]] = None
    
    @validator("allowed_origins", pre=True)
    def parse_allowed_origins(cls, v):
        """Parse ALLOWED_ORIGINS from JSON string or list."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [v]  # Single origin as string
        return v
    
    @validator("chains_json", pre=True)
    def validate_chains_json(cls, v):
        """Validate that chains_json is valid JSON."""
        if isinstance(v, str):
            try:
                json.loads(v)
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON in CHAINS_JSON: {e}")
        return v
    
    @property
    def chains(self) -> Dict[str, str]:
        """Get parsed chains configuration."""
        if self._chains is None:
            self._chains = json.loads(self.chains_json)
        return self._chains
    
    def get_upstream_url(self, chain: str) -> Optional[str]:
        """Get upstream URL for a chain."""
        return self.chains.get(chain)
    
    def get_available_chains(self) -> List[str]:
        """Get list of available chain slugs."""
        return list(self.chains.keys())
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get application settings (singleton pattern)."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


def reload_settings() -> Settings:
    """Reload settings from environment (useful for testing)."""
    global _settings
    _settings = Settings()
    return _settings
