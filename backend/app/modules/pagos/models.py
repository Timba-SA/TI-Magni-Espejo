# TODO: Implementar modelo Pago
#
# Tabla: Pago <<Table>>
# Dominio 3 - Ventas, Pagos & Trazabilidad
#
# Patrón: Idempotent Payment
#
# Campos:
# - id: BIGSERIAL {PK}
# - pedido_id: BIGINT {FK → Pedido.id, NN}  ← ON DELETE CASCADE
# MercadoPago Checkout API:
# - mp_payment_id: BIGINT {UQ, NULL}
#   NULL mientras pago pendiente de confirmación IPN
# - mp_status: VARCHAR(30) {NN}
#   Valores MP: pending | approved | rejected | in_process | cancelled
# - mp_status_detail: VARCHAR(100)
#   Ej: accredited | cc_rejected_other_reason | cc_rejected_insufficient_amount
# - external_reference: VARCHAR(100) {UQ, NN}
#   UUID que identifica el Pedido en MercadoPago
# - idempotency_key: VARCHAR(100) {UQ, NN}
#   UUID generado por el backend ANTES de llamar al SDK.
#   Enviado en header X-Idempotency-Key. Evita cobros duplicados.
# - transaction_amount: DECIMAL(10,2) {NN}
#   Monto cobrado por MP (puede diferir del total por intereses)
# - payment_method_id: VARCHAR(50)
#   Ej: visa | master | account_money | rapipago | pagofacil
# - created_at: TIMESTAMPTZ {NN}
# - updated_at: TIMESTAMPTZ {NN}
#   Se actualiza cuando webhook IPN cambia mp_status
