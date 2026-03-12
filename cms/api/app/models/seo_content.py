from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
import uuid

class SeoContent(Base):
    __tablename__ = "seo_contents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    path = Column(String, nullable=False, unique=True, index=True)
    title = Column(String)
    description = Column(Text)
    keywords = Column(String)
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True))
    entity_type = Column(String, index=True)
    entity_id = Column(String, index=True)
    created_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True))
