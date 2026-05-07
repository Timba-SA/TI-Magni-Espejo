from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Componentes individuales para construir la URL de la base de datos
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_NAME: str = "parcial1"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432

    # URL completa de la base de datos (sobrescribe las variables individuales si está definida)
    DATABASE_URL: Optional[str] = None

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
