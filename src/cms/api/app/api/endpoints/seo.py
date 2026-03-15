from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.db.database import get_db
from app.models.seo_content import SeoContent
from app.models.comic import Comic
from app.models.chapter import Chapter
from app.schemas.models import SeoContentUpdate, SeoContentResponse
import uuid

router = APIRouter()

@router.get("/", response_model=List[SeoContentResponse])
async def get_seo_contents(
    skip: int = 0, 
    limit: int = 20, 
    entity_type: Optional[str] = None,
    path_search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(SeoContent)
    
    if entity_type:
        query = query.where(SeoContent.entity_type == entity_type)
    
    if path_search:
        query = query.where(SeoContent.path.ilike(f"%{path_search}%"))
        
    query = query.order_by(SeoContent.updated_at.desc().nulls_last()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    seo_items = result.scalars().all()
    
    # Populate linked_published
    comic_ids = [item.entity_id for item in seo_items if item.entity_type == "comic" and item.entity_id]
    chapter_ids = [item.entity_id for item in seo_items if item.entity_type == "chapter" and item.entity_id]
    
    published_map = {}
    if comic_ids:
        c_res = await db.execute(select(Comic.id, Comic.is_publish).where(Comic.id.in_(comic_ids)))
        for cid, pub in c_res:
            published_map[("comic", cid)] = pub
    if chapter_ids:
        ch_res = await db.execute(select(Chapter.id, Chapter.is_publish).where(Chapter.id.in_(chapter_ids)))
        for chid, pub in ch_res:
            published_map[("chapter", chid)] = pub
            
    for item in seo_items:
        if item.entity_type and item.entity_id:
            item.linked_published = published_map.get((item.entity_type, item.entity_id))
            
    return seo_items

@router.get("/count")
async def get_seo_contents_count(
    entity_type: Optional[str] = None,
    path_search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(func.count()).select_from(SeoContent)
    
    if entity_type:
        query = query.where(SeoContent.entity_type == entity_type)
    
    if path_search:
        query = query.where(SeoContent.path.ilike(f"%{path_search}%"))
        
    result = await db.execute(query)
    count = result.scalar()
    return {"count": count}

@router.get("/{seo_id}", response_model=SeoContentResponse)
async def get_seo_content(seo_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SeoContent).where(SeoContent.id == seo_id))
    seo_content = result.scalars().first()
    if not seo_content:
        raise HTTPException(status_code=404, detail="SEO content not found")
        
    if seo_content.entity_type == "comic" and seo_content.entity_id:
        c_res = await db.execute(select(Comic.is_publish).where(Comic.id == seo_content.entity_id))
        seo_content.linked_published = c_res.scalar()
    elif seo_content.entity_type == "chapter" and seo_content.entity_id:
        ch_res = await db.execute(select(Chapter.is_publish).where(Chapter.id == seo_content.entity_id))
        seo_content.linked_published = ch_res.scalar()
        
    return seo_content

@router.put("/{seo_id}", response_model=SeoContentResponse)
async def update_seo_content(seo_id: uuid.UUID, payload: SeoContentUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SeoContent).where(SeoContent.id == seo_id))
    seo_content = result.scalars().first()
    if not seo_content:
        raise HTTPException(status_code=404, detail="SEO content not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(seo_content, key, value)
    
    await db.commit()
    await db.refresh(seo_content)
    return seo_content
