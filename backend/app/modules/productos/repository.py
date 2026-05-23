from typing import Optional
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

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
        categoria_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> list[Producto]:
        query = (
            select(Producto)
            .options(
                selectinload(Producto.producto_categorias).selectinload(ProductoCategoria.categoria),
                selectinload(Producto.producto_ingredientes)
                    .selectinload(ProductoIngrediente.ingrediente),
                selectinload(Producto.producto_ingredientes)
                    .selectinload(ProductoIngrediente.unidad_medida),
                selectinload(Producto.unidad_venta),
            )
        )
        if not include_deleted:
            query = query.where(Producto.deleted_at == None)  # noqa: E711
        if disponible is not None:
            query = query.where(Producto.disponible == disponible)
        
        if categoria_id is not None:
            query = query.join(ProductoCategoria).where(ProductoCategoria.categoria_id == categoria_id)
            
        if search:
            search_term = f"%{search}%"
            query = query.where(
                (Producto.nombre.ilike(search_term)) |
                (Producto.descripcion.ilike(search_term))
            )
            
        return self.session.exec(query.offset(offset).limit(limit)).all()


    def count_activos(self, include_deleted: bool = False) -> int:
        from sqlmodel import func
        query = select(func.count(Producto.id))
        if not include_deleted:
            query = query.where(Producto.deleted_at == None)  # noqa: E711
        return self.session.exec(query).one()

    def get_by_id_with_relations(self, id: int) -> Optional[Producto]:
        return self.session.exec(
            select(Producto)
            .where(Producto.id == id)
            .options(
                selectinload(Producto.producto_categorias).selectinload(ProductoCategoria.categoria),
                selectinload(Producto.producto_ingredientes)
                    .selectinload(ProductoIngrediente.ingrediente),
                selectinload(Producto.producto_ingredientes)
                    .selectinload(ProductoIngrediente.unidad_medida),
                selectinload(Producto.unidad_venta),
            )
        ).first()


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
