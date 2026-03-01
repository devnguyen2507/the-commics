import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://commics:secret@localhost:5432/commics")

engine = create_async_engine(DATABASE_URL, echo=False)

async_session_maker = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

async def init_db():
    # Run SQL Migrations manually from the migrations directory
    print("--- Database Initialization ---")
    migrations_dir = os.path.join(os.path.dirname(__file__), "../migrations")
    print(f"Looking for migrations in: {os.path.abspath(migrations_dir)}")
    
    if not os.path.exists(migrations_dir):
        print(f"ERROR: Migrations directory not found at {migrations_dir}")
        return

    async with engine.begin() as conn:
        # Sort migration folders by timestamp
        try:
            folders = sorted([f for f in os.listdir(migrations_dir) if os.path.isdir(os.path.join(migrations_dir, f))])
            print(f"Found {len(folders)} migration folders: {folders}")
        except Exception as e:
            print(f"ERROR listing migrations: {e}")
            return

        for folder in folders:
            up_sql_path = os.path.join(migrations_dir, folder, "up.sql")
            if os.path.exists(up_sql_path):
                print(f"Applying migration: {folder}...")
                with open(up_sql_path, "r") as f:
                    sql = f.read()
                
                # Split by semicolon and filter out empty statements
                statements = [s.strip() for s in sql.split(";") if s.strip()]
                for statement in statements:
                    try:
                        await conn.execute(text(statement))
                    except Exception as e:
                        # Log error but continue if it's "already exists" (since we lack a migration table)
                        if "already exists" in str(e).lower():
                            print(f"  Skipping statement (already applied): {statement[:50]}...")
                        else:
                            print(f"  ERROR executing statement in {folder}: {e}")
                            raise
    print("Database migrations applied successfully.")
