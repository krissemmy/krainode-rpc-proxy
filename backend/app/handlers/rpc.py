"""RPC handler with authentication and logging for KraiNode."""

import json
import time
from typing import Any, Dict

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.auth import get_current_user
from app.db import SessionLocal

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
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    method = (body.get("method") or "").strip()
    params = body.get("params", [])
    started = time.perf_counter()

    # TODO: Forward upstream here, capture real status & response
    # For now, return a mock response
    status_code = 200
    resp_payload = {
        "jsonrpc": "2.0",
        "result": "0x123",
        "id": body.get("id")
    }

    duration_ms = int((time.perf_counter() - started) * 1000)
    response_bytes = len(json.dumps(resp_payload).encode("utf-8"))
    error_text = None  # set on failure

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
                        "duration_ms": duration_ms,
                        "response_bytes": response_bytes,
                        "error_text": error_text,
                        "params": json.dumps(safe_params),
                    },
                )
                await s.commit()
        except Exception as e:
            print(f"Warning: Failed to log request to database: {e}")

    return JSONResponse(resp_payload, status_code=status_code)
