from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlmodel import Session

from app.modules.productos.models import Producto, ProductoCategoria, ProductoIngrediente
from app.modules.productos.schemas import ProductoCreate, ProductoUpdate
from app.modules.productos.unit_of_work import ProductoUoW


class ProductoService:
    def __init__(self, session: Session):
        self._session = session

    # ── Métodos públicos ──────────────────────────────────────────────────────

    def listar(
        self,
        offset: int = 0,
        limit: int = 20,
        disponible: Optional[bool] = None,
    ) -> list[Producto]:
        with ProductoUoW(self._session) as uow:
            return uow.productos.get_all_activos(
                offset=offset, limit=limit, disponible=disponible
            )

    def obtener(self, id: int) -> Producto:
        with ProductoUoW(self._session) as uow:
            producto = uow.productos.get_by_id(id)
            if not producto or producto.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id={id} no encontrado.",
                )
            return producto

    def crear(self, data: ProductoCreate) -> Producto:
        if not data.categorias:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Un producto debe tener al menos una categoría.",
            )

        with ProductoUoW(self._session) as uow:
            producto = Producto(
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagenes_url=data.imagenes_url,
                stock_cantidad=data.stock_cantidad,
                disponible=data.disponible,
            )
            uow.productos.add(producto)
            self._session.flush()  # genera producto.id antes del commit

            for cat_data in data.categorias:
                categoria = uow.categorias.get_by_id(cat_data.categoria_id)
                if not categoria or categoria.deleted_at is not None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Categoría con id={cat_data.categoria_id} no encontrada.",
                    )
                uow.producto_categorias.add(
                    ProductoCategoria(
                        producto_id=producto.id,
                        categoria_id=cat_data.categoria_id,
                        es_principal=cat_data.es_principal,
                    )
                )

            for ing_data in data.ingredientes:
                ingrediente = uow.ingredientes.get_by_id(ing_data.ingrediente_id)
                if not ingrediente:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Ingrediente con id={ing_data.ingrediente_id} no encontrado.",
                    )
                uow.producto_ingredientes.add(
                    ProductoIngrediente(
                        producto_id=producto.id,
                        ingrediente_id=ing_data.ingrediente_id,
                        es_removible=ing_data.es_removible,
                    )
                )

        self._session.refresh(producto)
        return producto

    def actualizar(self, id: int, data: ProductoUpdate) -> Producto:
        with ProductoUoW(self._session) as uow:
            producto = uow.productos.get_by_id(id)
            if not producto or producto.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id={id} no encontrado.",
                )

            cambios = data.model_dump(exclude_unset=True)
            for key, value in cambios.items():
                setattr(producto, key, value)
            producto.updated_at = datetime.utcnow()
            uow.productos.add(producto)

        self._session.refresh(producto)
        return producto

    def eliminar(self, id: int) -> None:
        with ProductoUoW(self._session) as uow:
            producto = uow.productos.get_by_id(id)
            if not producto or producto.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id={id} no encontrado.",
                )
            producto.deleted_at = datetime.utcnow()
            uow.productos.add(producto)
