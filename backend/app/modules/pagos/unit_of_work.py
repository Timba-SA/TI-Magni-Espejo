from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.pagos.repository import PagoRepository


class PagoUoW(UnitOfWork):
    def __init__(self, session: Session):
        super().__init__(session)
        self.pagos = PagoRepository(session)
