"""RPC API routes for KraiNode."""

import time
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse

from ..config import get_settings
from ..rpc import rpc_forward, resolve_upstream, ping_chain
from ..rate_limit import check_rate_limit
from ..metrics import record_request
from ..logging import RequestContext, log_rpc_request
from ..schemas.rpc import JsonRpcRequest, JsonRpcResponse, PingResponse, ChainsResponse, ChainInfo, ChainsDetailsResponse, ChainDetails, NetworkInfo, ProviderInfo
from ..auth import get_current_user
from ..db import SessionLocal
from sqlalchemy import text
import json

router = APIRouter()


def get_current_user_optional():
    """Optional authentication - returns user if authenticated, None otherwise."""
    try:
        return get_current_user()
    except HTTPException:
        return None


@router.get("/api/chains", response_model=ChainsResponse)
async def get_chains():
    """Get list of available chains with our API URLs."""
    settings = get_settings()
    
    chains = [
        ChainInfo(
            slug=chain_slug,
            apiUrl=f"/api/rpc/{chain_slug}/json"
        )
        for chain_slug in settings.get_available_chains()
    ]
    
    return ChainsResponse(chains=chains)


@router.get("/api/chains/details", response_model=ChainsDetailsResponse)
async def get_chains_details():
    """Get detailed hierarchical chain information."""
    settings = get_settings()
    
    chains = []
    for chain_name, networks in settings.get_available_chain_networks().items():
        network_infos = []
        for network_name in networks:
            providers = settings.get_available_providers(chain_name, network_name)
            provider_infos = [
                ProviderInfo(
                    name=provider_name,
                    url=settings.get_upstream_url_with_provider(chain_name, network_name, provider_name)
                )
                for provider_name in providers
            ]
            
            network_infos.append(NetworkInfo(
                name=network_name,
                providers=provider_infos,
                apiUrl=f"/api/rpc/{chain_name}-{network_name}/json"
            ))
        
        chains.append(ChainDetails(
            name=chain_name,
            networks=network_infos
        ))
    
    return ChainsDetailsResponse(chains=chains)


@router.get("/api/rpc/{chain}/ping", response_model=PingResponse)
async def ping_chain_endpoint(chain: str, request: Request):
    """Ping a chain by calling eth_blockNumber."""
    with RequestContext(request, chain) as logger:
        try:
            # Check rate limit
            check_rate_limit(request, chain)
            
            # Ping the chain
            result = await ping_chain(chain)
            
            # Log the request
            log_rpc_request(
                logger=logger,
                chain=chain,
                method="eth_blockNumber",
                status_code=200 if result["ok"] else 500,
                duration_ms=result["durationMs"],
                error=None if result["ok"] else result.get("error")
            )
            
            # Record metrics
            record_request(
                chain=chain,
                method="eth_blockNumber",
                status_code=200 if result["ok"] else 500,
                duration_ms=result["durationMs"],
                error_type=None if result["ok"] else "ping_error"
            )
            
            return PingResponse(**result)
            
        except HTTPException as e:
            # Log the error
            log_rpc_request(
                logger=logger,
                chain=chain,
                method="eth_blockNumber",
                status_code=e.status_code,
                duration_ms=0,
                error=str(e.detail)
            )
            
            # Record metrics
            record_request(
                chain=chain,
                method="eth_blockNumber",
                status_code=e.status_code,
                duration_ms=0,
                error_type="http_error"
            )
            
            raise


@router.post("/api/rpc/{chain}/json")
async def rpc_proxy(chain: str, request: Request, payload: Dict[str, Any], user=Depends(get_current_user_optional)):
    """Proxy JSON-RPC request to upstream node (legacy endpoint without auth)."""
    with RequestContext(request, chain) as logger:
        start_time = time.time()
        
        try:
            # Check rate limit
            check_rate_limit(request, chain)
            
            # Validate JSON-RPC request
            try:
                rpc_request = JsonRpcRequest(**payload)
            except Exception as e:
                error_response = {
                    "jsonrpc": "2.0",
                    "id": payload.get("id"),
                    "error": {
                        "code": -32600,
                        "message": f"Invalid Request: {str(e)}",
                        "data": {
                            "status_code": 400,
                            "error_type": "validation_error",
                            "details": str(e)
                        }
                    },
                    "meta": {
                        "durationMs": int((time.time() - start_time) * 1000),
                        "status_code": 400
                    }
                }
                
                duration_ms = int((time.time() - start_time) * 1000)
                
                # Log and record metrics
                log_rpc_request(
                    logger=logger,
                    chain=chain,
                    method=payload.get("method", "unknown"),
                    status_code=400,
                    duration_ms=duration_ms,
                    error=str(e)
                )
                
                record_request(
                    chain=chain,
                    method=payload.get("method", "unknown"),
                    status_code=400,
                    duration_ms=duration_ms,
                    error_type="validation_error"
                )
                
                return JSONResponse(
                    status_code=400,
                    content=error_response
                )
            
            # Resolve upstream URL
            upstream_url = await resolve_upstream(chain)
            
            # Forward request to upstream
            status_code, response_body, duration_ms = await rpc_forward(
                upstream_url, payload
            )
            
            # Add metadata to response
            if isinstance(response_body, dict):
                response_body["meta"] = {
                    "durationMs": int(duration_ms)
                }
            
            # Log the request
            log_rpc_request(
                logger=logger,
                chain=chain,
                method=rpc_request.method,
                status_code=status_code,
                duration_ms=duration_ms,
                error=None if status_code == 200 else response_body.get("error", {}).get("message")
            )
            
            # Record metrics
            record_request(
                chain=chain,
                method=rpc_request.method,
                status_code=status_code,
                duration_ms=duration_ms,
                error_type=None if status_code == 200 else "upstream_error"
            )
            
            # Log to database if user is authenticated
            if user and SessionLocal:
                try:
                    # Parse chain to extract chain and network
                    chain_parts = chain.split('-', 1)
                    chain_name = chain_parts[0] if chain_parts else chain
                    network_name = chain_parts[1] if len(chain_parts) > 1 else 'mainnet'
                    
                    # Redact sensitive parameters
                    safe_params = rpc_request.params or []
                    if isinstance(safe_params, list):
                        safe_params = [param for param in safe_params if not any(key.lower() in ['privatekey', 'private_key', 'pk', 'secret', 'bearer', 'authorization', 'auth', 'token', 'password', 'passwd'] for key in (param.keys() if isinstance(param, dict) else []))]
                    
                    # Calculate response size
                    response_bytes = len(json.dumps(response_body).encode("utf-8"))
                    error_text = None
                    if isinstance(response_body, dict) and "error" in response_body:
                        error_text = response_body["error"].get("message", "Unknown error")
                    
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
                                "chain": chain_name,
                                "network": network_name,
                                "method": rpc_request.method,
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
            
            return JSONResponse(
                status_code=status_code,
                content=response_body
            )
            
        except HTTPException as e:
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Log the error
            log_rpc_request(
                logger=logger,
                chain=chain,
                method=payload.get("method", "unknown"),
                status_code=e.status_code,
                duration_ms=duration_ms,
                error=str(e.detail)
            )
            
            # Record metrics
            record_request(
                chain=chain,
                method=payload.get("method", "unknown"),
                status_code=e.status_code,
                duration_ms=duration_ms,
                error_type="http_error"
            )
            
            raise

