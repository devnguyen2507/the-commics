import asyncio
import os
from db.database import async_session_maker
from db.models import Comic
from sqlalchemy import select

async def list_comics():
    async with async_session_maker() as session:
        q = await session.execute(select(Comic.id).order_by(Comic.id))
        comics = q.scalars().all()
        for slug in comics:
            print(slug)

if __name__ == "__main__":
    asyncio.run(list_comics())
