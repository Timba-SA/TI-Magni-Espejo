# TODO: Implementar router de pedidos
#
# Prefix: /api/v1/pedidos
# Tags: ["Pedidos"]
#
# Endpoints:
# GET  /formas-pago         → 200 list[FormaPagoResponse]       [Bearer]
# GET  /                    → 200 list[PedidoResponse]           [Bearer]
#   CLIENT: solo sus pedidos | ADMIN/PEDIDOS: todos
# POST /                    → 201 PedidoResponse                 [Bearer]
# GET  /{id}                → 200 PedidoDetailResponse           [Bearer]
# PATCH /{id}/estado        → 200 PedidoResponse                 [Bearer, ADMIN/PEDIDOS]
#
# Todos requieren Depends(get_current_user).
# La validación de permisos (rol) va en el SERVICE, no en el router.
# CERO lógica de negocio en el router.
#
# Nota: GET / para admin devuelve TODOS. El service detecta el rol.
