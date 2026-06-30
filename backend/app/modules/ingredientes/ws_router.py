from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status

from app.core.security import decode_access_token
from app.core.ws_manager import ws_manager

router = APIRouter(tags=["Catálogo WebSockets"])

CATALOGO_ROOM = "catalogo"


@router.websocket("/ws/catalogo")
async def catalogo_ws_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
):
    """
    WebSocket para notificaciones en tiempo real del catálogo (ingredientes / productos).

    El backend emite PRODUCTO_ACTUALIZADO cada vez que el precio de un producto
    se recalcula por cambios en sus ingredientes. El frontend invalida la caché
    de productos al recibir este evento, sin necesidad de recargar la página.
    """
    await websocket.accept()

    if not token:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Token de autenticación faltante.",
        )
        return

    try:
        payload = decode_access_token(token)
    except Exception:
        await websocket.close(code=4001, reason="Token inválido o expirado.")
        return

    roles = payload.get("roles", [])
    is_staff = any(
        r in ["ADMIN", "ENCARGADO", "STOCK", "PEDIDOS", "CAJERO", "COCINERO"]
        for r in roles
    )
    if not is_staff:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Sin permisos para acceder a este canal.",
        )
        return

    ws_manager.connect(CATALOGO_ROOM, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(CATALOGO_ROOM, websocket)
