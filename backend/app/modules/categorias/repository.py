from typing import Optional
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(Categoria, session)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca solo entre categorías no archivadas. Un nombre de categoria archivada queda libre."""
        return self.session.exec(
            select(Categoria).where(
                Categoria.nombre == nombre,
                Categoria.deleted_at == None,  # noqa: E711
            )
        ).first()

    def get_all_activas(self) -> list[Categoria]:
        """Retorna solo categorías no eliminadas (soft delete)."""
        return self.session.exec(
            select(Categoria).where(Categoria.deleted_at == None)
        ).all()

    def get_all_activas_paginated(
        self, skip: int, limit: int, include_deleted: bool = False
    ) -> tuple[list[Categoria], int]:
        from sqlmodel import func
        query = select(Categoria)
        if not include_deleted:
            query = query.where(Categoria.deleted_at == None)  # noqa: E711
        total = self.session.exec(select(func.count()).select_from(query.subquery())).one()
        items = self.session.exec(query.offset(skip).limit(limit)).all()
        return items, total

    def get_by_parent(self, parent_id: Optional[int]) -> list[Categoria]:
        return self.session.exec(
            select(Categoria).where(
                Categoria.parent_id == parent_id,
                Categoria.deleted_at == None,
            )
        ).all()
