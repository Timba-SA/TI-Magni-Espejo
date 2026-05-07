from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.ingredientes.repository import IngredienteRepository


class IngredienteUoW(UnitOfWork):
    def __init__(self, session: Session):
        super().__init__(session)
        self.ingredientes = IngredienteRepository(session)
