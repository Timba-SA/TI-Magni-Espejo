from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session

from app.core.database import get_session
from app.core.dependencies import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead, CategoriaListResponse
from app.modules.categorias.service import CategoriaService

router = APIRouter(prefix="/categorias", tags=["Categorías"])

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/", response_model=CategoriaListResponse, status_code=status.HTTP_200_OK)
def listar_categorias(
    session: SessionDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    include_deleted: Annotated[bool, Query(description="Incluir categorías archivadas (solo admin)")] = False,
):
    items, total = CategoriaService(session).listar(skip, limit, include_deleted)
    return CategoriaListResponse(items=items, total=total, skip=skip, limit=limit)

@router.get("/exportar", status_code=status.HTTP_200_OK)
def exportar_categorias(
    session: SessionDep,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK")),
):
    file_bytes = CategoriaService(session).exportar()
    return StreamingResponse(
        content=iter([file_bytes]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=categorias.xlsx"},
    )


@router.get("/{id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def obtener_categoria(id: int, session: SessionDep):
    return CategoriaService(session).obtener(id)


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate,
    session: SessionDep,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK")),
):
    return CategoriaService(session).crear(data)


@router.patch("/{id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def actualizar_categoria(
    id: int,
    data: CategoriaUpdate,
    session: SessionDep,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK")),
):
    return CategoriaService(session).actualizar(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    id: int,
    session: SessionDep,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK")),
):
    """Archiva la categoría (soft delete). Desaparece de las listas normales."""
    CategoriaService(session).eliminar(id)


@router.patch("/{id}/toggle-active", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def toggle_active_categoria(
    id: int,
    session: SessionDep,
    _current_user: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK")),
):
    """Habilita o inhabilita una categoría. Sigue visible en el admin con etiqueta 'Inactivo'."""
    return CategoriaService(session).toggle_active(id)

