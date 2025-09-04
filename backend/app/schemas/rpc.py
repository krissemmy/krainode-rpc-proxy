"""Pydantic schemas for RPC requests and responses."""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, validator


class JsonRpcRequest(BaseModel):
    """JSON-RPC 2.0 request schema."""
    
    jsonrpc: str = Field(default="2.0", description="JSON-RPC version")
    method: str = Field(..., description="RPC method name")
    params: Union[List[Any], Dict[str, Any]] = Field(default=[], description="Method parameters")
    id: Union[str, int, None] = Field(..., description="Request ID")
    
    @validator("jsonrpc")
    def validate_jsonrpc(cls, v):
        """Validate JSON-RPC version."""
        if v != "2.0":
            raise ValueError("jsonrpc must be '2.0'")
        return v
    
    @validator("method")
    def validate_method(cls, v):
        """Validate method name."""
        if not v or not isinstance(v, str):
            raise ValueError("method must be a non-empty string")
        return v
    
    # @validator("params")
    # def validate_params(cls, v):
    #     """Validate params list."""
    #     if method != "eth_blockNumber":
    #         if not v or not isinstance(v, list):
    #             raise ValueError("params must be a non-empty list")
    #     return v


class JsonRpcResponse(BaseModel):
    """JSON-RPC 2.0 response schema."""
    
    jsonrpc: str = Field(default="2.0", description="JSON-RPC version")
    id: Union[str, int, None] = Field(..., description="Request ID")
    result: Optional[Any] = Field(None, description="Method result")
    error: Optional[Dict[str, Any]] = Field(None, description="Error information")
    meta: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    
    @validator("jsonrpc")
    def validate_jsonrpc(cls, v):
        """Validate JSON-RPC version."""
        if v != "2.0":
            raise ValueError("jsonrpc must be '2.0'")
        return v


class PingResponse(BaseModel):
    """Response schema for ping endpoint."""
    
    ok: bool = Field(..., description="Whether the ping was successful")
    blockNumber: Optional[str] = Field(None, description="Latest block number (hex)")
    durationMs: int = Field(..., description="Request duration in milliseconds")
    error: Optional[str] = Field(None, description="Error message if ping failed")


class ChainInfo(BaseModel):
    """Schema for chain information."""
    
    slug: str = Field(..., description="Chain identifier")
    apiUrl: str = Field(..., description="Our API URL for this chain")


class ChainsResponse(BaseModel):
    """Response schema for chains endpoint."""
    
    chains: List[ChainInfo] = Field(..., description="List of available chains")


class HealthResponse(BaseModel):
    """Response schema for health check."""
    
    ok: bool = Field(..., description="Service health status")
    service: str = Field(..., description="Service name")
    version: Optional[str] = Field(None, description="Service version")
    uptime: Optional[float] = Field(None, description="Service uptime in seconds")
