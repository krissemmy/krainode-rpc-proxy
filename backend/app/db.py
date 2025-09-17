"""Database configuration for KraiNode using async SQLAlchemy."""

import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

DATABASE_URL = os.environ["DATABASE_URL"]  # postgresql+asyncpg://...

engine = create_async_engine(DATABASE_URL, pool_size=10, max_overflow=20)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
