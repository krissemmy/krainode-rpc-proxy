"""RPC handler with authentication and logging for KraiNode."""

import json
import time
from typing import Any, Dict

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.auth import get_current_user
from app.db import SessionLocal
from app.rpc import rpc_forward, resolve_upstream
from app.schemas.rpc import JsonRpcRequest

router = APIRouter()

# Sensitive keys to redact from params
SENSITIVE_KEYS = {
    "privatekey", "private_key", "pk", "secret", "bearer", 
    "authorization", "auth", "token", "password", "passwd"
}


def redact(obj: Any) -> Any:
    """Recursively redact sensitive data from objects."""
    if isinstance(obj, dict):
        return {k: ("***" if k.lower() in SENSITIVE_KEYS else redact(v)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [redact(v) for v in obj]
    return obj


@router.post("/api/rpc/{chain}/{network}/json")
async def proxy_rpc(chain: str, network: str, request: Request, user=Depends(get_current_user)):
    """Proxy JSON-RPC request with authentication and logging."""
    start_time = time.perf_counter()
    
    try:
        # Parse and validate JSON-RPC request
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON")

        # Validate JSON-RPC request structure
        try:
            rpc_request = JsonRpcRequest(**body)
        except Exception as e:
            error_response = {
                "jsonrpc": "2.0",
                "id": body.get("id"),
                "error": {
                    "code": -32600,
                    "message": f"Invalid Request: {str(e)}"
                }
            }
            return JSONResponse(status_code=400, content=error_response)

        method = rpc_request.method
        params = rpc_request.params or []
        
        # Resolve upstream URL (using chain only for now, ignoring network)
        try:
            upstream_url = await resolve_upstream(chain)
        except HTTPException as e:
            return JSONResponse(status_code=e.status_code, content={"detail": e.detail})

        # Forward request to upstream
        try:
            status_code, response_body, duration_ms = await rpc_forward(upstream_url, body)
        except Exception as e:
            duration_ms = (time.perf_counter() - start_time) * 1000
            error_response = {
                "jsonrpc": "2.0",
                "id": body.get("id"),
                "error": {
                    "code": -32603,
                    "message": f"Internal error: {str(e)}"
                }
            }
            status_code = 500
            response_body = error_response

        # Calculate response size
        response_bytes = len(json.dumps(response_body).encode("utf-8"))
        
        # Extract error text if present
        error_text = None
        if isinstance(response_body, dict) and "error" in response_body:
            error_text = response_body["error"].get("message", "Unknown error")

        # Redact sensitive parameters for logging
        safe_params = redact(params)

        # Log the request to database (if available)
        if SessionLocal:
            try:
                async with SessionLocal() as s:
                    await s.execute(
                        text("""
                          insert into public.api_requests
                            (user_id, path, chain, network, method, status_code, duration_ms, response_bytes, error_text, params)
                          values
                            (:user_id, :path, :chain, :network, :method, :status_code, :duration_ms, :response_bytes, :error_text, :params::jsonb)
                        """),
                        {
                            "user_id": user["user_id"],
                            "path": str(request.url.path),
                            "chain": chain,
                            "network": network,
                            "method": method,
                            "status_code": status_code,
                            "duration_ms": int(duration_ms),
                            "response_bytes": response_bytes,
                            "error_text": error_text,
                            "params": json.dumps(safe_params),
                        },
                    )
                    await s.commit()
            except Exception as e:
                print(f"Warning: Failed to log request to database: {e}")

        return JSONResponse(response_body, status_code=status_code)
        
    except Exception as e:
        duration_ms = (time.perf_counter() - start_time) * 1000
        error_response = {
            "jsonrpc": "2.0",
            "id": body.get("id") if 'body' in locals() else None,
            "error": {
                "code": -32603,
                "message": f"Internal error: {str(e)}"
            }
        }
        return JSONResponse(status_code=500, content=error_response)
