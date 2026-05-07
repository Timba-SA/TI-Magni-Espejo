from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# Usa DATABASE_URL si está definida, sino construye la URL a partir de las variables individuales
engine = create_engine(settings.database_url, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
