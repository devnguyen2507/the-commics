import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://commics:secret@localhost:5432/commics")

engine = create_async_engine(DATABASE_URL, echo=False)

async_session_maker = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

async def init_db():
    # Migrations are now managed by Diesel CLI natively in src/backend/migrations
    # We do not use SQLAlchemy to create tables implicitly anymore.
    pass
