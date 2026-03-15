from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class ComicBase(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    is_publish: Optional[bool] = True

class ComicUpdate(BaseModel):
    is_publish: Optional[bool] = None
    title: Optional[str] = None
    description: Optional[str] = None

class ComicResponse(ComicBase):
    slug: Optional[str] = None
    author: Optional[str] = None
    status: Optional[str] = None
    thumbnail_path: Optional[str] = None
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChapterBase(BaseModel):
    id: str
    comic_id: str
    chapter_number: str
    description: Optional[str] = None
    is_publish: Optional[bool] = True

class ChapterUpdate(BaseModel):
    is_publish: Optional[bool] = None
    description: Optional[str] = None

class ChapterResponse(ChapterBase):
    order_index: float
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SeoContentBase(BaseModel):
    path: str
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    is_published: Optional[bool] = False
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None

class SeoContentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    is_published: Optional[bool] = None
    published_at: Optional[datetime] = None

class SeoContentResponse(SeoContentBase):
    id: uuid.UUID
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    linked_published: Optional[bool] = None

    class Config:
        from_attributes = True
