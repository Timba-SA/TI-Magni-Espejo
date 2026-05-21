from typing import Optional

from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload

from app.core.repository import BaseRepository
from app.modules.ingredientes.models import Ingrediente


class IngredienteRepository(BaseRepository[Ingrediente]):
    def __init__(self, session: Session):
        super().__init__(Ingrediente, session)

    def get_activo_by_id(self, id: int) -> Optional[Ingrediente]:
        return self.session.exec(
            select(Ingrediente)
            .where(
                Ingrediente.id == id,
                Ingrediente.deleted_at == None,
            )
            .options(selectinload(Ingrediente.unidad_medida))
        ).first()

    def get_activo_by_nombre(self, nombre: str) -> Optional[Ingrediente]:
        return self.session.exec(
            select(Ingrediente)
            .where(
                Ingrediente.nombre == nombre,
                Ingrediente.deleted_at == None,
            )
            .options(selectinload(Ingrediente.unidad_medida))
        ).first()

    def list_with_filters(
        self,
        nombre: Optional[str] = None,
        es_alergeno: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Ingrediente], int]:
        base = select(Ingrediente).where(Ingrediente.deleted_at == None)

        if nombre:
            base = base.where(Ingrediente.nombre.ilike(f"%{nombre}%"))
        if es_alergeno is not None:
            base = base.where(Ingrediente.es_alergeno == es_alergeno)

        # Contar total sin paginación
        count_stmt = select(func.count()).select_from(base.subquery())
        total = self.session.exec(count_stmt).one()

        # Aplicar paginación
        items = self.session.exec(
            base.options(selectinload(Ingrediente.unidad_medida))
            .offset(skip)
            .limit(limit)
        ).all()

        return list(items), total
