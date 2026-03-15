from sqlalchemy import Column, String, Text, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base import Base

class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(String, primary_key=True, index=True)
    comic_id = Column(String, ForeignKey("comics.id"), nullable=False, index=True)
    chapter_number = Column(String, nullable=False)
    order_index = Column(Float, nullable=False)
    source_url = Column(String, nullable=False)
    images = Column(JSONB)
    description = Column(Text)
    is_publish = Column(Boolean, default=True)
    published_at = Column(DateTime)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
