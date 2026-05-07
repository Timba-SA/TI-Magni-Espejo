# TODO: Implementar servicio de pagos
#
# Responsabilidades (TODA la lógica de negocio):
#
# - iniciar_pago(pedido_id: int, usuario_id: int) → PreferenceResponse
#   · Verificar que el pedido pertenece al usuario y está en PENDIENTE
#   · Generar idempotency_key (UUID)
#   · Generar external_reference (UUID basado en pedido_id o UUID v4)
#   · Llamar al SDK de MercadoPago para crear la preference
#   · Crear registro Pago con mp_status="pending" via UoW
#   · Retornar init_point (URL de checkout de MP)
#
# - procesar_webhook(payload: WebhookPayload) → None
#   Flujo webhook IPN (POST /api/v1/pagos/webhook):
#   1. Validar firma X-Signature con MP_WEBHOOK_SECRET
#   2. Si topic=payment → sdk.payment().get(resource_id)
#   3. Actualizar Pago.mp_status + mp_status_detail via UoW
#   4. Si approved → avanzar Pedido a CONFIRMADO (llama a PedidosService.avanzar_estado)
#   5. HTTP 200 {"status": "ok"} (MP reintenta si no recibe 200)
#
# Manejo de reintentos (idempotencia):
#   Si idempotency_key ya existe en DB → retornar Pago existente sin llamar al SDK
#
# Variables de entorno requeridas (via Settings):
# - MP_ACCESS_TOKEN
# - MP_WEBHOOK_SECRET
