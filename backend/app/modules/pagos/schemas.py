# TODO: Implementar schemas de pagos
#
# --- Request ---
# - IniciarPagoRequest: pedido_id, forma_pago_codigo
#   (para MERCADOPAGO: genera preference_id del SDK)
#
# --- Webhook IPN (MercadoPago) ---
# - WebhookPayload: topic, resource  ← estructura de MP
#
# --- Response ---
# - PagoResponse: id, pedido_id, mp_payment_id, mp_status, mp_status_detail,
#                 external_reference, transaction_amount, payment_method_id,
#                 created_at, updated_at
# - PreferenceResponse: preference_id, init_point
#   (URL de checkout generada por SDK de MP)
#
# Mapeo estados MP → Food Store:
# approved   → pedido CONFIRMADO (via FSM pedidos)
# pending    → pedido sigue PENDIENTE
# rejected   → HTTP 402, pedido sigue PENDIENTE
# in_process → pedido sigue PENDIENTE
# cancelled  → cliente puede reintentar o cancelar pedido
