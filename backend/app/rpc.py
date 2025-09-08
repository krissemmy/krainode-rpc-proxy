"""RPC proxy utilities for forwarding requests to upstream nodes."""

import time
from typing import Dict, Any, Tuple, Optional
import httpx
from fastapi import HTTPException

from .config import get_settings
from .metrics import record_upstream_request


async def resolve_upstream(chain: str) -> str:
    """Resolve upstream URL for a chain."""
    settings = get_settings()
    upstream_url = settings.get_upstream_url(chain)
    
    if not upstream_url:
        raise HTTPException(
            status_code=404,
            detail=f"Chain '{chain}' not found. Available chains: {settings.get_available_chains()}"
        )
    
    return upstream_url


async def rpc_forward(
    upstream_url: str,
    payload: Dict[str, Any],
    timeout: float = None
) -> Tuple[int, Dict[str, Any], float]:
    """
    Forward RPC request to upstream node.
    
    Returns:
        Tuple of (status_code, response_body, duration_ms)
    """
    if timeout is None:
        timeout = get_settings().request_timeout_seconds
    
    start_time = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                upstream_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            duration_ms = (time.time() - start_time) * 1000
            
            # Record upstream metrics
            record_upstream_request(
                chain="unknown",  # Will be set by caller
                upstream_url=upstream_url,
                status_code=response.status_code,
                duration_ms=duration_ms
            )
            
            # Parse response
            try:
                response_body = response.json()
            except Exception:
                response_body = {"error": "Invalid JSON response from upstream"}
            
            return response.status_code, response_body, duration_ms
            
    except httpx.TimeoutException:
        duration_ms = (time.time() - start_time) * 1000
        error_response = {
            "jsonrpc": "2.0",
            "id": payload.get("id"),
            "error": {
                "code": -32603,
                "message": "Upstream request timeout",
                "data": {
                    "status_code": 504,
                    "error_type": "timeout_error",
                    "details": f"Request timed out after {timeout} seconds"
                }
            },
            "meta": {
                "durationMs": int(duration_ms),
                "status_code": 504
            }
        }
        return 504, error_response, duration_ms
        
    except httpx.ConnectError:
        duration_ms = (time.time() - start_time) * 1000
        error_response = {
            "jsonrpc": "2.0",
            "id": payload.get("id"),
            "error": {
                "code": -32603,
                "message": "Failed to connect to upstream node",
                "data": {
                    "status_code": 502,
                    "error_type": "connection_error",
                    "details": f"Could not connect to upstream node"
                }
            },
            "meta": {
                "durationMs": int(duration_ms),
                "status_code": 502
            }
        }
        return 502, error_response, duration_ms
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_response = {
            "jsonrpc": "2.0",
            "id": payload.get("id"),
            "error": {
                "code": -32603,
                "message": f"Upstream request failed: {str(e)}",
                "data": {
                    "status_code": 500,
                    "error_type": "internal_error",
                    "details": str(e)
                }
            },
            "meta": {
                "durationMs": int(duration_ms),
                "status_code": 500
            }
        }
        return 500, error_response, duration_ms


async def ping_chain(chain: str) -> Dict[str, Any]:
    """
    Ping a chain by calling eth_blockNumber.
    
    Returns:
        Dict with ok, blockNumber, durationMs, and optional error
    """
    start_time = time.time()
    
    try:
        upstream_url = await resolve_upstream(chain)
        
        # Create eth_blockNumber request
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_blockNumber",
            "params": []
        }
        
        status_code, response_body, duration_ms = await rpc_forward(
            upstream_url, payload
        )
        
        if status_code == 200 and "result" in response_body:
            return {
                "ok": True,
                "blockNumber": response_body["result"],
                "durationMs": int(duration_ms)
            }
        else:
            return {
                "ok": False,
                "error": response_body.get("error", {}).get("message", "Unknown error"),
                "durationMs": int(duration_ms)
            }
            
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        return {
            "ok": False,
            "error": str(e),
            "durationMs": int(duration_ms)
        }
