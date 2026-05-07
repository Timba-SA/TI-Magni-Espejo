# TODO: Implementar servicio de direcciones
#
# Responsabilidades (toda la lógica de negocio):
#
# - get_mis_direcciones(usuario_id: int) → list[DireccionResponse]
#   · Solo activas (deleted_at IS NULL)
#
# - create(usuario_id: int, data: DireccionCreateRequest) → DireccionResponse
#   · SET created_at = now(), updated_at = now()
#
# - update(direccion_id: int, usuario_id: int, data: DireccionUpdateRequest) → DireccionResponse
#   · Verificar ownership (403 si la dirección no pertenece al usuario)
#   · SET updated_at = now()
#
# - set_principal(direccion_id: int, usuario_id: int) → DireccionResponse
#   · Verificar ownership
#   · Desactivar es_principal de TODAS las demás del usuario
#   · Activar es_principal de esta
#   · TODO: hacerlo en una sola transacción (UoW)
#
# - delete(direccion_id: int, usuario_id: int) → None
#   · Soft-delete. Verificar ownership.
#   · 409 si la dirección tiene pedidos activos (estado != terminal)
