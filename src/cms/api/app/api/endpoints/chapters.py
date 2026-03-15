from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.chapter import Chapter
from app.schemas.models import ChapterUpdate, ChapterResponse
from typing import Optional

router = APIRouter()

@router.get("/", response_model=list[ChapterResponse])
async def get_chapters(comic_id: str, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Chapter)
        .where(Chapter.comic_id == comic_id)
        .order_by(Chapter.order_index.asc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

@router.get("/{chapter_id}", response_model=ChapterResponse)
async def get_chapter(chapter_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalars().first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter

@router.put("/{chapter_id}", response_model=ChapterResponse)
async def update_chapter(chapter_id: str, payload: ChapterUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalars().first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(chapter, key, value)
    
    await db.commit()
    await db.refresh(chapter)
    return chapter
