from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.insumos.repository import InsumoRepository
from app.modules.auth.repository import UserRepository
from app.modules.categorias.repository import CategoriaRepository

class UnitOfWork:
    def __init__(self, session_factory=SessionLocal):
        self.session_factory = session_factory
        self.db: Session = None

    def __enter__(self):
        self.db = self.session_factory()
        self.insumos = InsumoRepository(self.db)
        self.users = UserRepository(self.db)
        self.categorias = CategoriaRepository(self.db)
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type:
            self.rollback()
        self.close()

    def commit(self):
        if self.db:
            self.db.commit()

    def rollback(self):
        if self.db:
            self.db.rollback()

    def close(self):
        if self.db:
            self.db.close()
