from pydantic import BaseModel
from typing import List, Optional

class ChapterInfo(BaseModel):
    id: str
    chapter_number: str
    order_index: float
    source_url: str

class ComicMetadata(BaseModel):
    id: str
    source_url: str
    title: str
    author: Optional[str]
    description: Optional[str]
    status: Optional[str]
    categories: List[str]
    logo_path: Optional[str]
    banner_path: Optional[str]
    thumbnail_path: Optional[str]
    chapters: List[ChapterInfo]

class UpsertComicRequest(BaseModel):
    metadata: ComicMetadata

class UpsertComicResponse(BaseModel):
    internal_comic_id: str

class AssetMetadata(BaseModel):
    id: str
    asset_type: str
    source_url: str
    storage_path: Optional[str] = None
    order_index: float = 0.0
    status: str = "pending"
