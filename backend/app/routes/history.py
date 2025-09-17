"""History routes for KraiNode API request logging."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from app.auth import get_current_user
from app.db import SessionLocal

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
async def list_history(
    user=Depends(get_current_user),
    limit: int = Query(20, ge=1, le=200),
    cursor: Optional[int] = None,
    chain: Optional[str] = None,
    network: Optional[str] = None,
    method: Optional[str] = None,
    status_code: Optional[int] = None,
    from_ts: Optional[str] = None,
    to_ts: Optional[str] = None,
):
    """Get paginated API request history with filters."""
    where = ["user_id = :uid"]
    params = {"uid": user["user_id"], "limit": limit}

    if cursor:
        where.append("id < :cursor")
        params["cursor"] = cursor
    if chain:
        where.append("chain = :chain")
        params["chain"] = chain
    if network:
        where.append("network = :network")
        params["network"] = network
    if method:
        where.append("method = :method")
        params["method"] = method
    if status_code is not None:
        where.append("status_code = :status_code")
        params["status_code"] = status_code
    if from_ts:
        where.append("created_at >= :from_ts")
        params["from_ts"] = from_ts
    if to_ts:
        where.append("created_at <= :to_ts")
        params["to_ts"] = to_ts

    sql = f"""
      select id, request_id, chain, network, method, status_code, duration_ms, response_bytes, error_text, params, created_at
      from public.api_requests
      where {" and ".join(where)}
      order by id desc
      limit :limit
    """

    if not SessionLocal:
        return {"data": [], "next_cursor": None, "error": "Database not available"}

    async with SessionLocal() as s:
        rows = (await s.execute(text(sql), params)).mappings().all()

    next_cursor = rows[-1]["id"] if rows and len(rows) == limit else None
    return {"data": rows, "next_cursor": next_cursor}
