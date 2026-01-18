from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    env: str = "dev"
    db_url: str = "postgresql+psycopg2://otaku_user:otaku_db_pw123@localhost:5432/otaku_manga"
    admin_seed_key: str = "9ZNDmv30Ntqirbdb"


settings = Settings()
