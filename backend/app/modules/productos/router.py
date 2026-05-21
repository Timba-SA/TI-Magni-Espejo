from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductoReadDetalle,
    UnidadMedidaCreate,
    UnidadMedidaUpdate,
    UnidadMedidaRead,
)
from app.modules.productos.service import ProductoService, UnidadMedidaService

router = APIRouter(tags=["Productos"])

SessionDep = Annotated[Session, Depends(get_session)]


# ─── UnidadMedida endpoints ───────────────────────────────────────────────────

@router.get("/unidades-medida/", response_model=list[UnidadMedidaRead], status_code=status.HTTP_200_OK)
def listar_unidades_medida(session: SessionDep):
    return UnidadMedidaService(session).listar()


@router.get("/unidades-medida/{id}", response_model=UnidadMedidaRead, status_code=status.HTTP_200_OK)
def obtener_unidad_medida(id: int, session: SessionDep):
    return UnidadMedidaService(session).obtener(id)


@router.post("/unidades-medida/", response_model=UnidadMedidaRead, status_code=status.HTTP_200_OK)
def crear_unidad_medida(data: UnidadMedidaCreate, session: SessionDep):
    return UnidadMedidaService(session).crear(data)


@router.patch("/unidades-medida/{id}", response_model=UnidadMedidaRead, status_code=status.HTTP_200_OK)
def actualizar_unidad_medida(id: int, data: UnidadMedidaUpdate, session: SessionDep):
    return UnidadMedidaService(session).actualizar(id, data)


@router.delete("/unidades-medida/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_unidad_medida(id: int, session: SessionDep):
    UnidadMedidaService(session).eliminar(id)


# ─── Producto endpoints ───────────────────────────────────────────────────────

@router.get("/productos/", response_model=list[ProductoRead], status_code=status.HTTP_200_OK)
def listar_productos(
    session: SessionDep,
    offset: Annotated[int, Query(ge=0, description="Cantidad de registros a omitir")] = 0,
    limit: Annotated[
        int, Query(ge=1, le=100, description="Cantidad máxima de registros a retornar")
    ] = 20,
    disponible: Annotated[
        Optional[bool],
        Query(description="Filtrar por disponibilidad"),
    ] = None,
    include_deleted: Annotated[
        bool,
        Query(description="Incluir productos archivados (solo admin)"),
    ] = False,
):
    return ProductoService(session).listar(offset=offset, limit=limit, disponible=disponible, include_deleted=include_deleted)


@router.get("/productos/{id}", response_model=ProductoReadDetalle, status_code=status.HTTP_200_OK)
def obtener_producto(id: int, session: SessionDep):
    return ProductoService(session).obtener(id)


@router.post("/productos/", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def crear_producto(data: ProductoCreate, session: SessionDep):
    return ProductoService(session).crear(data)


@router.patch("/productos/{id}", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def actualizar_producto(id: int, data: ProductoUpdate, session: SessionDep):
    return ProductoService(session).actualizar(id, data)


@router.delete("/productos/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(id: int, session: SessionDep):
    ProductoService(session).eliminar(id)


# ─── Ingredientes de un Producto ──────────────────────────────────────────────

from app.modules.productos.schemas import ProductoIngredienteCreate, ProductoIngredienteRead

@router.post(
    "/productos/{id}/ingredientes",
    response_model=ProductoIngredienteRead,
    status_code=status.HTTP_200_OK,
)
def asociar_ingrediente(id: int, data: ProductoIngredienteCreate, session: SessionDep):
    return ProductoService(session).asociar_ingrediente(id, data)
