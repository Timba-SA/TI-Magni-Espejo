from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.modules.direcciones.schemas import DireccionCreateRequest, DireccionUpdateRequest, DireccionResponse
from app.modules.direcciones.service import DireccionService

router = APIRouter(prefix="/direcciones", tags=["Direcciones"])

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[dict, Depends(get_current_user)]

@router.get("/", response_model=list[DireccionResponse], status_code=status.HTTP_200_OK)
def listar_direcciones(session: SessionDep, current_user: CurrentUser):
    """Lista las direcciones de entrega activas del usuario autenticado."""
    return DireccionService(session).listar(current_user["sub"])

@router.post("/", response_model=DireccionResponse, status_code=status.HTTP_200_OK)
def crear_direccion(data: DireccionCreateRequest, session: SessionDep, current_user: CurrentUser):
    """Crea una nueva dirección de entrega para el usuario autenticado."""
    return DireccionService(session).crear(current_user["sub"], data)

@router.put("/{id}", response_model=DireccionResponse, status_code=status.HTTP_200_OK)
def actualizar_direccion(id: int, data: DireccionUpdateRequest, session: SessionDep, current_user: CurrentUser):
    """Actualiza una dirección de entrega perteneciente al usuario autenticado."""
    return DireccionService(session).actualizar(id, current_user["sub"], data)

@router.patch("/{id}/principal", response_model=DireccionResponse, status_code=status.HTTP_200_OK)
def set_direccion_principal(id: int, session: SessionDep, current_user: CurrentUser):
    """Establece una dirección de entrega como la principal del usuario autenticado."""
    return DireccionService(session).set_principal(id, current_user["sub"])

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_direccion(
    id: int, 
    session: SessionDep, 
    current_user: CurrentUser,
    mock_active_orders: bool = Query(False)
):
    """Elimina (soft delete) una dirección de entrega perteneciente al usuario autenticado."""
    DireccionService(session).eliminar(id, current_user["sub"], mock_active_orders)
