from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_access_token
from app.core.ws_manager import ws_manager
from app.modules.pedidos.models import Pedido

router = APIRouter(tags=["Pedidos WebSockets"])

@router.websocket("/ws/pedidos")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    pedido_id: Optional[int] = Query(None),
    session: Session = Depends(get_session)
):
    # Aceptamos la conexión para poder enviar códigos de cierre específicos
    await websocket.accept()

    rooms_to_subscribe = []
    try:
        # 1. Validación JWT
        if not token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Token de autenticación faltante.")
            return
        
        try:
            payload = decode_access_token(token)
        except Exception:
            # Enviar close code 4001 para que el front sepa que tiene que renovar el token
            await websocket.close(code=4001, reason="Token inválido o expirado.")
            return
            
        usuario_id = int(payload["sub"])
        roles = payload.get("roles", [])
        
        # Determinar si es personal administrativo
        is_staff = any(r in ["ADMIN", "ENCARGADO", "CAJERO", "COCINERO", "PEDIDOS"] for r in roles)
        
        # 2. Validación de propiedad del pedido (si se requiere)
        if pedido_id is not None:
            pedido = session.get(Pedido, pedido_id)
            if not pedido or pedido.deleted_at is not None:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Pedido no encontrado.")
                return
            if not is_staff and pedido.usuario_id != usuario_id:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="No tenés permisos para acceder a este pedido.")
                return
            rooms_to_subscribe.append(f"pedido_{pedido_id}")
        else:
            if is_staff:
                rooms_to_subscribe.append("admin")
            else:
                rooms_to_subscribe.append(f"user_{usuario_id}")
                
        # 3. Registrar en el ws_manager en las salas correspondientes
        for room in rooms_to_subscribe:
            ws_manager.connect(room, websocket)
    finally:
        # Garantizamos liberar la conexión a la base de datos inmediatamente después de validar / registrar
        session.close()
        
    try:
        # Bucle de escucha keep-alive / ping-pong
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        # Limpieza al desconectar
        for room in rooms_to_subscribe:
            ws_manager.disconnect(room, websocket)
