import uuid
import hmac
import hashlib
import inspect
from datetime import datetime
from decimal import Decimal
from typing import Optional
from fastapi import HTTPException, status
import httpx
from sqlmodel import Session

from app.core.config import settings
from app.modules.pagos.models import Pago
from app.modules.pagos.schemas import WebhookPayload, PreferenceResponse
from app.modules.pagos.unit_of_work import PagoUoW
from app.modules.pedidos.models import Pedido
from app.modules.pedidos.service import PedidoService
from app.modules.pedidos.schemas import AvanzarEstadoRequest


class PagoService:
    def __init__(self, session: Session):
        self._session = session

    async def iniciar_pago(self, pedido_id: int, current_user_id: int) -> PreferenceResponse:
        """
        Inicia un flujo de pago creando una preferencia de MercadoPago de forma asíncrona.
        Implementa control de idempotencia para pedidos con un intento pendiente activo.
        """
        with PagoUoW(self._session) as uow:
            # 1. Control de Idempotencia: buscar si ya existe un pago pendiente para este pedido
            pagos_existentes = uow.pagos.get_by_pedido(pedido_id)
            pago_pendiente = next((p for p in pagos_existentes if p.mp_status == "pending"), None)
            
            if pago_pendiente and pago_pendiente.preference_id and pago_pendiente.init_point:
                return PreferenceResponse(
                    preference_id=pago_pendiente.preference_id,
                    init_point=pago_pendiente.init_point
                )

            # 2. Obtener y validar el pedido
            pedido_service = PedidoService(self._session)
            # Validamos que exista y pertenezca al usuario (u obtener permisos adecuados)
            # En la firma de get_pedido pasamos roles como ["CLIENT"] para asegurar propiedad
            pedido = pedido_service.get_pedido(pedido_id, current_user_id, ["CLIENT"])

            if pedido.estado_codigo != "PENDIENTE":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El pedido no se puede pagar en estado {pedido.estado_codigo}"
                )

            # 3. Preparar claves únicas
            idempotency_key = str(uuid.uuid4())
            external_reference = f"pedido_{pedido_id}"

            # 4. Consumir Checkout API de MercadoPago asíncronamente con HTTPX
            mp_url = "https://api.mercadopago.com/checkout/preferences"
            headers = {
                "Authorization": f"Bearer {settings.MP_ACCESS_TOKEN}",
                "X-Idempotency-Key": idempotency_key,
                "Content-Type": "application/json"
            }
            
            success_url = f"{settings.FRONTEND_ORIGIN}/checkout/success"
            failure_url = f"{settings.FRONTEND_ORIGIN}/checkout/failure"
            pending_url = f"{settings.FRONTEND_ORIGIN}/checkout/pending"

            # Mercado Pago exige que las URLs de retorno utilicen obligatoriamente HTTPS (incluso para localhost)
            if success_url.startswith("http://"):
                success_url = success_url.replace("http://", "https://", 1)
            if failure_url.startswith("http://"):
                failure_url = failure_url.replace("http://", "https://", 1)
            if pending_url.startswith("http://"):
                pending_url = pending_url.replace("http://", "https://", 1)

            # Armar ítems reales del pedido para mostrarlos en MercadoPago
            mp_items = [
                {
                    "title": detalle.nombre_snapshot,
                    "quantity": detalle.cantidad,
                    "unit_price": float(detalle.precio_snapshot),
                    "currency_id": "ARS"
                }
                for detalle in pedido.detalles
            ]
            # Fallback por si el pedido llega sin detalles
            if not mp_items:
                mp_items = [
                    {
                        "title": f"Pedido #{pedido_id} - The Food Store",
                        "quantity": 1,
                        "unit_price": float(pedido.total),
                        "currency_id": "ARS"
                    }
                ]

            payload = {
                "items": mp_items,
                "external_reference": external_reference,
                "back_urls": {
                    "success": success_url,
                    "failure": failure_url,
                    "pending": pending_url
                },
                "auto_return": "approved"
            }

            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(mp_url, json=payload, headers=headers, timeout=10.0)
                
                if response.status_code not in [200, 201]:
                    print(f"MERCADOPAGO ERROR RESPONSE: status={response.status_code}, body={response.text}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Error al conectar con MercadoPago: {response.text}"
                    )
                
                mp_data = response.json()
                if inspect.isawaitable(mp_data):
                    mp_data = await mp_data
                preference_id = mp_data["id"]
                init_point = mp_data["init_point"]

            except Exception as e:
                # Si estamos testeando o hubo un fallo de red, y es controlado por mock
                if isinstance(e, HTTPException):
                    raise e
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error en comunicación asíncrona de pago: {str(e)}"
                )

            # 5. Crear el registro del pago
            nuevo_pago = Pago(
                pedido_id=pedido_id,
                mp_status="pending",
                external_reference=external_reference,
                idempotency_key=idempotency_key,
                transaction_amount=pedido.total,
                preference_id=preference_id,
                init_point=init_point,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            uow.pagos.add(nuevo_pago)

            return PreferenceResponse(
                preference_id=preference_id,
                init_point=init_point
            )

    async def procesar_webhook(self, payload: WebhookPayload, signature_header: Optional[str]) -> None:
        """
        Procesa notificaciones webhooks asíncronas de MercadoPago de forma segura.
        Valida criptográficamente el header X-Signature usando HMAC-SHA256.
        """
        # 1. Validar firma digital X-Signature
        if not signature_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Falta el header de firma X-Signature"
            )

        # Parsear header ts=...,v1=...
        parts = {k.strip(): v.strip() for part in signature_header.split(",") for k, v in [part.split("=")]}
        ts = parts.get("ts")
        v1 = parts.get("v1")

        if not ts or not v1:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Formato de firma X-Signature inválido"
            )

        # Extraer ID del recurso
        if not payload.data or "id" not in payload.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Falta el ID del pago en los datos del webhook"
            )
        
        mp_payment_id = payload.data["id"]

        # Armar manifest y validar HMAC
        manifest = f"id:{mp_payment_id};ts:{ts}"
        secret_bytes = (settings.MP_WEBHOOK_SECRET or "").encode()
        computed_signature = hmac.new(secret_bytes, manifest.encode(), hashlib.sha256).hexdigest()

        if not hmac.compare_digest(computed_signature, v1):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Firma digital X-Signature inválida"
            )

        # 2. Consultar detalles de la transacción en la API de MercadoPago
        payment_url = f"https://api.mercadopago.com/v1/payments/{mp_payment_id}"
        headers = {
            "Authorization": f"Bearer {settings.MP_ACCESS_TOKEN}"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(payment_url, headers=headers, timeout=10.0)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"No se pudo consultar el pago {mp_payment_id} en MercadoPago"
                )
            
            payment_data = response.json()
            if inspect.isawaitable(payment_data):
                payment_data = await payment_data
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Fallo al consultar el estado de pago asíncronamente: {str(e)}"
            )

        # 3. Procesar y actualizar DB
        external_reference = payment_data.get("external_reference")
        mp_status = payment_data.get("status")
        mp_status_detail = payment_data.get("status_detail")
        payment_method_id = payment_data.get("payment_method_id")

        if not external_reference:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El pago consultado no tiene external_reference"
            )

        with PagoUoW(self._session) as uow:
            pago = uow.pagos.get_by_external_reference(external_reference)
            if not pago:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No se encontró un registro de pago para {external_reference}"
                )

            # Actualizar Pago
            pago.mp_status = mp_status
            pago.mp_status_detail = mp_status_detail
            pago.mp_payment_id = int(mp_payment_id)
            pago.payment_method_id = payment_method_id
            pago.updated_at = datetime.utcnow()
            uow.pagos.update(pago)

            # 4. Si el pago está aprobado, avanzar atómicamente el estado del pedido a CONFIRMADO
            if mp_status == "approved":
                pedido_service = PedidoService(self._session)
                # Obtenemos el pedido para recuperar el usuario dueño del pedido
                pedido = uow.pedidos.get_by_id(pago.pedido_id) if hasattr(pago, "pedido_id") else None
                if not pedido:
                    # Alternativa por las dudas
                    pedido_id_num = int(external_reference.replace("pedido_", ""))
                    pedido = pedido_service.get_pedido(pedido_id_num, 1, ["ADMIN"])
                
                # Avanzar estado del pedido mediante PedidoService
                # Usamos ADMIN para bypassear restricciones de usuario del FSM
                avanzar_req = AvanzarEstadoRequest(
                    estado_hacia="CONFIRMADO",
                    motivo=f"Pago aprobado via MercadoPago (Pago ID: {mp_payment_id})"
                )
                pedido_service.avanzar_estado(pedido.id, pedido.usuario_id, ["ADMIN"], avanzar_req)
