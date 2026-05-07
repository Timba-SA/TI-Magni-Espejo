# TODO: Implementar modelos de auth
#
# Tablas del Dominio 1 - Identidad & Acceso:
#
# - Rol <<Catalog>>
#   PK semántica: codigo VARCHAR(20)
#   Valores seed: ADMIN | STOCK | PEDIDOS | CLIENT
#
# - UsuarioRol <<Link>>
#   PK compuesta: (usuario_id, rol_codigo)
#   FK: usuario_id → Usuario.id
#   FK: rol_codigo → Rol.codigo
#
# - RefreshToken <<Session>>
#   token_hash: CHAR(64) SHA-256 del refresh token, NUNCA plaintext
#   revoked_at: NULL = activo
#
# Nota: Usuario y DireccionEntrega están en sus propios módulos.
