"""Configuration management for KraiNode."""

import json
import os
from typing import Dict, List, Optional, Any

import yaml
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
    
    # Chains configuration file path
    chains_config_file: str = Field(
        default="chains.yaml",
        env="CHAINS_CONFIG_FILE"
    )
    
    # HTTP client settings
    request_timeout_seconds: float = Field(default=20.0, env="REQUEST_TIMEOUT_SECONDS")
    
    # Additional settings for backward compatibility
    reload: bool = Field(default=False, env="RELOAD")
    port: int = Field(default=8000, env="PORT")
    email: str = Field(default="", env="EMAIL")
    api_host: str = Field(default="", env="API_HOST")
    
    # Parsed chains (computed property)
    _chains: Optional[Dict[str, str]] = None
    _chains_config: Optional[Dict[str, Any]] = None
    
    @validator("allowed_origins", pre=True)
    def parse_allowed_origins(cls, v):
        """Parse ALLOWED_ORIGINS from JSON string or list."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [v]  # Single origin as string
        return v
    
    @validator("chains_config_file", pre=True)
    def validate_chains_config_file(cls, v):
        """Validate that chains config file exists and is valid YAML."""
        if isinstance(v, str):
            # Check if file exists
            if not os.path.exists(v):
                # Try relative to the backend directory
                backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                full_path = os.path.join(backend_dir, v)
                if not os.path.exists(full_path):
                    raise ValueError(f"Chains config file not found: {v}")
        return v
    
    @property
    def chains_config(self) -> Dict[str, Any]:
        """Get parsed chains configuration from YAML file."""
        if self._chains_config is None:
            # Load from YAML file
            config_path = self.chains_config_file
            if not os.path.isabs(config_path):
                # If relative path, make it relative to backend directory
                backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                config_path = os.path.join(backend_dir, config_path)
            
            try:
                with open(config_path, 'r') as f:
                    self._chains_config = yaml.safe_load(f)
            except yaml.YAMLError as e:
                raise ValueError(f"Invalid YAML in chains config file: {e}")
            except FileNotFoundError:
                raise ValueError(f"Chains config file not found: {config_path}")
        return self._chains_config
    
    @property
    def chains(self) -> Dict[str, str]:
        """Get flattened chains configuration for backward compatibility."""
        if self._chains is None:
            self._chains = self._flatten_chains_config()
        return self._chains
    
    def _flatten_chains_config(self) -> Dict[str, str]:
        """Flatten the hierarchical chains config to chain_slug -> url mapping."""
        flattened = {}
        for chain_name, networks in self.chains_config.items():
            if not isinstance(networks, dict):
                continue
            for network_name, providers in networks.items():
                if not isinstance(providers, dict):
                    continue
                # Use the first available provider URL
                for provider_name, url in providers.items():
                    if isinstance(url, str) and url:
                        chain_slug = f"{chain_name}-{network_name}"
                        flattened[chain_slug] = url
                        break  # Use first available provider
        return flattened
    
    def get_upstream_url(self, chain: str) -> Optional[str]:
        """Get upstream URL for a chain."""
        return self.chains.get(chain)
    
    def get_upstream_url_with_provider(self, chain: str, network: str, provider: str = None) -> Optional[str]:
        """Get upstream URL for a specific chain, network, and optional provider."""
        chains_config = self.chains_config
        if chain not in chains_config:
            return None
        
        networks = chains_config[chain]
        if not isinstance(networks, dict) or network not in networks:
            return None
        
        providers = networks[network]
        if not isinstance(providers, dict):
            return None
        
        if provider:
            return providers.get(provider)
        else:
            # Return first available provider
            for provider_name, url in providers.items():
                if isinstance(url, str) and url:
                    return url
        return None
    
    def get_available_chains(self) -> List[str]:
        """Get list of available chain slugs (flattened format)."""
        return list(self.chains.keys())
    
    def get_available_chain_networks(self) -> Dict[str, List[str]]:
        """Get available chain networks in hierarchical format."""
        result = {}
        for chain_name, networks in self.chains_config.items():
            if isinstance(networks, dict):
                result[chain_name] = list(networks.keys())
        return result
    
    def get_available_providers(self, chain: str, network: str) -> List[str]:
        """Get available providers for a specific chain and network."""
        chains_config = self.chains_config
        if chain not in chains_config:
            return []
        
        networks = chains_config[chain]
        if not isinstance(networks, dict) or network not in networks:
            return []
        
        providers = networks[network]
        if not isinstance(providers, dict):
            return []
        
        return [name for name, url in providers.items() if isinstance(url, str) and url]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields from .env file


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
