from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUoW(UnitOfWork):
    def __init__(self, session: Session):
        super().__init__(session)
        self.categorias = CategoriaRepository(session)
