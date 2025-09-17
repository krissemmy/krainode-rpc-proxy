"""Database configuration for KraiNode using async SQLAlchemy."""

import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# Get DATABASE_URL with fallback
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/krainode")

# Ensure we're using asyncpg driver
if not DATABASE_URL.startswith("postgresql+asyncpg://"):
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    else:
        raise ValueError("DATABASE_URL must be a postgresql+asyncpg:// URL")

try:
    engine = create_async_engine(DATABASE_URL, pool_size=10, max_overflow=20)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
except Exception as e:
    print(f"Warning: Database connection failed: {e}")
    print("Running without database logging...")
    engine = None
    SessionLocal = None
