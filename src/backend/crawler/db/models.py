from datetime import datetime
from sqlalchemy import Column, String, Float, JSON, DateTime, UniqueConstraint
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Comic(Base):
    __tablename__ = 'comics'

    id = Column(String, primary_key=True)
    source_url = Column(String, unique=True, nullable=False)
    slug = Column(String)
    title = Column(String, nullable=False)
    author = Column(String)
    description = Column(String)
    status = Column(String)
    categories = Column(JSON)
    logo_path = Column(String)
    banner_path = Column(String)
    thumbnail_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Chapter(Base):
    __tablename__ = 'chapters'

    id = Column(String, primary_key=True)
    comic_id = Column(String, nullable=False)
    chapter_number = Column(String, nullable=False)
    order_index = Column(Float, nullable=False)
    source_url = Column(String, unique=True, nullable=False)
    images = Column(JSON) # ["asset-id-1", "asset-id-2"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('comic_id', 'chapter_number', name='uq_comic_chapter'),
    )

class WorkerTask(Base):
    __tablename__ = 'worker_tasks'

    id = Column(String, primary_key=True)
    workflow_id = Column(String, nullable=False)
    target_type = Column(String, nullable=False)
    target_url = Column(String, nullable=False)
    status = Column(String, default='pending')
    error_logs = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Asset(Base):
    __tablename__ = 'assets'

    id = Column(String, primary_key=True)
    comic_id = Column(String, nullable=False)
    chapter_id = Column(String)
    asset_type = Column(String, nullable=False) # manga-page, logo, banner, thumbnail
    source_url = Column(String, nullable=False)
    storage_path = Column(String)
    order_index = Column(Float, nullable=False, default=0.0)
    status = Column(String, nullable=False, default='pending')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WorkerComic(Base):
    __tablename__ = 'worker_comics'

    id = Column(String, primary_key=True) # Matches comic slug
    source_url = Column(String, nullable=False)
    status = Column(String, default='idle') # idle, syncing, completed, failed
    chapter_count = Column(Float, default=0.0)
    latest_chapter_number = Column(Float)
    last_sync_at = Column(DateTime, default=datetime.utcnow)
    last_error = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WorkerChapter(Base):
    __tablename__ = 'worker_chapters'

    id = Column(String, primary_key=True) # Matches chapter slug
    comic_id = Column(String, nullable=False)
    chapter_number = Column(Float, nullable=False)
    source_url = Column(String, nullable=False)
    status = Column(String, default='pending') # pending, extracted, downloaded, failed
    last_sync_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
