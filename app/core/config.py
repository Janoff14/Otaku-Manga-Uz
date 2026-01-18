from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    env: str = "dev"
    db_url: str = "postgresql+psycopg2://otaku_user:otaku_db_pw123@localhost:5432/otaku_manga"
    admin_seed_key: str = "dev-secret-key"

    # CORS settings - use "*" for development, specify production origins
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @property
    def is_production(self) -> bool:
        return self.env == "prod"


settings = Settings()
