"""Structured JSON logging configuration for KraiNode."""

import json
import logging
import sys
import time
import uuid
from typing import Any, Dict, Optional

import structlog
from fastapi import Request


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_entry = {
            "timestamp": time.time(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "service": getattr(record, "service", "krainode"),
        }
        
        # Add extra fields if present
        for key, value in record.__dict__.items():
            if key not in ("name", "msg", "args", "levelname", "levelno", "pathname", 
                          "filename", "module", "lineno", "funcName", "created", 
                          "msecs", "relativeCreated", "thread", "threadName", 
                          "processName", "process", "getMessage", "exc_info", 
                          "exc_text", "stack_info", "service"):
                log_entry[key] = value
        
        return json.dumps(log_entry, default=str)


def setup_logging(log_level: str = "INFO") -> None:
    """Set up structured JSON logging."""
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Configure standard library logging
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    root_logger.addHandler(handler)
    
    # Set specific loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)


def get_logger(name: str) -> structlog.BoundLogger:
    """Get a structured logger instance."""
    return structlog.get_logger(name)


class RequestContext:
    """Context manager for request-scoped logging."""
    
    def __init__(self, request: Request, chain: Optional[str] = None):
        self.request = request
        self.chain = chain
        self.trace_id = str(uuid.uuid4())
        self.start_time = time.time()
        self.logger = get_logger("request")
    
    def __enter__(self):
        """Enter request context."""
        # Set request context in structlog
        self.logger = self.logger.bind(
            trace_id=self.trace_id,
            client_ip=self.get_client_ip(),
            path=self.request.url.path,
            method=self.request.method,
            chain=self.chain,
        )
        return self.logger
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit request context."""
        duration_ms = int((time.time() - self.start_time) * 1000)
        
        if exc_type is None:
            self.logger.info(
                "Request completed",
                duration_ms=duration_ms,
                status_code=200,  # Will be overridden by actual status
            )
        else:
            self.logger.error(
                "Request failed",
                duration_ms=duration_ms,
                error=str(exc_val),
                exc_info=exc_tb,
            )
    
    def get_client_ip(self) -> str:
        """Get client IP address from request."""
        # Check for forwarded headers first
        forwarded_for = self.request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = self.request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct connection
        if hasattr(self.request.client, "host"):
            return self.request.client.host
        
        return "unknown"


def log_rpc_request(
    logger: structlog.BoundLogger,
    chain: str,
    method: str,
    status_code: int,
    duration_ms: int,
    error: Optional[str] = None,
) -> None:
    """Log RPC request with structured data."""
    log_data = {
        "chain": chain,
        "method": method,
        "status_code": status_code,
        "duration_ms": duration_ms,
    }
    
    if error:
        log_data["error"] = error
        logger.error("RPC request failed", **log_data)
    else:
        logger.info("RPC request completed", **log_data)
