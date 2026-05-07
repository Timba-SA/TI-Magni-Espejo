# TODO: Implementar seed de datos obligatorios
#
# Tablas a seedear (marcadas con {seed} en el ERD):
#
# - Rol: ADMIN | STOCK | PEDIDOS | CLIENT
# - FormaPago: MERCADOPAGO | EFECTIVO | TRANSFERENCIA
# - EstadoPedido: PENDIENTE | CONFIRMADO | EN_PREP | EN_CAMINO | ENTREGADO | CANCELADO
#
# Patrón: INSERT ... ON CONFLICT DO NOTHING (idempotente)
# Llamar desde: backend/main.py en el lifespan hook (después de create_db_and_tables)
