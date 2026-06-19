from datetime import datetime
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status
from sqlmodel import Session

from app.modules.productos.models import Producto, ProductoCategoria, ProductoIngrediente, UnidadMedida
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoDisponibilidadUpdate,
    UnidadMedidaCreate,
    UnidadMedidaUpdate,
)
from app.modules.productos.unit_of_work import ProductoUoW


def recalcular_producto_stock_y_precio(session: Session, producto_id: int) -> None:
    from app.modules.ingredientes.repository import IngredienteRepository
    from app.modules.productos.repository import ProductoIngredienteRepository, ProductoRepository

    prod_repo = ProductoRepository(session)
    pi_repo = ProductoIngredienteRepository(session)
    ing_repo = IngredienteRepository(session)

    producto = prod_repo.get_by_id(producto_id)
    if not producto:
        return

    receta = pi_repo.get_by_producto(producto_id)

    if not receta:
        producto.stock_cantidad = 0
        producto.precio_base = Decimal("0.00")
    else:
        stocks = []
        precio_total = Decimal("0.00")
        for pi in receta:
            ingrediente = ing_repo.get_by_id(pi.ingrediente_id)
            if ingrediente:
                # Sincronizar unidad_medida_id
                if pi.unidad_medida_id != ingrediente.unidad_medida_id:
                    pi.unidad_medida_id = ingrediente.unidad_medida_id
                    pi_repo.mark_dirty(pi)

                stock_posible = ingrediente.stock_actual / pi.cantidad
                stocks.append(stock_posible)
                precio_total += ingrediente.costo_unitario * pi.cantidad

        if stocks:
            producto.stock_cantidad = int(min(stocks))
        else:
            producto.stock_cantidad = 0
        producto.precio_base = precio_total

    producto.updated_at = datetime.utcnow()
    prod_repo.update(producto)



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
            uow.unidades_medida.hard_delete(um)


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
        categoria_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> list[Producto]:
        with ProductoUoW(self._session) as uow:
            return uow.productos.get_all_activos(
                offset=offset,
                limit=limit,
                disponible=disponible,
                include_deleted=include_deleted,
                categoria_id=categoria_id,
                search=search,
            )


    def obtener(self, id: int) -> Producto:
        with ProductoUoW(self._session) as uow:
            producto = uow.productos.get_by_id_with_relations(id)
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

            # Inicializamos precio_base y stock_cantidad en 0, se recalcularán
            producto = Producto(
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=Decimal("0.00"),
                imagenes_url=data.imagenes_url,
                stock_cantidad=0,
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
                uow.producto_ingredientes.add(
                    ProductoIngrediente(
                        producto_id=producto.id,
                        ingrediente_id=ing_data.ingrediente_id,
                        cantidad=ing_data.cantidad,
                        unidad_medida_id=ingrediente.unidad_medida_id,  # Se obtiene automáticamente del ingrediente
                        es_removible=ing_data.es_removible,
                    )
                )
            
            # Forzar flush de las relaciones para poder calcular
            self._session.flush()
            recalcular_producto_stock_y_precio(self._session, producto.id)

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

            # Actualizar relaciones de categorías si se incluyeron
            if data.categorias is not None:
                if not data.categorias:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail="Un producto debe tener al menos una categoría.",
                    )
                # Borrar anteriores
                uow.producto_categorias.delete_by_producto(producto.id)
                # Insertar nuevas
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

            # Actualizar relaciones de ingredientes si se incluyeron
            if data.ingredientes is not None:
                # Borrar anteriores
                uow.producto_ingredientes.delete_by_producto(producto.id)
                # Insertar nuevos
                for ing_data in data.ingredientes:
                    ingrediente = uow.ingredientes.get_by_id(ing_data.ingrediente_id)
                    if not ingrediente:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Ingrediente con id={ing_data.ingrediente_id} no encontrado.",
                        )
                    if ing_data.cantidad <= 0:
                        raise HTTPException(
                            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="La cantidad debe ser mayor a cero.",
                        )
                    uow.producto_ingredientes.add(
                        ProductoIngrediente(
                            producto_id=producto.id,
                            ingrediente_id=ing_data.ingrediente_id,
                            cantidad=ing_data.cantidad,
                            unidad_medida_id=ingrediente.unidad_medida_id,  # Se obtiene automáticamente del ingrediente
                            es_removible=ing_data.es_removible,
                        )
                    )

            # Excluimos precio_base y stock_cantidad de la actualización directa, ya que se recalcularán automáticamente.
            cambios = data.model_dump(
                exclude_unset=True, 
                exclude={"categorias", "ingredientes", "precio_base", "stock_cantidad"}
            )
            for key, value in cambios.items():
                setattr(producto, key, value)
            producto.updated_at = datetime.utcnow()
            uow.productos.add(producto)
            
            # Forzar flush y recalcular
            self._session.flush()
            recalcular_producto_stock_y_precio(self._session, producto.id)

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

    def actualizar_disponibilidad(self, id: int, data: ProductoDisponibilidadUpdate) -> Producto:
        with ProductoUoW(self._session) as uow:
            producto = uow.productos.get_by_id(id)
            if not producto or producto.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id={id} no encontrado.",
                )

            if data.stock_cantidad is not None:
                producto.stock_cantidad = data.stock_cantidad
            if data.disponible is not None:
                producto.disponible = data.disponible

            producto.updated_at = datetime.utcnow()
            uow.productos.add(producto)

        self._session.refresh(producto)
        return producto

    def reactivar(self, id: int) -> Producto:
        with ProductoUoW(self._session) as uow:
            producto = uow.productos.get_by_id(id)
            if not producto:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id={id} no encontrado.",
                )
            producto.deleted_at = None
            producto.updated_at = datetime.utcnow()
            uow.productos.add(producto)

        self._session.refresh(producto)
        return producto

