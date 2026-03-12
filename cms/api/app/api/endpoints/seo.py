from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.db.database import get_db
from app.models.seo_content import SeoContent
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
    return result.scalars().all()

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
