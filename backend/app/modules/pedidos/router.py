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
    """
    Retorna la lista de formas de pago habilitadas.
    """
    return PedidoService(session).get_formas_pago()


@router.get("/", response_model=list[PedidoResponse], status_code=status.HTTP_200_OK)
def listar_pedidos(session: SessionDep, current_user: CurrentUser):
    """
    Lista todos los pedidos activos del usuario logueado de manera aislada.
    """
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    return PedidoService(session).get_mis_pedidos(usuario_id, roles)


@router.get("/gestion", response_model=list[PedidoResponse], status_code=status.HTTP_200_OK)
def listar_pedidos_gestion(
    session: SessionDep,
    current_user: Annotated[dict, Depends(require_role("ADMIN", "ENCARGADO", "CAJERO", "COCINERO", "PEDIDOS"))]
):
    """
    Lista todos los pedidos activos en el local (para administración y gestión).
    """
    return PedidoService(session).get_pedidos_gestion()


@router.post("/", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: CrearPedidoRequest, session: SessionDep, current_user: CurrentUser):
    """
    Crea un nuevo pedido reduciendo el stock y registrando snapshots e historial inicial.
    """
    usuario_id = current_user["sub"]
    return PedidoService(session).crear(usuario_id, data)


@router.get("/{id}", response_model=PedidoDetailResponse, status_code=status.HTTP_200_OK)
def obtener_pedido(id: int, session: SessionDep, current_user: CurrentUser):
    """
    Obtiene los detalles completos y el historial de estados de un pedido.
    - ADMIN/PEDIDOS pueden ver cualquier pedido.
    - CLIENT solo puede ver sus propios pedidos.
    """
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    return PedidoService(session).get_pedido(id, usuario_id, roles)


@router.get("/{id}/historial", response_model=list[HistorialEstadoResponse], status_code=status.HTTP_200_OK)
def obtener_historial(id: int, session: SessionDep, current_user: CurrentUser):
    """
    Retorna el historial completo de transiciones de estado de un pedido, ordenado ASC.
    - ADMIN/PEDIDOS pueden ver historial de cualquier pedido.
    - CLIENT solo puede ver el de sus propios pedidos.
    """
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    pedido = PedidoService(session).get_pedido(id, usuario_id, roles)
    return pedido.historial


@router.patch("/{id}/estado", response_model=PedidoResponse, status_code=status.HTTP_200_OK)
def avanzar_estado(id: int, data: AvanzarEstadoRequest, session: SessionDep, current_user: CurrentUser):
    """
    Avanza o cambia el estado de un pedido en base a la FSM y verifica roles de usuario.
    """
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    return PedidoService(session).avanzar_estado(id, usuario_id, roles, data)


@router.delete("/{id}", response_model=PedidoResponse, status_code=status.HTTP_200_OK)
def cancelar_pedido_propio(id: int, session: SessionDep, current_user: CurrentUser):
    """
    Cancela el propio pedido del cliente si está en estado PENDIENTE o CONFIRMADO (RN-05).
    Solo el propietario del pedido puede usar este endpoint.
    """
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    data = AvanzarEstadoRequest(nuevo_estado="CANCELADO", motivo="Cancelado por el cliente.")
    return PedidoService(session).avanzar_estado(id, usuario_id, roles, data)
