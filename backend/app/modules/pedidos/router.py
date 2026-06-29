from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.dependencies import get_current_user, require_role
from app.modules.pedidos.schemas import (
    FormaPagoResponse,
    PedidoResponse,
    PedidoDetailResponse,
    HistorialEstadoResponse,
    CrearPedidoRequest,
    AvanzarEstadoRequest,
)
from app.modules.pedidos.service import PedidoService

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[dict, Depends(get_current_user)]


@router.get("/formas-pago", response_model=list[FormaPagoResponse], status_code=status.HTTP_200_OK)
def listar_formas_pago(session: SessionDep, current_user: CurrentUser):
    return PedidoService(session).get_formas_pago()


@router.get("/", response_model=list[PedidoResponse], status_code=status.HTTP_200_OK)
def listar_pedidos(session: SessionDep, current_user: CurrentUser):
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    return PedidoService(session).get_mis_pedidos(usuario_id, roles)


@router.get("/gestion", response_model=list[PedidoResponse], status_code=status.HTTP_200_OK)
def listar_pedidos_gestion(
    session: SessionDep,
    current_user: Annotated[dict, Depends(require_role("ADMIN", "ENCARGADO", "CAJERO", "COCINERO", "PEDIDOS"))]
):
    return PedidoService(session).get_pedidos_gestion()


@router.post("/", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: CrearPedidoRequest, session: SessionDep, current_user: CurrentUser):
    usuario_id = current_user["sub"]
    return PedidoService(session).crear(usuario_id, data)


@router.get("/{id}", response_model=PedidoDetailResponse, status_code=status.HTTP_200_OK)
def obtener_pedido(id: int, session: SessionDep, current_user: CurrentUser):
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    return PedidoService(session).get_pedido(id, usuario_id, roles)


@router.get("/{id}/historial", response_model=list[HistorialEstadoResponse], status_code=status.HTTP_200_OK)
def obtener_historial(id: int, session: SessionDep, current_user: CurrentUser):
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    return PedidoService(session).get_historial(id, usuario_id, roles)


@router.patch("/{id}/estado", response_model=PedidoResponse, status_code=status.HTTP_200_OK)
async def avanzar_estado(
    id: int,
    data: AvanzarEstadoRequest,
    session: SessionDep,
    current_user: Annotated[dict, Depends(require_role("ADMIN", "ENCARGADO", "CAJERO", "COCINERO", "PEDIDOS", "CLIENT", "CLIENTE"))]
):
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    return PedidoService(session).avanzar_estado(id, usuario_id, roles, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_pedido(id: int, session: SessionDep, current_user: CurrentUser):
    from app.modules.pedidos.schemas import AvanzarEstadoRequest
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    PedidoService(session).avanzar_estado(
        id,
        usuario_id,
        roles,
        AvanzarEstadoRequest(estado_hacia="CANCELADO", motivo="Cancelado via DELETE")
    )
