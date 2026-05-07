# TODO: Implementar repositorios de auth
#
# Repositorios requeridos (heredan de BaseRepository):
#
# - RolRepository(BaseRepository[Rol])
#   + get_by_codigo(codigo: str) → Rol | None
#
# - UsuarioRolRepository(BaseRepository[UsuarioRol])
#   + get_roles_by_usuario(usuario_id: int) → list[UsuarioRol]
#
# - RefreshTokenRepository(BaseRepository[RefreshToken])
#   + get_by_token_hash(token_hash: str) → RefreshToken | None
#   + revoke_all_by_usuario(usuario_id: int) → None
#
# Regla: NUNCA hacer commit/rollback aquí. Solo queries SQLAlchemy.
