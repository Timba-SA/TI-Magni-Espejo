# TODO: Implementar router de auth
#
# Prefix: /api/v1/auth
# Tags: ["Auth"]
#
# Endpoints:
# POST /register → 201 TokenResponse
# POST /login    → 200 TokenResponse
# POST /refresh  → 200 TokenResponse
# POST /logout   → 204 No Content
#
# Regla: el router SOLO valida schemas y delega al AuthService.
# CERO lógica de negocio aquí.
#
# Seguridad:
# - /login → sin autenticación
# - /logout → requiere Bearer token válido (Depends(get_current_user))
