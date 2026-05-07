# TODO: Implementar repositorio de pagos
#
# PagoRepository(BaseRepository[Pago])
#
# Métodos adicionales:
# + get_by_pedido(pedido_id: int) → list[Pago]
# + get_by_external_reference(external_reference: str) → Pago | None
# + get_by_idempotency_key(key: str) → Pago | None
#   (para detectar reintentos y evitar cobros duplicados)
# + get_by_mp_payment_id(mp_payment_id: int) → Pago | None
#
# Regla: NUNCA commit/rollback aquí.
