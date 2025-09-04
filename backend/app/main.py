"""Main FastAPI application for KraiNode RPC Proxy."""

import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import uvicorn

from .config import get_settings
from .logging import setup_logging, get_logger
from .metrics import get_metrics
from .routers import rpc
from .schemas.rpc import HealthResponse


# Global startup time for uptime calculation
_startup_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    settings = get_settings()
    setup_logging(settings.log_level)
    logger = get_logger("startup")
    logger.info("Starting KraiNode RPC Proxy", service=settings.service_name)
    
    # Print startup information
    print_startup_info(settings)
    
    yield
    
    # Shutdown
    logger.info("Shutting down KraiNode RPC Proxy")


def print_startup_info(settings):
    """Print startup information and available endpoints."""
    print("\n" + "="*80)
    print("🚀 KraiNode RPC Proxy - Community Edition")
    print("="*80)
    print(f"📡 Service: {settings.service_name}")
    print(f"🌐 Port: 8000")
    print(f"⚡ Rate Limit: {settings.rate_limit_rps} req/s per IP per chain")
    print(f"🔗 Configured Chains: {len(settings.chains)}")
    
    print("\n📋 Available Endpoints:")
    print("  • Health Check: GET  /healthz")
    print("  • Metrics:      GET  /metrics")
    print("  • RPC Proxy:    POST /api/rpc/{chain}/json")
    print("  • Ping Test:    GET  /api/rpc/{chain}/ping")
    print("  • Chain List:   GET  /api/chains")
    
    print("\n🔗 Available Chains:")
    for chain_slug, upstream_url in settings.chains.items():
        print(f"  • {chain_slug}: /api/rpc/{chain_slug}/json")
    
    print("\n💡 Usage Examples:")
    print("  # Get latest block number")
    print("  curl -X POST http://localhost:8000/api/rpc/ethereum/json \\")
    print("    -H 'Content-Type: application/json' \\")
    print("    -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_blockNumber\",\"params\":[]}'")
    print()
    print("  # Ping test")
    print("  curl http://localhost:8000/api/rpc/ethereum/ping")
    print()
    print("  # Get chain list")
    print("  curl http://localhost:8000/api/chains")
    
    print("\n📊 Monitoring:")
    print("  • Prometheus metrics: http://localhost:8000/metrics")
    print("  • Health check: http://localhost:8000/healthz")
    
    print("\n🔧 Configuration:")
    print(f"  • Add more chains by updating CHAINS_JSON in .env")
    print(f"  • Adjust rate limits with RATE_LIMIT_RPS")
    print(f"  • View logs for request details")
    
    print("="*80)
    print("✅ KraiNode RPC Proxy is ready!")
    print("="*80 + "\n")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    settings = get_settings()
    
    app = FastAPI(
        title="KraiNode RPC Proxy",
        description="Community JSON-RPC proxy with rate limiting and metrics",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(rpc.router)
    
    # Health check endpoint
    @app.get("/healthz", response_model=HealthResponse)
    async def health_check():
        """Health check endpoint."""
        uptime = time.time() - _startup_time
        return HealthResponse(
            ok=True,
            service=settings.service_name,
            version="1.0.0",
            uptime=uptime
        )
    
    # Metrics endpoint
    @app.get("/metrics")
    async def metrics():
        """Prometheus metrics endpoint."""
        metrics_data, content_type = get_metrics()
        return Response(
            content=metrics_data,
            media_type=content_type
        )
    
    # Root endpoint with API information
    @app.get("/")
    async def root():
        """Root endpoint with API information."""
        return {
            "service": "KraiNode RPC Proxy",
            "version": "1.0.0",
            "description": "Community JSON-RPC proxy with rate limiting and metrics",
            "endpoints": {
                "health": "/healthz",
                "metrics": "/metrics", 
                "docs": "/docs",
                "rpc_proxy": "/api/rpc/{chain}/json",
                "ping": "/api/rpc/{chain}/ping",
                "chains": "/api/chains"
            },
            "available_chains": list(settings.chains.keys())
        }
    
    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.log_level.lower()
    )
