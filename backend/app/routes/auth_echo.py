"""Authentication echo routes for KraiNode."""

from fastapi import APIRouter, Depends
from app.auth import get_current_user

router = APIRouter()


@router.get("/api/me")
async def me(user=Depends(get_current_user)):
    """Get current user information."""
    return {"user_id": user["user_id"], "email": user["email"]}
