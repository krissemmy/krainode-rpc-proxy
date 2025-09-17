"""Authentication echo routes for KraiNode."""

from fastapi import APIRouter, Depends, Request
from app.auth import get_current_user

router = APIRouter()


@router.get("/api/me")
async def me(user=Depends(get_current_user)):
    """Get current user information."""
    return {"user_id": user["user_id"], "email": user["email"]}


@router.get("/api/debug/auth")
async def debug_auth(request: Request):
    """Debug endpoint to check authentication headers."""
    auth_header = request.headers.get("authorization")
    return {
        "has_auth_header": bool(auth_header),
        "auth_header": auth_header[:50] + "..." if auth_header and len(auth_header) > 50 else auth_header,
        "all_headers": dict(request.headers)
    }
