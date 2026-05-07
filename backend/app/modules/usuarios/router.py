# TODO: Implementar router de usuarios
#
# Prefix: /api/v1/usuarios
# Tags: ["Usuarios"]
#
# Endpoints:
# GET  /me           → 200 UsuarioDetailResponse  [requiere Bearer]
# PATCH /me          → 200 UsuarioResponse         [requiere Bearer]
# GET  /             → 200 list[UsuarioResponse]   [solo ADMIN]
# DELETE /{id}       → 204 No Content              [solo ADMIN, soft-delete]
#
# Seguridad: todos requieren Depends(get_current_user)
# CERO lógica de negocio en el router.
