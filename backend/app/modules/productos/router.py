from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductoReadDetalle,
)
from app.modules.productos.service import ProductoService

router = APIRouter(prefix="/productos", tags=["Productos"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/", response_model=list[ProductoRead], status_code=status.HTTP_200_OK)
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
):
    return ProductoService(session).listar(offset=offset, limit=limit, disponible=disponible)


@router.get("/{id}", response_model=ProductoReadDetalle, status_code=status.HTTP_200_OK)
def obtener_producto(id: int, session: SessionDep):
    return ProductoService(session).obtener(id)


@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, session: SessionDep):
    return ProductoService(session).crear(data)


@router.patch("/{id}", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def actualizar_producto(id: int, data: ProductoUpdate, session: SessionDep):
    return ProductoService(session).actualizar(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(id: int, session: SessionDep):
    ProductoService(session).eliminar(id)
