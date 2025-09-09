"""Rate limiting implementation for KraiNode."""

import time
from typing import Dict, Tuple
from fastapi import HTTPException, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .config import get_settings
from .metrics import record_rate_limit_hit


# Global rate limiter instance
limiter = Limiter(key_func=get_remote_address)


def get_rate_limit_key(request: Request, chain: str) -> str:
    """Generate rate limit key for IP + chain combination."""
    client_ip = get_remote_address(request)
    return f"{client_ip}:{chain}"


def create_rate_limiter():
    """Create and configure rate limiter."""
    settings = get_settings()
    
    # Create limiter with custom key function
    limiter = Limiter(
        key_func=lambda request: get_remote_address(request),
        default_limits=[f"{settings.rate_limit_rps}/second"]
    )
    
    return limiter


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Custom rate limit exceeded handler."""
    # Extract chain from request path
    chain = "unknown"
    if hasattr(request, "path_params") and "chain" in request.path_params:
        chain = request.path_params["chain"]
    
    # Record metrics
    client_ip = get_remote_address(request)
    record_rate_limit_hit(chain, client_ip)
    
    # Calculate retry after
    retry_after = int(exc.retry_after) if exc.retry_after else 1
    
    # Return 429 with proper headers
    raise HTTPException(
        status_code=429,
        detail="Rate limit exceeded",
        headers={
            "Retry-After": str(retry_after),
            "X-RateLimit-Limit": str(get_settings().rate_limit_rps),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": str(int(time.time()) + retry_after)
        }
    )


# Simple in-memory token bucket implementation as fallback
class TokenBucket:
    """Simple token bucket rate limiter."""
    
    def __init__(self, rate: float, capacity: int = None):
        self.rate = rate  # tokens per second
        self.capacity = capacity or int(rate * 2)  # bucket capacity
        self.tokens = self.capacity
        self.last_update = time.time()
    
    def consume(self, tokens: int = 1) -> bool:
        """Try to consume tokens from bucket."""
        now = time.time()
        elapsed = now - self.last_update
        
        # Add tokens based on elapsed time
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        self.last_update = now
        
        # Check if we have enough tokens
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False


class PerChainRateLimiter:
    """Rate limiter that tracks limits per IP per chain."""
    
    def __init__(self, rate: float):
        self.rate = rate
        self.buckets: Dict[str, TokenBucket] = {}
        self.cleanup_interval = 300  # 5 minutes
        self.last_cleanup = time.time()
    
    def _get_key(self, client_ip: str, chain: str) -> str:
        """Generate key for IP + chain combination."""
        return f"{client_ip}:{chain}"
    
    def _cleanup_old_buckets(self):
        """Remove old unused buckets to prevent memory leaks."""
        now = time.time()
        if now - self.last_cleanup < self.cleanup_interval:
            return
        
        # Remove buckets that haven't been used in the last hour
        cutoff = now - 3600
        keys_to_remove = []
        
        for key, bucket in self.buckets.items():
            if bucket.last_update < cutoff:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.buckets[key]
        
        self.last_cleanup = now
    
    def is_allowed(self, client_ip: str, chain: str) -> Tuple[bool, float]:
        """Check if request is allowed and return retry delay if not."""
        self._cleanup_old_buckets()
        
        key = self._get_key(client_ip, chain)
        
        if key not in self.buckets:
            self.buckets[key] = TokenBucket(self.rate)
        
        bucket = self.buckets[key]
        
        if bucket.consume():
            return True, 0.0
        
        # Calculate retry delay
        retry_delay = (1.0 - bucket.tokens) / bucket.rate
        return False, max(0.0, retry_delay)


# Global rate limiter instance
_rate_limiter: PerChainRateLimiter = None


def get_rate_limiter() -> PerChainRateLimiter:
    """Get global rate limiter instance."""
    global _rate_limiter
    if _rate_limiter is None:
        settings = get_settings()
        _rate_limiter = PerChainRateLimiter(settings.rate_limit_rps)
    return _rate_limiter


def check_rate_limit(request: Request, chain: str) -> None:
    """Check rate limit for request and raise exception if exceeded."""
    client_ip = get_remote_address(request)
    rate_limiter = get_rate_limiter()
    
    allowed, retry_delay = rate_limiter.is_allowed(client_ip, chain)
    
    if not allowed:
        # Record metrics
        record_rate_limit_hit(chain, client_ip)
        
        # Raise 429 with retry-after header
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={
                "Retry-After": str(int(retry_delay) + 1),
                "X-RateLimit-Limit": str(get_settings().rate_limit_rps),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time()) + retry_delay + 1)
            }
        )
