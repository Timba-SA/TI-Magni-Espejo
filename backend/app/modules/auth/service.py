# TODO: Implementar servicio de auth
#
# Responsabilidades (toda la lógica de negocio):
#
# - register(data: RegisterRequest) → TokenResponse
#   · Verificar email único (409 si ya existe)
#   · Hashear password con bcrypt cost >= 12
#   · Crear Usuario + asignar rol CLIENT por defecto (via UoW)
#   · Generar access_token (JWT) + refresh_token
#   · Guardar RefreshToken (hash SHA-256) via UoW
#
# - login(data: LoginRequest) → TokenResponse
#   · Verificar email + bcrypt.verify(password, hash)
#   · 401 si credenciales inválidas
#   · Generar nuevos tokens
#
# - refresh(token: str) → TokenResponse
#   · Validar token_hash en DB (activo + no expirado)
#   · Rotar: revocar anterior, emitir nuevos
#
# - logout(token: str) → None
#   · SET revoked_at = now() en RefreshToken
#
# JWT payload: { sub: usuario_id, roles: ["CLIENT"], exp: ... }
# Duración access_token: 15 min | refresh_token: 7 días
