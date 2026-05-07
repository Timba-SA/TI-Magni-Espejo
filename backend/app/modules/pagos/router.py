# TODO: Implementar router de pagos
#
# Prefix: /api/v1/pagos
# Tags: ["Pagos"]
#
# Endpoints:
# POST /iniciar      → 200 PreferenceResponse      [Bearer]
#   Inicia el flujo de pago con MercadoPago para un pedido
#
# POST /webhook      → 200 {"status": "ok"}        [SIN autenticación JWT]
#   Receptor de notificaciones IPN de MercadoPago.
#   Validar firma X-Signature en el SERVICE (no aquí).
#   DEBE responder 200 rápido (MP reintenta si no recibe 200).
#
# GET  /pedido/{pedido_id} → 200 list[PagoResponse] [Bearer]
#   Historial de pagos de un pedido (para admin o dueño)
#
# CERO lógica de negocio en el router.
