# TODO: Implementar servicio de usuarios
#
# Responsabilidades (toda la lógica de negocio):
#
# - get_me(usuario_id: int) → UsuarioDetailResponse
#   · Verificar que no esté soft-deleted (404 si deleted_at IS NOT NULL)
#   · Cargar roles desde UsuarioRolRepository
#
# - update_me(usuario_id: int, data: UsuarioUpdateRequest) → UsuarioResponse
#   · Solo el propio usuario puede modificar sus datos
#   · SET updated_at = now()
#
# - get_all() → list[UsuarioResponse]  [solo ADMIN]
#   · Filtra soft-deleted
#
# - soft_delete(usuario_id: int) → None  [solo ADMIN]
#   · SET deleted_at = now()
#   · Revocar todos sus RefreshTokens activos
