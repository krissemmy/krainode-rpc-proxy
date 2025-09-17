"""Authentication module for KraiNode using Supabase JWT verification."""

import os
from functools import lru_cache
from typing import Dict, Any

import requests
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt

bearer = HTTPBearer(auto_error=True)

SUPABASE_PROJECT_ID = os.environ["SUPABASE_PROJECT_ID"]
ISS = f"https://{SUPABASE_PROJECT_ID}.supabase.co/auth/v1"
JWKS_URL = f"{ISS}/jwks"


@lru_cache
def _jwks() -> Dict[str, Any]:
    """Get JWKS from Supabase (cached)."""
    resp = requests.get(JWKS_URL, timeout=5)
    resp.raise_for_status()
    return resp.json()


def get_current_user(token=Depends(bearer)) -> Dict[str, str]:
    """Verify Supabase JWT token and return user info."""
    try:
        claims = jwt.decode(
            token.credentials,
            _jwks(),
            options={"verify_aud": False},
            issuer=ISS,
            algorithms=["RS256"],
        )
        return {"user_id": claims["sub"], "email": claims.get("email")}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
