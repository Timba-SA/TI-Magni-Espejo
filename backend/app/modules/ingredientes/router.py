from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session

from app.core.database import get_session
from app.core.dependencies import get_current_user, require_role
from app.modules.ingredientes.schemas import (
    IngredienteCreate,
    IngredienteListResponse,
    IngredienteRead,
    IngredienteUpdate,
)
from app.modules.ingredientes.service import IngredienteService

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/", response_model=IngredienteListResponse, status_code=status.HTTP_200_OK)
def listar_ingredientes(
    session: SessionDep,
    nombre: Annotated[Optional[str], Query(description="Búsqueda parcial por nombre")] = None,
    es_alergeno: Annotated[Optional[bool], Query(description="Filtrar por alérgeno")] = None,
    skip: Annotated[int, Query(ge=0, description="Registros a saltar")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Límite de registros")] = 20,
    incluir_inactivos: Annotated[bool, Query(description="Incluir ingredientes inactivos")] = False,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK", "PEDIDOS", "CAJERO", "COCINERO")),
):
    return IngredienteService(session).listar(
        nombre, es_alergeno, skip, limit, incluir_inactivos
    )


# IMPORTANTE: /exportar debe ir ANTES de /{id}
# De lo contrario FastAPI interpreta "exportar" como un entero (id) y devuelve 422.
@router.get("/exportar", status_code=status.HTTP_200_OK)
def exportar_ingredientes(
    session: SessionDep,
    nombre: Annotated[Optional[str], Query()] = None,
    es_alergeno: Annotated[Optional[bool], Query()] = None,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK", "PEDIDOS", "CAJERO", "COCINERO")),
):
    file_bytes = IngredienteService(session).exportar(nombre, es_alergeno)
    return StreamingResponse(
        content=iter([file_bytes]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=ingredientes.xlsx"},
    )


@router.get("/{id}", response_model=IngredienteRead, status_code=status.HTTP_200_OK)
def obtener_ingrediente(
    id: int,
    session: SessionDep,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK", "PEDIDOS", "CAJERO", "COCINERO")),
):
    return IngredienteService(session).obtener(id)


@router.post(
    "/",
    response_model=IngredienteRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_ingrediente(
    data: IngredienteCreate,
    session: SessionDep,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK")),
):
    return IngredienteService(session).crear(data)


@router.patch("/{id}", response_model=IngredienteRead, status_code=status.HTTP_200_OK)
def actualizar_ingrediente(
    id: int,
    data: IngredienteUpdate,
    session: SessionDep,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK")),
):
    return IngredienteService(session).actualizar(id, data)


@router.patch("/{id}/toggle-active", response_model=IngredienteRead, status_code=status.HTTP_200_OK)
def toggle_active_ingrediente(
    id: int,
    session: SessionDep,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK")),
):
    """Habilita o inhabilita un ingrediente. Sigue visible en el admin con etiqueta 'Inactivo'."""
    return IngredienteService(session).toggle_active(id)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_ingrediente(
    id: int,
    session: SessionDep,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK")),
):
    """Archiva el ingrediente (soft delete). Desaparece de las listas normales."""
    IngredienteService(session).eliminar(id)

