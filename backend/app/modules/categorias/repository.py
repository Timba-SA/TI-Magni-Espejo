from typing import Optional
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(Categoria, session)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        return self.session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()

    def get_all_activas(self) -> list[Categoria]:
        """Retorna solo categorías no eliminadas (soft delete)."""
        return self.session.exec(
            select(Categoria).where(Categoria.deleted_at == None)
        ).all()

    def get_by_parent(self, parent_id: Optional[int]) -> list[Categoria]:
        return self.session.exec(
            select(Categoria).where(
                Categoria.parent_id == parent_id,
                Categoria.deleted_at == None,
            )
        ).all()
