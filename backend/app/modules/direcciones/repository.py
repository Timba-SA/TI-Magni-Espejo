# TODO: Implementar repositorio de direcciones
#
# DireccionRepository(BaseRepository[DireccionEntrega])
#
# Métodos adicionales:
# + get_all_by_usuario(usuario_id: int) → list[DireccionEntrega]
#   (filtra WHERE deleted_at IS NULL AND usuario_id = X)
#
# + get_principal_by_usuario(usuario_id: int) → DireccionEntrega | None
#   (filtra WHERE es_principal = true AND deleted_at IS NULL)
#
# + soft_delete(direccion: DireccionEntrega) → None
#   (SET deleted_at = now())
#
# Regla: NUNCA commit/rollback aquí.
