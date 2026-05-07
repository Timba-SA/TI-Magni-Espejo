# TODO: Implementar repositorio de usuarios
#
# UsuarioRepository(BaseRepository[Usuario])
#
# Métodos adicionales sobre BaseRepository:
# + get_by_email(email: str) → Usuario | None
#   (para login y validación de email único en registro)
#
# + get_all_active() → list[Usuario]
#   (filtra WHERE deleted_at IS NULL)
#
# + soft_delete(usuario: Usuario) → None
#   (SET deleted_at = now(), NO eliminar físicamente)
#
# Regla: NUNCA commit/rollback aquí.
