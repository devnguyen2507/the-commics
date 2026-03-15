from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.category import Category
from app.schemas.models import CategoryUpdate, CategoryResponse

router = APIRouter()

@router.get("/", response_model=list[CategoryResponse])
async def get_categories(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.name).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=CategoryResponse)
async def create_category(payload: CategoryResponse, db: AsyncSession = Depends(get_db)):
    # Check if exists
    result = await db.execute(select(Category).where(Category.id == payload.id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Category ID already exists")
    
    category = Category(**payload.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: str, payload: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)
    
    await db.commit()
    await db.refresh(category)
    return category
