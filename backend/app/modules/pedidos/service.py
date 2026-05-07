# TODO: Implementar servicio de pedidos
#
# Responsabilidades (TODA la lógica de negocio):
#
# - get_formas_pago() → list[FormaPagoResponse]
#   · Solo las habilitadas (para nuevo checkout)
#
# - get_mis_pedidos(usuario_id: int) → list[PedidoResponse]
#
# - get_pedido(pedido_id: int, usuario_id: int, roles: list) → PedidoDetailResponse
#   · ADMIN/PEDIDOS pueden ver cualquier pedido
#   · CLIENT solo ve sus propios (403 si no es dueño)
#
# - crear(usuario_id: int, data: CrearPedidoRequest) → PedidoResponse
#   · Validar que todos los productos existen y están disponibles
#   · Calcular subtotal: sum(precio_base * cantidad) para cada item
#   · Calcular total: subtotal - descuento(0) + costo_envio(50.00)
#   · Capturar snapshots: nombre_snapshot, precio_snapshot (RN-04)
#   · Validar personalizacion: solo IDs con es_removible=true
#   · Estado inicial: PENDIENTE
#   · Crear primer HistorialEstadoPedido con estado_desde=NULL (RN-02)
#   · Decrementar stock_cantidad de cada Producto
#   · Todo en una sola transacción (UoW)
#
# - avanzar_estado(pedido_id, usuario_id, roles, data: AvanzarEstadoRequest) → PedidoResponse
#   · Validar transición FSM según mapa (RN-01, RN-05)
#   · Validar permisos por rol (ej: solo ADMIN/PEDIDOS cancelan desde EN_PREP)
#   · UPDATE Pedido.estado_codigo
#   · INSERT HistorialEstadoPedido (RN-03)
#   · Todo atomico via UoW.__exit__() (RN ver notas ERD)
#
# Mapa FSM (validar aquí, NO en router):
# FSM = {
#   "PENDIENTE":  ["CONFIRMADO", "CANCELADO"],
#   "CONFIRMADO": ["EN_PREP", "CANCELADO"],
#   "EN_PREP":    ["EN_CAMINO", "CANCELADO"],
#   "EN_CAMINO":  ["ENTREGADO"],
#   "ENTREGADO":  [],
#   "CANCELADO":  [],
# }
