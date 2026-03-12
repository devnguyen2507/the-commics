from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import auth, comics, chapters, categories, seo
from app.api.deps import get_current_admin
from fastapi import Depends

app = FastAPI(title=settings.PROJECT_NAME)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production customize this to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(
    comics.router, 
    prefix=f"{settings.API_V1_STR}/comics", 
    tags=["comics"],
    dependencies=[Depends(get_current_admin)]
)
app.include_router(
    chapters.router, 
    prefix=f"{settings.API_V1_STR}/chapters", 
    tags=["chapters"],
    dependencies=[Depends(get_current_admin)]
)
app.include_router(
    categories.router, 
    prefix=f"{settings.API_V1_STR}/categories", 
    tags=["categories"],
    dependencies=[Depends(get_current_admin)]
)
app.include_router(
    seo.router,
    prefix=f"{settings.API_V1_STR}/seo",
    tags=["seo"],
    dependencies=[Depends(get_current_admin)]
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Commics CMS API!"}
