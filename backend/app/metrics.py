"""Prometheus metrics for KraiNode."""

from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from typing import Optional


# Request metrics
requests_total = Counter(
    "krainode_requests_total",
    "Total number of RPC requests",
    ["chain", "method", "status_code"]
)

request_duration_ms = Histogram(
    "krainode_request_duration_ms",
    "Request duration in milliseconds",
    ["chain", "method"],
    buckets=[1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
)

errors_total = Counter(
    "krainode_errors_total",
    "Total number of RPC errors",
    ["chain", "method", "error_type"]
)

# Rate limiting metrics
rate_limit_hits = Counter(
    "krainode_rate_limit_hits_total",
    "Total number of rate limit hits",
    ["chain", "client_ip"]
)

# Upstream connection metrics
upstream_requests_total = Counter(
    "krainode_upstream_requests_total",
    "Total number of upstream requests",
    ["chain", "upstream_url", "status_code"]
)

upstream_duration_ms = Histogram(
    "krainode_upstream_duration_ms",
    "Upstream request duration in milliseconds",
    ["chain", "upstream_url"],
    buckets=[1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
)


def record_request(
    chain: str,
    method: str,
    status_code: int,
    duration_ms: float,
    error_type: Optional[str] = None
) -> None:
    """Record RPC request metrics."""
    # Record request count
    requests_total.labels(
        chain=chain,
        method=method,
        status_code=str(status_code)
    ).inc()
    
    # Record duration
    request_duration_ms.labels(
        chain=chain,
        method=method
    ).observe(duration_ms)
    
    # Record error if present
    if error_type:
        errors_total.labels(
            chain=chain,
            method=method,
            error_type=error_type
        ).inc()


def record_rate_limit_hit(chain: str, client_ip: str) -> None:
    """Record rate limit hit."""
    rate_limit_hits.labels(
        chain=chain,
        client_ip=client_ip
    ).inc()


def record_upstream_request(
    chain: str,
    upstream_url: str,
    status_code: int,
    duration_ms: float
) -> None:
    """Record upstream request metrics."""
    upstream_requests_total.labels(
        chain=chain,
        upstream_url=upstream_url,
        status_code=str(status_code)
    ).inc()
    
    upstream_duration_ms.labels(
        chain=chain,
        upstream_url=upstream_url
    ).observe(duration_ms)


def get_metrics() -> tuple[bytes, str]:
    """Get Prometheus metrics in text format."""
    return generate_latest(), CONTENT_TYPE_LATEST
