from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "The Food Store API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # Componentes individuales para construir la URL de la base de datos
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DB_NAME: str = "foodstore_db"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432

    # URL completa de la base de datos (sobrescribe las variables individuales si está definida)
    DATABASE_URL: Optional[str] = None

    # JWT
    JWT_SECRET_KEY: str  # Obligatorio. Sin default: la app no arranca sin esta variable.
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Seed — Administrador inicial
    ADMIN_EMAIL: str = "admin@foodstore.com"
    ADMIN_PASSWORD: str  # Obligatorio. Sin default: el seeder no corre sin esta variable.

    # MercadoPago Config
    MP_ACCESS_TOKEN: Optional[str] = None
    MP_WEBHOOK_SECRET: Optional[str] = None

    class Config:
        env_file = ".env"

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


settings = Settings()
