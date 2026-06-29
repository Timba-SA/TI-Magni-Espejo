from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Header, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.modules.pagos.schemas import IniciarPagoRequest, WebhookPayload, PreferenceResponse, PagoResponse
from app.modules.pagos.service import PagoService

router = APIRouter(prefix="/pagos", tags=["Pagos"])

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[dict, Depends(get_current_user)]


@router.post("/crear", response_model=PreferenceResponse, status_code=status.HTTP_201_CREATED)
async def iniciar_pago(
    data: IniciarPagoRequest,
    session: SessionDep,
    current_user: CurrentUser
):
    """
    Inicia el flujo de pago con MercadoPago para un pedido.
    Retorna el preference_id y la URL init_point de MercadoPago.
    """
    usuario_id = current_user["sub"]
    return await PagoService(session).iniciar_pago(data.pedido_id, usuario_id)


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def procesar_webhook(
    payload: WebhookPayload,
    session: SessionDep,
    x_signature: Optional[str] = Header(None)
):
    """
    Receptor de notificaciones de webhooks asíncronos de MercadoPago.
    No requiere autenticación JWT. La firma X-Signature se valida en el servicio.
    """
    await PagoService(session).procesar_webhook(payload, x_signature)
    return {"status": "ok"}


@router.get("/{pedido_id}", response_model=list[PagoResponse], status_code=status.HTTP_200_OK)
def obtener_pagos_pedido(
    pedido_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """
    Retorna el historial de pagos asociados a un pedido específico.
    Solo puede ser consultado por el propio usuario del pedido o administradores.
    """
    usuario_id = current_user["sub"]
    roles = current_user.get("roles", [])
    return PagoService(session).get_pagos_pedido(pedido_id, usuario_id, roles)
