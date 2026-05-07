# TODO: Implementar repositorios de pedidos
#
# --- PedidoRepository(BaseRepository[Pedido]) ---
# + get_all_by_usuario(usuario_id: int) → list[Pedido]
#   (filtra WHERE deleted_at IS NULL AND usuario_id = X, ORDER BY created_at DESC)
#
# + get_all_active() → list[Pedido]
#   (para ADMIN/PEDIDOS: filtra WHERE deleted_at IS NULL)
#
# --- DetallePedidoRepository ---
# + get_by_pedido(pedido_id: int) → list[DetallePedido]
#
# --- HistorialEstadoPedidoRepository ---
# + get_by_pedido(pedido_id: int) → list[HistorialEstadoPedido]
#   (ORDER BY created_at ASC para reconstruir FSM)
# + add_entrada(entrada: HistorialEstadoPedido) → HistorialEstadoPedido
#   (solo INSERT, jamás UPDATE)
#
# --- EstadoPedidoRepository(BaseRepository[EstadoPedido]) ---
# + get_by_codigo(codigo: str) → EstadoPedido | None
#
# --- FormaPagoRepository(BaseRepository[FormaPago]) ---
# + get_habilitados() → list[FormaPago]
#   (filtra WHERE habilitado = true)
#
# Regla: NUNCA commit/rollback aquí.
