from typing import Optional
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.productos.models import Producto, ProductoCategoria, ProductoIngrediente, UnidadMedida


class UnidadMedidaRepository(BaseRepository[UnidadMedida]):
    def __init__(self, session: Session):
        super().__init__(UnidadMedida, session)

    def get_by_simbolo(self, simbolo: str) -> Optional[UnidadMedida]:
        return self.session.exec(
            select(UnidadMedida).where(UnidadMedida.simbolo == simbolo)
        ).first()

    def get_by_nombre(self, nombre: str) -> Optional[UnidadMedida]:
        return self.session.exec(
            select(UnidadMedida).where(UnidadMedida.nombre == nombre)
        ).first()

    def get_all(self) -> list[UnidadMedida]:
        return self.session.exec(select(UnidadMedida)).all()


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(Producto, session)

    def get_all_activos(
        self,
        offset: int = 0,
        limit: int = 20,
        disponible: Optional[bool] = None,
        include_deleted: bool = False,
    ) -> list[Producto]:
        query = select(Producto)
        if not include_deleted:
            query = query.where(Producto.deleted_at == None)  # noqa: E711
        if disponible is not None:
            query = query.where(Producto.disponible == disponible)
        return self.session.exec(query.offset(offset).limit(limit)).all()

    def count_activos(self, include_deleted: bool = False) -> int:
        from sqlmodel import func
        query = select(func.count(Producto.id))
        if not include_deleted:
            query = query.where(Producto.deleted_at == None)  # noqa: E711
        return self.session.exec(query).one()


class ProductoCategoriaRepository(BaseRepository[ProductoCategoria]):
    def __init__(self, session: Session):
        super().__init__(ProductoCategoria, session)

    def get_by_producto(self, producto_id: int) -> list[ProductoCategoria]:
        return self.session.exec(
            select(ProductoCategoria).where(
                ProductoCategoria.producto_id == producto_id
            )
        ).all()

    def delete_by_producto(self, producto_id: int) -> None:
        rows = self.get_by_producto(producto_id)
        for row in rows:
            self.session.delete(row)


class ProductoIngredienteRepository(BaseRepository[ProductoIngrediente]):
    def __init__(self, session: Session):
        super().__init__(ProductoIngrediente, session)

    def get_by_producto(self, producto_id: int) -> list[ProductoIngrediente]:
        return self.session.exec(
            select(ProductoIngrediente).where(
                ProductoIngrediente.producto_id == producto_id
            )
        ).all()

    def delete_by_producto(self, producto_id: int) -> None:
        rows = self.get_by_producto(producto_id)
        for row in rows:
            self.session.delete(row)
