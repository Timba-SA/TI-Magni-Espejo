# TODO: Implementar schemas de pedidos
#
# --- Request ---
# - ItemPedidoRequest: producto_id, cantidad, personalizacion: list[int] | None
# - CrearPedidoRequest: items: list[ItemPedidoRequest], direccion_id: int | None,
#                       forma_pago_codigo: str, notas: str | None
# - AvanzarEstadoRequest: estado_hacia: str, motivo: str | None
#   (motivo requerido si estado_hacia == "CANCELADO", validar en schema o service)
#
# --- Response ---
# - EstadoPedidoResponse: codigo, descripcion, orden, es_terminal
# - FormaPagoResponse: codigo, descripcion, habilitado
# - DetallePedidoResponse: producto_id, cantidad, nombre_snapshot, precio_snapshot,
#                           subtotal_snap, personalizacion
# - HistorialEstadoResponse: id, estado_desde, estado_hacia, usuario_id, motivo, created_at
# - PedidoResponse: id, usuario_id, direccion_id, estado_codigo, forma_pago_codigo,
#                   subtotal, descuento, costo_envio, total, notas, created_at, updated_at,
#                   detalles: list[DetallePedidoResponse]
# - PedidoDetailResponse: PedidoResponse + historial: list[HistorialEstadoResponse]
