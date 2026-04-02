from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://ezGit:ezGit@postgres:5432/ezGit"
    REDIS_URL: str = "redis://redis:6379/0"
    GITHUB_TOKEN: str = ""
    GITLAB_TOKEN: str = ""
    GITLAB_URL: str = "https://gitlab.com"
    GEMINI_API_KEY: str = ""
    SNYK_TOKEN: str = ""
    APP_ENV: str = "development"
    SECRET_KEY: str = "changeme"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
