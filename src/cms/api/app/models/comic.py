from sqlalchemy import Column, String, Text, Boolean, DateTime, Float, Integer
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base import Base

class Comic(Base):
    __tablename__ = "comics"

    id = Column(String, primary_key=True, index=True)
    source_url = Column(String, nullable=False)
    slug = Column(String, index=True)
    title = Column(String, nullable=False)
    author = Column(String)
    description = Column(String)
    status = Column(String)
    logo_path = Column(String)
    banner_path = Column(String)
    thumbnail_path = Column(String)
    is_publish = Column(Boolean, default=True)
    published_at = Column(DateTime)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    rating_score = Column(Float)
    rating_count = Column(Integer)
    view_count = Column(Integer)
