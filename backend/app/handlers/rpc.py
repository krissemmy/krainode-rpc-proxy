"""RPC handler with authentication and logging for KraiNode."""

import time

from fastapi import APIRouter, Request, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from app.auth import get_current_user
from app.db import SessionLocal
from app.rpc import rpc_forward_with_retry
from app.schemas.rpc import JsonRpcRequest

router = APIRouter()


def get_current_user_optional():
    """Optional authentication - returns user if authenticated, None otherwise."""
    try:
        return get_current_user()
    except HTTPException:
        return None

@router.post("/api/rpc/{chain}/{network}/json")
async def proxy_rpc(
    chain: str, 
    network: str, 
    request: Request, 
    mode: str = Query("smart", description="Request mode: 'direct' for single attempt, 'smart' for retry/failover"),
    user=Depends(get_current_user_optional)
):
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
        
        # Validate mode parameter
        if mode not in ["direct", "smart"]:
            error_response = {
                "jsonrpc": "2.0",
                "id": body.get("id"),
                "error": {
                    "code": -32600,
                    "message": f"Invalid mode parameter: {mode}. Must be 'direct' or 'smart'"
                }
            }
            return JSONResponse(status_code=400, content=error_response)

        # Forward request to upstream with retry logic
        try:
            status_code, response_body, duration_ms, attempts, final_outcome = await rpc_forward_with_retry(
                chain, network, body, mode
            )
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
