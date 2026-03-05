from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.comic import Comic
from app.schemas.models import ComicUpdate, ComicResponse

router = APIRouter()

@router.get("/", response_model=list[ComicResponse])
async def get_comics(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comic).order_by(Comic.updated_at.desc().nulls_last()).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{comic_id}", response_model=ComicResponse)
async def get_comic(comic_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comic).where(Comic.id == comic_id))
    comic = result.scalars().first()
    if not comic:
        raise HTTPException(status_code=404, detail="Comic not found")
    return comic

@router.put("/{comic_id}", response_model=ComicResponse)
async def update_comic(comic_id: str, payload: ComicUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comic).where(Comic.id == comic_id))
    comic = result.scalars().first()
    if not comic:
        raise HTTPException(status_code=404, detail="Comic not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(comic, key, value)
    
    await db.commit()
    await db.refresh(comic)
    return comic
