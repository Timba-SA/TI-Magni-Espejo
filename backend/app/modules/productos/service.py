from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlmodel import Session

from app.modules.productos.models import Producto, ProductoCategoria, ProductoIngrediente, UnidadMedida
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    UnidadMedidaCreate,
    UnidadMedidaUpdate,
)
from app.modules.productos.unit_of_work import ProductoUoW


# ─── UnidadMedidaService ──────────────────────────────────────────────────────

class UnidadMedidaService:
    def __init__(self, session: Session):
        self._session = session

    def listar(self) -> list[UnidadMedida]:
        with ProductoUoW(self._session) as uow:
            return uow.unidades_medida.get_all()

    def obtener(self, id: int) -> UnidadMedida:
        with ProductoUoW(self._session) as uow:
            um = uow.unidades_medida.get_by_id(id)
            if not um:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Unidad de medida con id={id} no encontrada.",
                )
            return um

    def crear(self, data: UnidadMedidaCreate) -> UnidadMedida:
        with ProductoUoW(self._session) as uow:
            # Validar unicidad de nombre
            if uow.unidades_medida.get_by_nombre(data.nombre):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ya existe una unidad de medida con el nombre '{data.nombre}'.",
                )
            # Validar unicidad de símbolo
            if uow.unidades_medida.get_by_simbolo(data.simbolo):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ya existe una unidad de medida con el símbolo '{data.simbolo}'.",
                )
            um = UnidadMedida(
                nombre=data.nombre,
                simbolo=data.simbolo,
                tipo=data.tipo,
            )
            uow.unidades_medida.add(um)

        self._session.refresh(um)
        return um

    def actualizar(self, id: int, data: UnidadMedidaUpdate) -> UnidadMedida:
        with ProductoUoW(self._session) as uow:
            um = uow.unidades_medida.get_by_id(id)
            if not um:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Unidad de medida con id={id} no encontrada.",
                )
            if data.nombre and data.nombre != um.nombre:
                if uow.unidades_medida.get_by_nombre(data.nombre):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Ya existe una unidad de medida con el nombre '{data.nombre}'.",
                    )
            if data.simbolo and data.simbolo != um.simbolo:
                if uow.unidades_medida.get_by_simbolo(data.simbolo):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Ya existe una unidad de medida con el símbolo '{data.simbolo}'.",
                    )
            cambios = data.model_dump(exclude_unset=True)
            for key, value in cambios.items():
                setattr(um, key, value)
            uow.unidades_medida.add(um)

        self._session.refresh(um)
        return um

    def eliminar(self, id: int) -> None:
        with ProductoUoW(self._session) as uow:
            um = uow.unidades_medida.get_by_id(id)
            if not um:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Unidad de medida con id={id} no encontrada.",
                )
            self._session.delete(um)


# ─── ProductoService ──────────────────────────────────────────────────────────

class ProductoService:
    def __init__(self, session: Session):
        self._session = session

    def listar(
        self,
        offset: int = 0,
        limit: int = 20,
        disponible: Optional[bool] = None,
        include_deleted: bool = False,
    ) -> list[Producto]:
        with ProductoUoW(self._session) as uow:
            return uow.productos.get_all_activos(
                offset=offset, limit=limit, disponible=disponible, include_deleted=include_deleted
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
            # Validar unidad de venta si se proporcionó
            if data.unidad_venta_id is not None:
                if not uow.unidades_medida.get_by_id(data.unidad_venta_id):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"La unidad de venta con id={data.unidad_venta_id} no existe.",
                    )

            producto = Producto(
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagenes_url=data.imagenes_url,
                stock_cantidad=data.stock_cantidad,
                disponible=data.disponible,
                unidad_venta_id=data.unidad_venta_id,
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
                # Validar unidad de medida del ingrediente si se proporcionó
                if ing_data.unidad_medida_id is not None:
                    if not uow.unidades_medida.get_by_id(ing_data.unidad_medida_id):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"La unidad de medida con id={ing_data.unidad_medida_id} no existe.",
                        )
                uow.producto_ingredientes.add(
                    ProductoIngrediente(
                        producto_id=producto.id,
                        ingrediente_id=ing_data.ingrediente_id,
                        cantidad=ing_data.cantidad,
                        unidad_medida_id=ing_data.unidad_medida_id,
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

            # Validar unidad de venta si se está actualizando
            if data.unidad_venta_id is not None:
                if not uow.unidades_medida.get_by_id(data.unidad_venta_id):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"La unidad de venta con id={data.unidad_venta_id} no existe.",
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
            uow.productos.soft_delete(producto)
            # __exit__ del UoW hace commit

    def asociar_ingrediente(self, producto_id: int, data) -> ProductoIngrediente:
        from app.modules.productos.schemas import ProductoIngredienteCreate
        with ProductoUoW(self._session) as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or producto.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id={producto_id} no encontrado.",
                )
            ingrediente = uow.ingredientes.get_by_id(data.ingrediente_id)
            if not ingrediente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id={data.ingrediente_id} no encontrado.",
                )
            if data.unidad_medida_id is not None:
                if not uow.unidades_medida.get_by_id(data.unidad_medida_id):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"La unidad de medida con id={data.unidad_medida_id} no existe.",
                    )
            # Validar cantidad > 0
            if data.cantidad <= 0:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="La cantidad debe ser mayor a cero.",
                )
            pi = ProductoIngrediente(
                producto_id=producto_id,
                ingrediente_id=data.ingrediente_id,
                cantidad=data.cantidad,
                unidad_medida_id=data.unidad_medida_id,
                es_removible=data.es_removible,
            )
            uow.producto_ingredientes.add(pi)

        self._session.refresh(pi)
        return pi
