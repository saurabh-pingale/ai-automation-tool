from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    GEMINI_API_KEY: str
    PORT: int = 8000
    DEV_MODE: bool = True

    class Config:
        env_file = ".env"

settings = Settings()