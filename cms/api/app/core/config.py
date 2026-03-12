from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Commics CMS API"
    API_V1_STR: str = "/api"
    
    # default to the one from ops/docker/docker-compose.yml
    DATABASE_URL: str = "postgresql+asyncpg://commics:secret@localhost:5433/commics"
    
    JWT_SECRET: str = "super_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    ADMIN_USER: str = "admin"
    ADMIN_PASS: str = "admin@123"

    class Config:
        env_file = ".env"

settings = Settings()
