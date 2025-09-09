"""Main FastAPI application for KraiNode."""

import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response, FileResponse
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
    logger.info("Starting KraiNode", service=settings.service_name)
    
    yield
    
    # Shutdown
    logger.info("Shutting down KraiNode")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    settings = get_settings()
    
    app = FastAPI(
        title="KraiNode",
        description="JSON-RPC proxy with rate limiting and metrics",
        version="1.0.0",
        lifespan=lifespan
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
    
    @app.api_route("/readyz", methods=["GET","HEAD"])
    def readyz():
        return {"ok": True}

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
    
    # Serve static files (frontend)
    try:
        # Mount static assets (CSS, JS, images, etc.)
        app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
        app.mount("/images", StaticFiles(directory="static/images"), name="images")
        
        # --- (serves root-level files like /favicon.ico) ----
        ROOT_STATIC = {
            "/favicon.ico": ("static/favicon.ico", "image/x-icon"),
            "/site.webmanifest": ("static/site.webmanifest", "application/manifest+json"),
            "/apple-touch-icon.png": ("static/apple-touch-icon.png", "image/png"),
            "/favicon-16x16.png": ("static/favicon-16x16.png", "image/png"),
            "/favicon-32x32.png": ("static/favicon-32x32.png", "image/png"),
            "/safari-pinned-tab.svg": ("static/safari-pinned-tab.svg", "image/svg+xml"),
            "/og.png": ("static/og.png", "image/png"),
        }

        def _make_static_route(file_path: str, media_type: str):
            async def _serve():
                return FileResponse(file_path, media_type=media_type)
            return _serve

        for route, (fp, mt) in ROOT_STATIC.items():
            app.add_api_route(route, _make_static_route(fp, mt), methods=["GET"])
        
        # Catch-all route for SPA - serve index.html for any non-API routes
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            """Serve the SPA for any non-API routes."""
            # Don't serve SPA for API routes
            if full_path.startswith("api/") or full_path.startswith("metrics") or full_path.startswith("healthz"):
                return JSONResponse(
                    status_code=404,
                    content={"detail": "Not found"}
                )
            
            # Serve index.html for all other routes (SPA routing)
            return FileResponse("static/index.html")
            
    except RuntimeError:
        # Static files not available (development mode)
        pass
    
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
