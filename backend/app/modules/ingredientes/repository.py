from typing import Optional
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.ingredientes.models import Ingrediente


class IngredienteRepository(BaseRepository[Ingrediente]):
    def __init__(self, session: Session):
        super().__init__(Ingrediente, session)

    def get_by_nombre(self, nombre: str) -> Optional[Ingrediente]:
        return self.session.exec(
            select(Ingrediente).where(Ingrediente.nombre == nombre)
        ).first()

    def get_all_activos(self) -> list[Ingrediente]:
        return self.session.exec(select(Ingrediente)).all()

    def get_alergenos(self) -> list[Ingrediente]:
        return self.session.exec(
            select(Ingrediente).where(Ingrediente.es_alergeno == True)
        ).all()
