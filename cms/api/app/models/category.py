from sqlalchemy import Column, String, Text, DateTime
from app.models.base import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
