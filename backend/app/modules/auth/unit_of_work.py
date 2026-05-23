from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.auth.repository import AuthRepository


class AuthUoW(UnitOfWork):
    def __init__(self, session: Session):
        super().__init__(session)
        self.auth = AuthRepository(session)
