# TODO: Implementar schemas de usuarios
#
# Schemas requeridos:
#
# --- Response ---
# - UsuarioResponse: id, nombre, apellido, email, celular?, created_at
#   (NUNCA exponer password_hash ni deleted_at)
#
# - UsuarioDetailResponse: UsuarioResponse + roles: list[str]
#
# --- Request (admin) ---
# - UsuarioUpdateRequest: nombre?, apellido?, celular?
#   (email no se modifica por seguridad, requiere flujo aparte)
#
# Nota: el schema de registro está en auth/schemas.py (RegisterRequest)
